import { IsDateString, IsString, IsUrl, Length } from 'class-validator';

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

  @IsDateString()
  birthDate: Date;

  @IsUrl()
  avatar: string;
}
