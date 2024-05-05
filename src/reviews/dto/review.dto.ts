import { IsString, Length } from 'class-validator';
import mongoose from 'mongoose';

export class ReviewDto {
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message:
      'The description must be at least 2 and no more than 100 characters',
  })
  vinylId: { type: mongoose.Schema.Types.ObjectId; ref: 'VinylMongo' };

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message:
      'The description must be at least 2 and no more than 100 characters',
  })
  comment: string;

  @IsString()
  score: string;
}
