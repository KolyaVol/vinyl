import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findOne(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (user) {
      const payload = {
        username: (await user).email,
        roles: (await user).roles || 'USER',
      };
      const token = this.jwtService.sign(payload);

      (await user).jwtWhiteList.push(token);
      (await user).save();
      return {
        access_token: token,
      };
    }
    return new HttpException('Invalid credentials', 401);
  }

  async googleLogin(req: any) {
    if (!(await req).user) {
      return 'No user from google';
    }
    const { email, name, picture } = (await req).user;

    const user = await this.usersService.findOne(email);
    if (user) {
      const userToken = this.jwtService.sign({
        username: email,
        roles: user.roles,
      });
      user.jwtWhiteList.push(userToken);
      user.save();
      return {
        message: 'Login successful',
        access_token: userToken,
      };
    }

    const createdUser = await this.usersService.createGoogleUser(
      email,
      name,
      picture,
    );
    const token = this.jwtService.sign({ username: email, role: 'USER' });
    createdUser.jwtWhiteList.push(token);
    createdUser.save();
    return {
      message: 'Login successful',
      access_token: token,
    };
  }
}
