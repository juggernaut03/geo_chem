import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from '../schemas';
import { MinimaxService } from '../agents/minimax.service';

export class CreateFeedbackDto {
  orderId: string;
  customerId?: string;
  rating: number;
  comments?: string;
  suggestions?: string;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
    private minimaxService: MinimaxService,
  ) {}

  async create(dto: CreateFeedbackDto) {
    const text = [dto.comments, dto.suggestions].filter(Boolean).join(' ');
    const sentiment = text ? await this.minimaxService.analyzeSentiment(text) : 'NEUTRAL';

    return this.feedbackModel.create({
      ...dto,
      sentiment,
      analyzedAt: new Date(),
    });
  }

  async findByOrder(orderId: string) {
    return this.feedbackModel.findOne({ orderId });
  }

  async getAverageRating(): Promise<number> {
    const result = await this.feedbackModel.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return result[0]?.avg ?? 0;
  }
}
