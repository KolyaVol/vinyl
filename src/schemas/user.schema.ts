import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { VinylMongo } from './vinyl.schema';
import { ReviewMongo } from './review.schema';

export type UserDocument = HydratedDocument<UserMongo>;

@Schema({ collection: 'users' })
export class UserMongo {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  stripeId: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: '2007-12-31T21:00:00.000Z' })
  birthDate: Date;

  @Prop({
    default:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpNI3glT_3CehQckX33a1GGstagxSzh2bdA&s',
  })
  avatar: string;

  @Prop({
    default: ['USER'],
  })
  roles: string[];

  @Prop({
    default: [],
  })
  jwtWhiteList: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VinylMongo' }],
  })
  vinyls: VinylMongo[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReviewMongo' }],
  })
  reviews: ReviewMongo[];
  _id: { type: mongoose.Schema.Types.ObjectId; ref: 'UserMongo' };
}

export const UserSchema = SchemaFactory.createForClass(UserMongo);
