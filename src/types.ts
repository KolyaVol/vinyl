import mongoose from 'mongoose';
import { VinylMongo } from './schemas/vinyl.schema';

export type User = {
  _id: any;
  stripeId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  avatar: string;
};

export type Vinyl =
  | (mongoose.Document<unknown, object, VinylMongo> &
      VinylMongo &
      Required<{
        _id: {
          type: mongoose.Schema.Types.ObjectId;
          ref: 'VinylMongo';
        };
      }>)
  | null;

export type QueryParams = {
  orderBy?: string;
  order?: string;
  filterName?: string;
  filterAuthor?: string;
  limit?: number;
  offset?: number;
};
