import { IsNumber, IsString, Length } from 'class-validator';

export class UpdateReviewDto {
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The _id must be at least 2 and no more than 100 characters',
  })
  _id: string;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The comment must be at least 2 and no more than 100 characters',
  })
  comment: string;

  @IsNumber()
  score: number;
}
