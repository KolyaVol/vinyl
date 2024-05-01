import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongo, UserSchema } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { LogMongo, LogSchema } from 'src/schemas/log.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),

    MongooseModule.forFeature([
      { name: UserMongo.name, schema: UserSchema },
      { name: LogMongo.name, schema: LogSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService, GoogleStrategy],
  exports: [UsersService],
})
export class UsersModule {}
