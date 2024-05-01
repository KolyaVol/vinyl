import { IsNumber, IsString, Length, Max, Min } from 'class-validator';
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

  @IsNumber()
  @Min(0, { message: 'Must be a number  greater or equal to zero' })
  @Max(5, { message: 'Must be a number less or equal to five' })
  score: number;
}
