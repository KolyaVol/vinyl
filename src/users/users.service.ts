import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserMongo } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'supertest';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogMongo } from 'src/schemas/log.schema';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserMongo.name)
    private userModel: Model<UserMongo>,
    @InjectModel(LogMongo.name)

    private logModel: Model<LogMongo>,
    private jwtService: JwtService,
    private stripeService: StripeService,
  ) {}

  async decodeToken(req: Request) {
    if ((await req).headers.authorization) {
      const token = (await req).headers.authorization?.split(' ')[1];
      return this.jwtService.decode(token);
    }
    throw new HttpException('No token provided', 400);
  }

  async findOne(email: string) {
    return this.userModel.findOne({ email: email });
  }
  async findOneById(id: string) {
    return this.userModel.findById(id);
  }

  async getUserFromReq(req: Request) {
    const decodedToken = await this.decodeToken(req);
    return this.findOne(decodedToken.username);
  }

  async createUser(reqBody: CreateUserDto) {
    const { email, password, firstName, lastName, birthDate, avatar } = reqBody;

    if (await this.findOne(email)) {
      return new HttpException('Email already in use', 409);
    }
    const stripeUser = await this.stripeService.createStripeUser(
      firstName + ' ' + lastName,
      email,
    );

    const user: UserMongo = {
      stripeId: stripeUser.id,
      email,
      password,
      firstName,
      lastName,
      birthDate,
      avatar,
    };

    const createdUser = new this.userModel(user);

    await createdUser.save();

    this.logModel.create({
      message: `User ${firstName}  ${lastName} created at ${new Date()}`,
    });

    return createdUser;
  }

  async createGoogleUser(email: string, name: string, picture: string) {
    const stripeUser = await this.stripeService.createStripeUser(name, email);
    const createdUser = new this.userModel({
      stripeId: stripeUser.id,
      email: email,
      firstName: name.split(' ')[0] || 'Anonymous',
      lastName: name.split(' ')[1] || 'Anonymousov',
      avatar:
        picture ||
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpNI3glT_3CehQckX33a1GGstagxSzh2bdA&s',
    });

    this.logModel.create({
      message: `User ${name} created at ${new Date()}`,
    });

    return createdUser;
  }

  async getUser(req: Request) {
    if (typeof (await req).headers.authorization === 'string') {
      const decodedToken = await this.decodeToken(req);
      const user = await this.userModel
        .findOne({
          email: decodedToken.username,
        })
        .populate('vinyls')
        .populate('reviews');
      if (user) {
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          birthDate: user.birthDate,
          avatar: user.avatar,
          vinyls: user.vinyls || [],
          reviews: user.reviews || [],
        };
      } else throw new HttpException("Can't find user", 400);
    }
  }

  async logout(req: Request) {
    const token = (await req).headers.authorization?.split(' ')[1];
    const user = await this.getUserFromReq(req);

    if (user) {
      const updatedJwtWhiteList = user.jwtWhiteList?.filter((t) => t !== token);

      user.jwtWhiteList = updatedJwtWhiteList;

      await user.save();
      return 'User logged out';
    }
    throw new Error('User not found');
  }

  async updateUser(req: Request, updateDto: UpdateUserDto) {
    const user = await this.getUserFromReq(req);

    if (user) {
      await this.stripeService.updateStripeUser(user, updateDto);

      this.logModel.create({
        message: `User ${user.firstName}  ${user.lastName} updated at ${new Date()} with this Data: ${updateDto}`,
      });

      return this.userModel.findOneAndUpdate(
        { email: user.email },
        {
          firstName: updateDto.firstName,
          lastName: updateDto.lastName,
          birthDate: updateDto.birthDate,
          avatar: updateDto.avatar,
        },
        {
          new: true,
        },
      );
    }
    throw new HttpException('Can not find this user', 400);
  }

  async deleteUser(req: Request) {
    const user = await this.getUserFromReq(req);
    if (user) {
      await this.stripeService.deleteStripeUser(user);

      this.logModel.create({
        message: `User ${user.firstName}  ${user.lastName} deleted at ${new Date()}`,
      });
    }

    return this.userModel.deleteOne({ email: user?.email });
  }

  async addAdminRole(req: Request) {
    const user = await this.getUserFromReq(req);
    if (user && (await req).body.password === 'admin1234') {
      if (user.roles?.some((role) => role === 'ADMIN')) {
        return user;
      }
      user.roles?.push('ADMIN');

      user.save();

      this.logModel.create({
        message: `User ${user.firstName}  ${user.lastName} is now ADMIN! Current date: ${new Date()}`,
      });
      return user;
    }
    return new HttpException('Unauthorized', 400);
  }
}
