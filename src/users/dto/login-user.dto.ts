import { IsEmail, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Incorrect email' })
  readonly email: string;

  @IsString({ message: 'Must be a string' })
  @Length(4, 16, {
    message: 'The password must be at least 4 and no more than 16 characters',
  })
  readonly password: string;
}
