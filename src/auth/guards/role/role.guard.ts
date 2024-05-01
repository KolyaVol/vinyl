import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  matchRoles(userRoles: string[]) {
    const nRole = 'ADMIN';
    if (typeof userRoles === 'string') {
      return userRoles === nRole;
    }
    return [...userRoles].some((role) => role === nRole);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRoles = this.jwtService.decode(
      request.headers.authorization.split(' ')[1],
    ).roles;

    return this.matchRoles(userRoles);
  }
}
