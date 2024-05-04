import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ReviewMongo } from './review.schema';
import { UserMongo } from './user.schema';

export type VinylDocument = HydratedDocument<VinylMongo>;

@Schema({ collection: 'vinyls' })
export class VinylMongo {
  @Prop()
  stripePriceId: string;

  @Prop()
  stripeProdId: string;

  @Prop({ default: null })
  discogProdId: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ default: 0 })
  averageScore: number;

  @Prop({ default: 0 })
  amountOfScores: number;

  @Prop({ default: 0 })
  averageDiscogScore: number;

  @Prop({ default: 0 })
  amountOfDiscogScores: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserMongo' })
  usersId: UserMongo[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReviewMongo' }],
  })
  reviews: ReviewMongo[];

  _id: { type: mongoose.Schema.Types.ObjectId; ref: 'VinylMongo' };
}

export const VinylSchema = SchemaFactory.createForClass(VinylMongo);
