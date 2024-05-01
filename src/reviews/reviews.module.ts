import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VinylMongo, VinylSchema } from 'src/schemas/vinyl.schema';
import { UsersModule } from 'src/users/users.module';
import { ReviewMongo, ReviewSchema } from 'src/schemas/review.schema';
import { JwtService } from '@nestjs/jwt';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { VinylsService } from 'src/vinyls/vinyls.service';
import { LogMongo, LogSchema } from 'src/schemas/log.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: VinylMongo.name, schema: VinylSchema },
      { name: ReviewMongo.name, schema: ReviewSchema },
      { name: LogMongo.name, schema: LogSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [JwtService, ReviewsService, VinylsService],
})
export class ReviewsModule {}
