import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewDto } from './dto/review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtWhiteGuard } from 'src/auth/guards/jwtWhiteList/jwtWhite.guard';
import { RoleGuard } from 'src/auth/guards/role/role.guard';
import { Request } from 'supertest';
import { ReviewsService } from './reviews.service';
import { ObjectId } from 'mongodb';

@Controller('vinyls')
export class ReviewsController {
  constructor(private reviewService: ReviewsService) {}

  @Post('/review/create')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  async createReview(@Req() req: Request, @Body() reviewDto: ReviewDto) {
    return this.reviewService.createReview(req, reviewDto);
  }

  @Get('/reviews')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  async getReviews(
    @Query() query: { vinylId: string; limit: string; offset: string },
  ) {
    return this.reviewService.getReviews(query);
  }

  @Patch('/review/update')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async updateReview(@Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.updateReview(updateReviewDto);
  }

  @Delete('/review/delete')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async deleteReview(
    @Body() id: { _id: { type: ObjectId; ref: 'VinylMongo' } },
  ) {
    return this.reviewService.deleteReview(id);
  }
}
