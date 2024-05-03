import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { UserMongo } from 'src/schemas/user.schema';
import { VinylMongo } from 'src/schemas/vinyl.schema';
import { User, Vinyl } from 'src/types';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UpdateVinylDto } from 'src/vinyls/dto/update-vinyl.dto';
import { VinylDto } from 'src/vinyls/dto/vinyl.dto';
import stripe from 'stripe';

@Injectable()
export class StripeService {
  Stripe: stripe = new stripe(
    this.configService.get<string>('STRIPE_API_KEY') as string,
  );
  constructor(private configService: ConfigService) {}

  async createStripeUser(name: string, email: string) {
    return this.Stripe.customers.create({
      name: name,
      email: email,
    });
  }

  async updateStripeUser(user: UserMongo, updateDto: UpdateUserDto) {
    return this.Stripe.customers.update(user.stripeId, {
      name: updateDto.firstName + ' ' + updateDto.lastName,
    });
  }

  async deleteStripeUser(user: User) {
    return this.Stripe.customers.del(user.stripeId);
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

  async createStripeCheckout(user: UserMongo, vinyl: VinylMongo) {
    return this.Stripe.checkout.sessions.create({
      success_url: `${this.configService.get('HOST')}vinyls/getVinyl?vinylId=${vinyl._id}&userId=${user._id}`,
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

  async updateStripeVinyl(vinyl: Vinyl, updateVinylDto: UpdateVinylDto) {
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

  async deleteStripeVinyl(vinyl: Vinyl) {
    if (vinyl) {
      return this.Stripe.products.update(vinyl.stripeProdId, { active: false });
    }
    throw new HttpException('Can not find the vinyl', 400);
  }
}
