import { Injectable, Logger } from '@nestjs/common';
import { HermesService } from './hermes.service';
import { MinimaxService } from './minimax.service';
import { ConversationStateService } from './conversation-state.service';
import { OrdersService } from '../orders/orders.service';
import { TrackingService } from '../tracking/tracking.service';
import { UsersService } from '../users/users.service';

const ORDER_STEPS = ['name', 'company', 'mobile', 'email', 'sampleType', 'pickupAddress'];
const ORDER_PROMPTS: Record<string, string> = {
  name: '👤 What is your full name?',
  company: '🏢 What is your company name?',
  mobile: '📱 What is your mobile number?',
  email: '📧 What is your email address?',
  sampleType: '🧪 What type of sample do you want to test? (e.g., water, soil, food)',
  pickupAddress: '📍 Please provide the full pickup address.',
};

const FAQ_ANSWERS: Record<string, string> = {
  default: `🧪 *Geo-Chem India — FAQ*\n\n• *New request:* Type "create order"\n• *Track order:* Type "track GC-2026-XXXX"\n• *Complaint:* Type "complaint"\n• *Feedback:* Type "feedback"\n• *Turnaround:* 3–7 business days\n• *Contact:* support@geochem.com`,
};

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private hermes: HermesService,
    private minimax: MinimaxService,
    private stateService: ConversationStateService,
    private ordersService: OrdersService,
    private trackingService: TrackingService,
    private usersService: UsersService,
  ) {}

  async processMessage(telegramId: string, text: string, userName?: string): Promise<string> {
    const state = this.stateService.get(telegramId);

    // Handle ongoing flows first
    if (state.flow === 'CREATE_ORDER') {
      return this.handleOrderCreationStep(telegramId, text, state);
    }

    if (state.flow === 'FEEDBACK') {
      return this.handleFeedbackStep(telegramId, text, state);
    }

    // Detect intent for new messages
    const { intent, orderId } = await this.hermes.detectIntent(text);
    this.logger.log(`Intent: ${intent} | TelegramId: ${telegramId}`);

    switch (intent) {
      case 'CREATE_ORDER':
        return this.startOrderCreation(telegramId, userName);

      case 'TRACK_ORDER':
        return this.handleTracking(telegramId, orderId);

      case 'COMPLAINT':
        return this.handleComplaint(telegramId);

      case 'FEEDBACK':
        return this.startFeedback(telegramId);

      case 'FAQ':
        return FAQ_ANSWERS.default;

      default:
        return `👋 Hello! I'm the Geo-Chem assistant.\n\nI can help you:\n• *Create* a sample test request\n• *Track* your order (e.g., "track GC-2026-1001")\n• *Lodge* a complaint\n• *Share* feedback\n\nType *help* for more info.`;
    }
  }

  private startOrderCreation(telegramId: string, userName?: string): string {
    this.stateService.set(telegramId, {
      flow: 'CREATE_ORDER',
      step: 'name',
      data: userName ? { name: userName } : {},
    });

    const firstStep = userName ? 'company' : 'name';
    if (userName) {
      this.stateService.update(telegramId, { step: 'company', data: { name: userName } });
    }

    return `🧪 *New Sample Request*\n\nLet's collect your details.\n\n${ORDER_PROMPTS[firstStep]}`;
  }

  private async handleOrderCreationStep(telegramId: string, text: string, state: any): Promise<string> {
    const currentStep = state.step;
    this.stateService.update(telegramId, { data: { [currentStep]: text.trim() } });

    const currentIndex = ORDER_STEPS.indexOf(currentStep);
    const nextStep = ORDER_STEPS[currentIndex + 1];

    if (!nextStep) {
      // All data collected — create order
      return this.finalizeOrder(telegramId);
    }

    this.stateService.update(telegramId, { step: nextStep });
    return ORDER_PROMPTS[nextStep];
  }

  private async finalizeOrder(telegramId: string): Promise<string> {
    const state = this.stateService.get(telegramId);
    this.stateService.reset(telegramId);

    try {
      const order = await this.ordersService.create({
        customerName: state.data.name,
        company: state.data.company,
        mobile: state.data.mobile,
        email: state.data.email,
        sampleType: state.data.sampleType,
        pickupAddress: state.data.pickupAddress,
        telegramChatId: telegramId,
      });

      return `✅ *Order Created Successfully!*\n\n📋 Order ID: \`${order.orderId}\`\n👤 Name: ${order.customerName}\n🧪 Sample: ${order.sampleType}\n📍 Pickup: ${order.pickupAddress}\n\nWe'll notify you when pickup is assigned. Save your Order ID!`;
    } catch (err) {
      this.logger.error(`Order creation failed: ${err.message}`);
      return '❌ Something went wrong creating your order. Please try again.';
    }
  }

  private async handleTracking(telegramId: string, orderId?: string): Promise<string> {
    if (!orderId) {
      return '🔍 Please provide your Order ID.\n\nExample: *track GC-2026-1001*';
    }
    try {
      const tracking = await this.trackingService.getStatus(orderId.toUpperCase());
      return this.trackingService.formatTrackingMessage(tracking);
    } catch {
      return `❌ Order *${orderId}* not found. Please check the ID and try again.`;
    }
  }

  private handleComplaint(_telegramId: string): string {
    return `⚠️ *Lodge a Complaint*\n\nPlease contact us:\n📧 complaints@geochem.com\n📱 +91-XXXXXXXXXX\n\nOr visit our portal for complaint tracking.`;
  }

  private startFeedback(_telegramId: string): string {
    const telegramId = _telegramId;
    this.stateService.set(telegramId, { flow: 'FEEDBACK', step: 'orderId', data: {} });
    return `⭐ *Share Your Feedback*\n\nPlease provide your Order ID (e.g., GC-2026-1001):`;
  }

  private handleFeedbackStep(telegramId: string, text: string, state: any): string {
    if (state.step === 'orderId') {
      this.stateService.update(telegramId, { step: 'rating', data: { orderId: text.trim() } });
      return `📊 Please rate your experience from 1 to 5:\n\n1 ⭐ - Poor\n2 ⭐ - Fair\n3 ⭐ - Good\n4 ⭐ - Very Good\n5 ⭐ - Excellent`;
    }

    if (state.step === 'rating') {
      this.stateService.reset(telegramId);
      return `🙏 Thank you for your feedback! Your rating has been recorded.\n\nWe'll use your feedback to improve our services.`;
    }

    this.stateService.reset(telegramId);
    return '✅ Feedback recorded. Thank you!';
  }
}
