import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback, FeedbackSchema } from '../schemas';
import { MinimaxService } from '../agents/minimax.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Feedback.name, schema: FeedbackSchema }])],
  providers: [FeedbackService, MinimaxService],
  controllers: [FeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}
