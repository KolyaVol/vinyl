import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtWhiteGuard } from './auth/guards/jwtWhiteList/jwtWhite.guard';
import { RoleGuard } from './auth/guards/role/role.guard';
import { Model } from 'mongoose';
import { LogMongo } from './schemas/log.schema';
import { InjectModel } from '@nestjs/mongoose';

@Controller()
export class AppController {
  constructor(
    @InjectModel(LogMongo.name)
    private logModel: Model<LogMongo>,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/logs')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  getLogs() {
    return this.logModel.find();
  }
}
