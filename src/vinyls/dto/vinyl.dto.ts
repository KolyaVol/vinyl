import { IsNumber, IsString, Length, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0.01)
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
