import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CounterDocument = Counter & Document;

@Schema()
export class Counter {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: 1000 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
