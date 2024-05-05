import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';
import { VinylMongo } from 'src/schemas/vinyl.schema';
import { UsersService } from 'src/users/users.service';
import { Request } from 'supertest';
import { VinylDto } from './dto/vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { QueryParams, Vinyl } from 'src/types';
import { UserMongo } from 'src/schemas/user.schema';
import { LogMongo } from 'src/schemas/log.schema';
import { StripeService } from 'src/stripe/stripe.service';
import { DiscogsService } from 'src/discogs/discogs.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class VinylsService {
  constructor(
    @InjectModel(VinylMongo.name)
    private vinylModel: Model<VinylMongo>,
    @InjectModel(LogMongo.name)
    private logModel: Model<LogMongo>,

    private configService: ConfigService,
    private usersSerivce: UsersService,
    private stripeService: StripeService,
    private discogsService: DiscogsService,
  ) {}

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
      const stripeVinyl = await this.stripeService.createStripeVinyl(vinylDto);

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

  async createVinylFromDiscog(recordId: string) {
    if (recordId) {
      const recordData = await this.discogsService.getRecord({ id: recordId });
      const stripeVinyl = await this.stripeService.createStripeVinyl({
        name: recordData.name,
        price: recordData.price,
      });

      const vinyl = new this.vinylModel({
        stripePriceId: stripeVinyl.default_price,
        stripeProdId: stripeVinyl.id,
        discogProdId: recordId,
        author: recordData.author,
        name: recordData.name,
        price: recordData.price,
        description: 'Coming soon...',
        image: recordData.image,
        averageDiscogScore: recordData.averageDiscogScore,
        amountOfDiscogScores: recordData.amountOfDiscogScores,
      });
      vinyl.save();

      this.logModel.create({
        message: `Vinyl ${recordData.name} ${recordData.author} created at ${new Date()}`,
      });

      return vinyl;
    }
    throw new HttpException('Invalid data', 400);
  }

  async getAllVinyls(req: Request, query: QueryParams) {
    let user: null | UserMongo = null;
    if ((await req).headers.authorization) {
      user = await this.usersSerivce.getUserFromReq(req);
    }
    await this.updateAllDiscogsVinyls();
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
      let firstAnotherReview = null;
      if (vinyl.reviews[0]) {
        if (user) {
          firstAnotherReview = vinyl.reviews.find(
            (review) =>
              JSON.stringify(review.userId) !== JSON.stringify(user._id),
          );
        } else firstAnotherReview = vinyl.reviews[0];
      }

      return { vinyl, firstAnotherReview };
    });

    return result;
  }

  async updateVinyl(updateVinylDto: UpdateVinylDto) {
    const vinyl = await this.vinylModel.findById(updateVinylDto._id);
    const stripeVinyl = await this.stripeService.updateStripeVinyl(
      vinyl,
      updateVinylDto,
    );

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

  async updateDiscogsVinyl(vinylId: ObjectId) {
    const vinyl = await this.vinylModel.findById(vinylId);

    const recordData = await this.discogsService.getRecord({
      id: vinyl?.discogProdId as string,
    });

    const stripeVinyl = await this.stripeService.updateStripeVinyl(vinyl, {
      name: recordData.name,
      price: Number(recordData.price).toFixed(2),
    });

    this.logModel.create({
      message: `Vinyl with id ${vinylId} updated at ${new Date()} with data: ${recordData}`,
    });

    return this.vinylModel.findOneAndUpdate(
      { _id: vinylId },
      {
        stripePriceId: stripeVinyl.default_price,
        stripeProdId: stripeVinyl.id,
        author: recordData.author,
        name: recordData.name,
        price: Number(recordData.price).toFixed(2),
        description: 'Coming soon...',
        image: recordData.image,
      },
      {
        new: true,
      },
    );
  }

  async updateAllDiscogsVinyls() {
    const vinyls = await this.vinylModel.find({ discogProdId: { $ne: null } });
    vinyls.forEach((vinyl: Vinyl) => {
      if (vinyl) {
        this.updateDiscogsVinyl(vinyl._id as unknown as ObjectId);
      }
    });
  }

  async deleteVinyl(reqBody: { _id: string }) {
    const vinyl = await this.vinylModel.findById(reqBody._id);
    await this.stripeService.deleteStripeVinyl(vinyl);
    this.logModel.create({
      message: `Vinyl with id ${reqBody._id} deleted at ${new Date()}`,
    });
    return this.vinylModel.deleteOne({ _id: reqBody._id });
  }

  async bueVinyl(req: Request, query: { userId: string; vinylId: string }) {
    const user = await this.usersSerivce.findOneById(query.userId);
    const vinyl = await this.vinylModel.findOne({ _id: query.vinylId });
    if (user && vinyl) {
      return this.stripeService.createStripeCheckout(user, vinyl);
    }
    throw new HttpException('Can not find user or product', 400);
  }

  async getVinyl(query: { userId: string; vinylId: string }) {
    const user = await this.usersSerivce.findOneById(query.userId);
    const vinyl = await this.vinylModel.findOne({ _id: query.vinylId });
    if (user && vinyl) {
      user.vinyls?.push(vinyl);
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
