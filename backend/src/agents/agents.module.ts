import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { HermesService } from './hermes.service';
import { MinimaxService } from './minimax.service';
import { ConversationStateService } from './conversation-state.service';
import { OrdersModule } from '../orders/orders.module';
import { TrackingModule } from '../tracking/tracking.module';
import { UsersModule } from '../users/users.module';
import { ComplaintsModule } from '../complaints/complaints.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
  imports: [
    OrdersModule,
    TrackingModule,
    UsersModule,
    ComplaintsModule,
    FeedbackModule,
  ],
  providers: [AgentsService, HermesService, MinimaxService, ConversationStateService],
  exports: [AgentsService],
})
export class AgentsModule {}
