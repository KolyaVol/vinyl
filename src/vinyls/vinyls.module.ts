import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VinylMongo, VinylSchema } from 'src/schemas/vinyl.schema';
import { VinylsController } from './vinyls.controller';
import { VinylsService } from './vinyls.service';
import { UsersModule } from 'src/users/users.module';
import { ReviewMongo, ReviewSchema } from 'src/schemas/review.schema';
import { JwtService } from '@nestjs/jwt';
import { LogMongo, LogSchema } from 'src/schemas/log.schema';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  imports: [
    UsersModule,

    MongooseModule.forFeature([
      { name: VinylMongo.name, schema: VinylSchema },
      { name: ReviewMongo.name, schema: ReviewSchema },
      { name: LogMongo.name, schema: LogSchema },
    ]),
  ],
  controllers: [VinylsController],
  providers: [VinylsService, JwtService, StripeService],
})
export class VinylsModule {}
