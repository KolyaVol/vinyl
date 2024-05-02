import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';
import { VinylMongo } from 'src/schemas/vinyl.schema';
import { UsersService } from 'src/users/users.service';
import { Request } from 'supertest';
import { VinylDto } from './dto/vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import nodemailer from 'nodemailer';
import stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { QueryParams } from 'src/types';
import { UserMongo } from 'src/schemas/user.schema';
import { LogMongo } from 'src/schemas/log.schema';

@Injectable()
export class VinylsService {
  Stripe: stripe;
  constructor(
    private configService: ConfigService,
    private usersSerivce: UsersService,

    @InjectModel(VinylMongo.name)
    private vinylModel: Model<VinylMongo>,
    @InjectModel(LogMongo.name)
    private logModel: Model<LogMongo>,
  ) {
    this.Stripe = new stripe(
      configService.get<string>('STRIPE_API_KEY') as string,
    );
  }

  private transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: this.configService.get<string>('MAIL'),
      pass: this.configService.get<string>('PASSWORD'),
    },
  });

  async findById(
    id: { type: mongoose.Schema.Types.ObjectId; ref: 'VinylMongo' } | undefined,
  ) {
    return this.vinylModel.findById(id);
  }

  async createVinyl(vinylDto: VinylDto) {
    if (vinylDto) {
      const stripeVinyl = await this.createStripeVinyl(vinylDto);

      const vinyl = new this.vinylModel({
        stripePriceId: stripeVinyl.default_price,
        stripeProdId: stripeVinyl.id,
        author: vinylDto.author,
        name: vinylDto.name,
        price: vinylDto.price,
        description: vinylDto.description,
        image: vinylDto.image,
      });
      vinyl.save();

      this.logModel.create({
        message: `Vinyl ${vinylDto.name} ${vinylDto.author} created at ${new Date()}`,
      });

      return vinyl;
    }
    throw new HttpException('Invalid data', 400);
  }

  async createStripeVinyl(vinylDto: VinylDto) {
    return this.Stripe.products.create({
      name: vinylDto.name,
      default_price_data: {
        currency: 'usd',
        unit_amount: Math.ceil(vinylDto.price * 100),
      },
    });
  }

  async getAllVinyls(req: Request, query: QueryParams) {
    let user: null | UserMongo = null;
    if ((await req).headers.authorization) {
      user = await this.usersSerivce.getUserFromReq(req);
    }
    const { orderBy, order, filterName, filterAuthor, limit, offset } = query;

    let filterSettings = {};
    if (user) {
      if (filterName && filterAuthor) {
        filterSettings = {
          name: filterName,
          author: filterAuthor,
        };
      } else if (filterName && !filterAuthor) {
        filterSettings = {
          name: filterName,
        };
      } else if (!filterName && filterAuthor) {
        filterSettings = {
          author: filterAuthor,
        };
      }
    }

    const vinyls = await this.vinylModel
      .find(filterSettings)
      .populate('reviews')
      .sort([[orderBy || 'name', (order as SortOrder) || 'asc']])
      .limit(limit || 10)
      .skip(offset || 0);

    const result = vinyls.map((vinyl) => {
      let firstAnotherReview;
      if (vinyl.reviews[0]) {
        if (user) {
          firstAnotherReview = vinyl.reviews.find(
            (review) => review.userId !== user._id,
          );
        }
        firstAnotherReview = vinyl.reviews[0];
      }

      return { vinyl, firstAnotherReview };
    });

    return result;
  }

  async updateVinyl(updateVinylDto: UpdateVinylDto) {
    const stripeVinyl = await this.updateStripeVinyl(updateVinylDto);

    this.logModel.create({
      message: `Vinyl with id ${updateVinylDto._id} updated at ${new Date()} with data: ${updateVinylDto}`,
    });

    return this.vinylModel.findOneAndUpdate(
      { _id: updateVinylDto._id },
      {
        stripePriceId: stripeVinyl.default_price,
        stripeProdId: stripeVinyl.id,
        author: updateVinylDto.author,
        name: updateVinylDto.name,
        price: updateVinylDto.price,
        description: updateVinylDto.description,
        image: updateVinylDto.image,
      },
      {
        new: true,
      },
    );
  }

  async updateStripeVinyl(updateVinylDto: UpdateVinylDto) {
    const vinyl = await this.vinylModel.findById(updateVinylDto._id);
    if (vinyl) {
      const price = await this.Stripe.prices.create({
        currency: 'usd',
        unit_amount: updateVinylDto.price * 100,
        product: vinyl.stripeProdId,
      });

      const product = await this.Stripe.products.update(vinyl.stripeProdId, {
        name: updateVinylDto.name,
        default_price: price.id,
      });

      if (!product) {
        throw new HttpException('Can not update stripe product', 400);
      }
      return product;
    }
    throw new HttpException('Can not find nonexistent product', 400);
  }

  async deleteVinyl(reqBody: { _id: string }) {
    await this.deleteStripeVinyl(reqBody._id);
    this.logModel.create({
      message: `Vinyl with id ${reqBody._id} deleted at ${new Date()}`,
    });
    return this.vinylModel.deleteOne({ _id: reqBody._id });
  }

  async deleteStripeVinyl(id: string) {
    const vinyl = await this.vinylModel.findById(id);
    if (vinyl) {
      return this.Stripe.products.update(vinyl.stripeProdId, { active: false });
    }
    throw new HttpException('Can not find the vinyl', 400);
  }

  async bueVinyl(req: Request, query: { userId: string; vinylId: string }) {
    const user = await this.usersSerivce.findOneById(query.userId);
    const vinyl = await this.vinylModel.findOne({ _id: query.vinylId });
    if (user && vinyl) {
      return this.Stripe.checkout.sessions.create({
        success_url: `http://0.0.0.0:10000/vinyls/getVinyl?vinylId=${vinyl._id}&userId=${user._id}`,
        customer: user.stripeId,
        line_items: [
          {
            price: vinyl.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
      });
    }
    throw new HttpException('Can not find user or product', 400);
  }

  async getVinyl(query: { userId: string; vinylId: string }) {
    const user = await this.usersSerivce.findOneById(query.userId);
    const vinyl = await this.vinylModel.findOne({ _id: query.vinylId });
    if (user && vinyl) {
      user.vinyls.push(vinyl);
      user.save();

      this.transporter.sendMail({
        from: process.env.MAIL,
        to: user.email,
        subject: 'Vinyl bought successfully',
        text: 'Vinyl bought successfully',
        html: `<h2>Hello!</h2>
            <p>Dear ${user.firstName}, you successfully purchased new Vinyl(${vinyl.name})!</p>`,
      });
      return user;
    }
    throw new HttpException(
      'User or Vinyl is invalid! Thanks for payment:)',
      400,
    );
  }
}
