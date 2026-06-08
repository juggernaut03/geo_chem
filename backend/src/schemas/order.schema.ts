import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../common/enums';

export type OrderDocument = Order & Document;

export class StatusHistoryEntry {
  status: string;
  note: string;
  updatedBy: string;
  timestamp: Date;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  sampleType: string;

  @Prop({ required: true })
  pickupAddress: string;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING_PICKUP })
  status: OrderStatus;

  @Prop({ type: [{ status: String, note: String, updatedBy: String, timestamp: Date }], default: [] })
  statusHistory: StatusHistoryEntry[];

  @Prop()
  assignedEngineer: string;

  @Prop()
  telegramChatId: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
