import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log(new Date('01-01-1998'));

    return 'Hello World!';
  }
}
