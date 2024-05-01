import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReviewDocument = HydratedDocument<ReviewMongo>;

@Schema({ collection: 'reviews' })
export class ReviewMongo {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserMongo' })
  userId: { type: mongoose.Schema.Types.ObjectId; ref: 'UserMongo' };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'VinylMongo' })
  vinylId: { type: mongoose.Schema.Types.ObjectId; ref: 'VinylMongo' };

  @Prop()
  comment: string;

  @Prop()
  score: string;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewMongo);
