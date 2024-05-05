import { IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message:
      'The first name must be at least 2 and no more than 100 characters',
  })
  firstName: string;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The last name must be at least 2 and no more than 100 characters',
  })
  lastName: string;

  @IsString({ message: 'Must be a string' })
  birthDate: Date;

  @IsString({ message: 'Must be a string' })
  @Length(2, 100, {
    message: 'The avatar must be at least 2 and no more than 100 characters',
  })
  avatar: string;
}
