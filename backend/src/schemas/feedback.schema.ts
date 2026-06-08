import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ required: true, unique: true, index: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comments: string;

  @Prop()
  suggestions: string;

  @Prop({ enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] })
  sentiment: string;

  @Prop()
  analyzedAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
