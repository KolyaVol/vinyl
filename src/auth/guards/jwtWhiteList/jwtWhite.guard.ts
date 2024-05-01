import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtWhiteGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async matchJwtWhiteList(token: string, user: any) {
    return (await user).jwtWhiteList.some((t: string) => t === token);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    const userData = this.jwtService.decode(token);
    const user = await this.usersService.findOne(userData.username);

    return this.matchJwtWhiteList(token, user);
  }
}
