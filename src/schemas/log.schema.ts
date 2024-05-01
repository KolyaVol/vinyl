import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LogDocument = HydratedDocument<LogMongo>;

@Schema({ collection: 'logs' })
export class LogMongo {
  @Prop({ required: true })
  message: string;
}

export const LogSchema = SchemaFactory.createForClass(LogMongo);
