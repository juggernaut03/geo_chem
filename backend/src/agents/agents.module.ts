import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { HermesService } from './hermes.service';
import { MinimaxService } from './minimax.service';
import { ConversationStateService } from './conversation-state.service';
import { OrdersModule } from '../orders/orders.module';
import { TrackingModule } from '../tracking/tracking.module';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OrdersModule,
    TrackingModule,
    UsersModule,
  ],
  providers: [AgentsService, HermesService, MinimaxService, ConversationStateService],
  exports: [AgentsService],
})
export class AgentsModule {}
