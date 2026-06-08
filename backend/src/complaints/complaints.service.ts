import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Complaint, ComplaintDocument, Counter, CounterDocument } from '../schemas';

export class CreateComplaintDto {
  orderId: string;
  customerId?: string;
  type: 'DELAY' | 'PICKUP' | 'QUALITY' | 'OTHER';
  description: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name) private complaintModel: Model<ComplaintDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  private async generateTicketId(): Promise<string> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'complaint' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    return `CT-${String(counter.seq).padStart(4, '0')}`;
  }

  async create(dto: CreateComplaintDto) {
    const ticketId = await this.generateTicketId();
    return this.complaintModel.create({ ...dto, ticketId });
  }

  async findById(ticketId: string) {
    return this.complaintModel.findOne({ ticketId });
  }

  async findByOrder(orderId: string) {
    return this.complaintModel.find({ orderId });
  }

  async updateStatus(ticketId: string, status: string, resolution?: string) {
    return this.complaintModel.findOneAndUpdate(
      { ticketId },
      { status, ...(resolution && { resolution }) },
      { new: true },
    );
  }
}
