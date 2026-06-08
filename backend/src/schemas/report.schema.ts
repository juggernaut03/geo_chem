import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true, index: true })
  orderId: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ enum: ['PDF', 'DOCX', 'XLSX'], default: 'PDF' })
  format: string;

  @Prop()
  uploadedBy: string;

  @Prop({ default: 0 })
  downloadCount: number;

  @Prop()
  approvedAt: Date;

  @Prop()
  deliveredAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
