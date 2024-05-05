import {
  IsDateString,
  IsEmail,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Incorrect email' })
  readonly email: string;

  @IsString({ message: 'Must be a string' })
  @Length(4, 16, {
    message: 'The password must be at least 4 and no more than 16 characters',
  })
  readonly password: string;

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

  @IsDateString()
  birthDate: Date;

  @IsUrl()
  avatar: string;
}
