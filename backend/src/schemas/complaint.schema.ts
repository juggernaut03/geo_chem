import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ComplaintDocument = Complaint & Document;

@Schema({ timestamps: true })
export class Complaint {
  @Prop({ required: true, unique: true })
  ticketId: string;

  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;

  @Prop({ enum: ['DELAY', 'PICKUP', 'QUALITY', 'OTHER'], required: true })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' })
  severity: string;

  @Prop({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], default: 'OPEN' })
  status: string;

  @Prop()
  resolution: string;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
