import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request as Req } from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { JwtWhiteGuard } from 'src/auth/guards/jwtWhiteList/jwtWhite.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('/register')
  @UsePipes(new ValidationPipe())
  async createUser(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @Post('/login')
  @UsePipes(new ValidationPipe())
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(
      this.usersService.findOne(loginUserDto.email),
    );
  }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req: Req) {}

  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Request() req: Req) {
    return this.authService.googleLogin(req);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  async getUser(@Request() req: Req) {
    return this.usersService.getUser(req);
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  async logout(@Request() req: Req) {
    return this.usersService.logout(req);
  }

  @Post('/admin')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  async addAdminRole(@Request() req: Req) {
    return this.usersService.addAdminRole(req);
  }

  @Patch('/update')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(@Request() req: Req, @Body() updateDto: UpdateUserDto) {
    return this.usersService.updateUser(req, updateDto);
  }

  @Delete('/delete')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard)
  async deleteUser(@Request() req: Req) {
    return this.usersService.deleteUser(req);
  }
}
