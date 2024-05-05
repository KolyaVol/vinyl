import { IsString, IsUrl, Length } from 'class-validator';
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

  @IsString()
  price: string;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message:
      'The description must be at least 2 and no more than 100 characters',
  })
  description: string;

  @IsUrl()
  image: string;
}
