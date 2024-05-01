import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  secret: process.env.SECRET,
  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  PASSWORD: process.env.PASSWORD,
  MAIL: process.env.MAIL,
}));
