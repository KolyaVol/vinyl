import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { Request } from 'supertest';
import { ReviewMongo } from 'src/schemas/review.schema';
import { ReviewDto } from './dto/review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VinylsService } from 'src/vinyls/vinyls.service';
import { ObjectId } from 'mongodb';
import { LogMongo } from 'src/schemas/log.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(ReviewMongo.name)
    private reviewModel: Model<ReviewMongo>,
    @InjectModel(LogMongo.name)
    private logModel: Model<LogMongo>,

    private usersSerivce: UsersService,
    private vinylsSerivce: VinylsService,
  ) {}

  async createReview(req: Request, reviewDto: ReviewDto) {
    const user = await this.usersSerivce.getUserFromReq(req);
    const vinyl = await this.vinylsSerivce.findById(reviewDto.vinylId);
    if (user && vinyl) {
      const isUserAlreadyRewiewed = await this.reviewModel.findOne({
        userId: user._id,
        vinylId: vinyl._id,
      });
      if (isUserAlreadyRewiewed) {
        throw new HttpException('Already reviewed', 400);
      }
      const review = new this.reviewModel({
        userId: user._id,
        vinylId: reviewDto.vinylId,
        comment: reviewDto.comment,
        score: reviewDto.score,
      });
      review.save();
      const { amountOfScores, averageScore } = vinyl;
      const newScore =
        (+averageScore * +amountOfScores + +reviewDto.score) /
        (+amountOfScores + 1);

      vinyl.averageScore = +newScore.toFixed(2);
      vinyl.amountOfScores += 1;
      vinyl.reviews.push(review);
      await vinyl.save();

      user.reviews?.push(review);
      user.save();

      this.logModel.create({
        message: `User ${user.firstName}  ${user.lastName} create new review of ${vinyl.name} ${vinyl.author} at ${new Date()} with data: ${reviewDto}`,
      });

      return review;
    }
    throw new HttpException('Can not find vinyl or user', 404);
  }

  async getReviews(query: { vinylId: string; limit: string; offset: string }) {
    return this.reviewModel
      .find({ vinylId: query.vinylId })
      .limit(+query.limit || 10)
      .skip(+query.offset || 0);
  }

  async updateReview(updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(updateReviewDto._id);

    const vinyl = await this.vinylsSerivce.findById(review?.vinylId);
    if (review && vinyl) {
      const prevScore = review.score;
      const newScore = updateReviewDto.score;

      const newAverageScore =
        (+vinyl.averageScore * +vinyl.amountOfScores - +prevScore + +newScore) /
        +vinyl.amountOfScores;

      if (!newAverageScore) {
        throw new HttpException('Wrong score', 400);
      }

      vinyl.averageScore = +newAverageScore.toFixed(2);
      await vinyl.save();

      this.logModel.create({
        message: `Review of ${vinyl.name} ${vinyl.author} was updated at ${new Date()} with data: ${updateReviewDto}`,
      });

      return this.reviewModel.findOneAndUpdate(
        { _id: updateReviewDto._id },
        {
          comment: updateReviewDto.comment,
          score: newScore,
        },
        {
          new: true,
        },
      );
    }
    throw new HttpException('Can not find vinyl or review', 404);
  }

  async deleteReview(reqBody: {
    _id: { type: ObjectId; ref: 'VinylMongo' } | undefined;
  }) {
    const review = await this.reviewModel.findById(reqBody._id);
    const vinyl = await this.vinylsSerivce.findById(review?.vinylId);
    if (vinyl && review) {
      const prevScore = review.score;

      let newAverageScore = 0;

      vinyl.amountOfScores != 1
        ? (newAverageScore =
            (+vinyl.averageScore * +vinyl.amountOfScores - +prevScore) /
            (+vinyl.amountOfScores - 1))
        : 0;

      vinyl.averageScore = +newAverageScore.toFixed(2);

      vinyl.amountOfScores -= 1;
      await vinyl.save();

      this.logModel.create({
        message: `Review of ${vinyl.name} ${vinyl.author} was deleted at ${new Date()}`,
      });

      return this.reviewModel.deleteOne({ _id: reqBody._id });
    }
    throw new HttpException('Can not find vinyl', 400);
  }
}
