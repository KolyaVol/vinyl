import { IsString, IsUrl, Length } from 'class-validator';

export class VinylDto {
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
