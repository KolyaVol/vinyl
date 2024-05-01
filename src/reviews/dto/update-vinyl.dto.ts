import { IsNumber, IsString, Length } from 'class-validator';
import { ObjectId } from 'mongoose';

export class UpdateVinylDto {
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The _id must be at least 2 and no more than 100 characters',
  })
  _id: ObjectId;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The name must be at least 2 and no more than 100 characters',
  })
  name: string;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message:
      'The author name must be at least 2 and no more than 100 characters',
  })
  author: string;

  @IsNumber()
  price: number;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message:
      'The description must be at least 2 and no more than 100 characters',
  })
  description: string;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The image must be at least 2 and no more than 100 characters',
  })
  image: string;
}
