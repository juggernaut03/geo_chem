import { Injectable } from '@nestjs/common';

export interface ConversationState {
  flow: 'IDLE' | 'CREATE_ORDER' | 'COMPLAINT' | 'FEEDBACK';
  step: string;
  data: Record<string, any>;
}

// In-memory store — sufficient for single-instance; swap for Redis if scaling
const stateStore = new Map<string, ConversationState>();

@Injectable()
export class ConversationStateService {

  get(telegramId: string): ConversationState {
    return stateStore.get(telegramId) || { flow: 'IDLE', step: '', data: {} };
  }

  set(telegramId: string, state: ConversationState): void {
    stateStore.set(telegramId, state);
  }

  reset(telegramId: string): void {
    stateStore.set(telegramId, { flow: 'IDLE', step: '', data: {} });
  }

  update(telegramId: string, patch: Partial<ConversationState>): void {
    const current = this.get(telegramId);
    stateStore.set(telegramId, { ...current, ...patch, data: { ...current.data, ...patch.data } });
  }
}
