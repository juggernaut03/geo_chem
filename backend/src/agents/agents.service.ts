import { Injectable, Logger } from '@nestjs/common';
import { HermesService } from './hermes.service';
import { ConversationStateService } from './conversation-state.service';
import { OrdersService } from '../orders/orders.service';
import { TrackingService } from '../tracking/tracking.service';
import { ComplaintsService } from '../complaints/complaints.service';
import { FeedbackService } from '../feedback/feedback.service';

// ─── Order creation flow ──────────────────────────────────────────────────────
const ORDER_STEPS = ['name', 'company', 'mobile', 'email', 'sampleType', 'pickupAddress'];
const ORDER_PROMPTS: Record<string, string> = {
  name:          '👤 What is your full name?',
  company:       '🏢 What is your company name?',
  mobile:        '📱 What is your mobile number?',
  email:         '📧 What is your email address?',
  sampleType:    '🧪 What type of sample? (e.g., water, soil, food, air)',
  pickupAddress: '📍 Please provide the full pickup address.',
};

// ─── Complaint flow ───────────────────────────────────────────────────────────
const COMPLAINT_TYPE_MAP: Record<string, string> = {
  '1': 'DELAY', '2': 'PICKUP', '3': 'QUALITY', '4': 'OTHER',
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = `🧪 *Geo-Chem India — Help*\n\n*Services:* Chemical analysis, water testing, soil analysis, food testing\n*Turnaround:* 3–7 business days\n*Sample types:* Water, soil, food, air, industrial\n\n*Commands:*\n• "new order" — create a sample request\n• "track GC-2026-XXXX" — check order status\n• "complaint" — lodge a complaint\n• "feedback" — share your experience\n\n📧 support@geochem.in`;

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private hermes: HermesService,
    private stateService: ConversationStateService,
    private ordersService: OrdersService,
    private trackingService: TrackingService,
    private complaintsService: ComplaintsService,
    private feedbackService: FeedbackService,
  ) {}

  async processMessage(telegramId: string, text: string, userName?: string): Promise<string> {
    const state = this.stateService.get(telegramId);

    // Cancel keyword — always available
    if (text.toLowerCase() === 'cancel') {
      this.stateService.reset(telegramId);
      return '✅ Cancelled. Type "help" to see what I can do.';
    }

    // Handle ongoing flows before intent detection
    if (state.flow === 'CREATE_ORDER') {
      return this.handleOrderStep(telegramId, text, state);
    }
    if (state.flow === 'COMPLAINT') {
      return this.handleComplaintStep(telegramId, text, state);
    }
    if (state.flow === 'FEEDBACK') {
      return this.handleFeedbackStep(telegramId, text, state);
    }

    // Detect intent for fresh messages
    const { intent, orderId } = await this.hermes.detectIntent(text);
    this.logger.log(`Intent: ${intent} for "${text}" | TelegramId: ${telegramId}`);

    switch (intent) {
      case 'CREATE_ORDER':  return this.startOrderFlow(telegramId, userName);
      case 'TRACK_ORDER':   return this.handleTracking(orderId);
      case 'COMPLAINT':     return this.startComplaintFlow(telegramId);
      case 'FEEDBACK':      return this.startFeedbackFlow(telegramId);
      case 'FAQ':           return FAQ;
      default:
        return `I didn't quite understand that. Here's what I can help with:\n\n• "new order" — create a sample request\n• "track GC-2026-XXXX" — check order status\n• "complaint" — lodge a complaint\n• "feedback" — share feedback\n• "help" — FAQ\n\nType *cancel* at any time to stop.`;
    }
  }

  // ─── Order creation ─────────────────────────────────────────────────────────

  private startOrderFlow(telegramId: string, userName?: string): string {
    const firstStep = userName ? 'company' : 'name';
    this.stateService.set(telegramId, {
      flow: 'CREATE_ORDER',
      step: firstStep,
      data: userName ? { name: userName } : {},
    });
    return `🧪 *New Sample Request*\n\nI'll collect a few details. Type *cancel* at any time to stop.\n\n${ORDER_PROMPTS[firstStep]}`;
  }

  private async handleOrderStep(telegramId: string, text: string, state: any): Promise<string> {
    const currentStep = state.step;
    this.stateService.update(telegramId, { data: { [currentStep]: text.trim() } });

    const nextStep = ORDER_STEPS[ORDER_STEPS.indexOf(currentStep) + 1];
    if (!nextStep) return this.finalizeOrder(telegramId);

    this.stateService.update(telegramId, { step: nextStep });
    return ORDER_PROMPTS[nextStep];
  }

  private async finalizeOrder(telegramId: string): Promise<string> {
    const state = this.stateService.get(telegramId);
    this.stateService.reset(telegramId);
    try {
      const order = await this.ordersService.create({
        customerName:  state.data.name,
        company:       state.data.company,
        mobile:        state.data.mobile,
        email:         state.data.email,
        sampleType:    state.data.sampleType,
        pickupAddress: state.data.pickupAddress,
        telegramChatId: telegramId,
      });
      return `✅ *Order Created!*\n\n📋 Order ID: \`${order.orderId}\`\n👤 ${order.customerName}\n🧪 ${order.sampleType}\n📍 ${order.pickupAddress}\n\nWe'll notify you here when pickup is assigned. Save your Order ID!`;
    } catch (err) {
      this.logger.error(`Order creation failed: ${err.message}`);
      return '❌ Could not create your order. Please try again or contact support.';
    }
  }

  // ─── Tracking ───────────────────────────────────────────────────────────────

  private async handleTracking(orderId?: string): Promise<string> {
    if (!orderId) {
      return '🔍 Please share your Order ID.\n\nExample: *track GC-2026-1001*';
    }
    try {
      const tracking = await this.trackingService.getStatus(orderId.toUpperCase());
      return this.trackingService.formatTrackingMessage(tracking);
    } catch {
      return `❌ Order *${orderId}* not found. Please check the ID and try again.`;
    }
  }

  // ─── Complaint flow ─────────────────────────────────────────────────────────

  private startComplaintFlow(telegramId: string): string {
    this.stateService.set(telegramId, { flow: 'COMPLAINT', step: 'orderId', data: {} });
    return `⚠️ *Lodge a Complaint*\n\nI'll register your complaint right away.\n\nFirst, please provide your Order ID (e.g., GC-2026-1001), or type *skip* if you don't have one:`;
  }

  private async handleComplaintStep(telegramId: string, text: string, state: any): Promise<string> {
    const t = text.trim();

    if (state.step === 'orderId') {
      const orderId = t.toLowerCase() === 'skip' ? '' : t.toUpperCase();
      this.stateService.update(telegramId, { step: 'type', data: { orderId } });
      return `📋 *Select complaint type:*\n\n1️⃣ Delay in pickup or delivery\n2️⃣ Pickup issue (engineer didn't arrive, etc.)\n3️⃣ Quality concern with report\n4️⃣ Other\n\nReply with a number (1–4):`;
    }

    if (state.step === 'type') {
      const type = COMPLAINT_TYPE_MAP[t];
      if (!type) {
        return '⚠️ Please reply with a number between 1 and 4.';
      }
      this.stateService.update(telegramId, { step: 'description', data: { type } });
      return `📝 Please describe your issue in detail:`;
    }

    if (state.step === 'description') {
      this.stateService.update(telegramId, { data: { description: t } });
      return this.finalizeComplaint(telegramId);
    }

    this.stateService.reset(telegramId);
    return '❌ Something went wrong. Please type "complaint" to start again.';
  }

  private async finalizeComplaint(telegramId: string): Promise<string> {
    const state = this.stateService.get(telegramId);
    this.stateService.reset(telegramId);
    try {
      const complaint = await this.complaintsService.create({
        orderId:     state.data.orderId || 'N/A',
        type:        state.data.type as 'DELAY' | 'PICKUP' | 'QUALITY' | 'OTHER',
        description: state.data.description,
        severity:    'MEDIUM',
      });
      return `✅ *Complaint Registered!*\n\n🎫 Ticket ID: \`${complaint.ticketId}\`\n📋 Type: ${state.data.type}\n\nOur team will review your complaint within 24 hours. Save your Ticket ID for tracking.\n\n📧 complaints@geochem.in for urgent issues.`;
    } catch (err) {
      this.logger.error(`Complaint creation failed: ${err.message}`);
      return '❌ Could not register complaint. Please email complaints@geochem.in directly.';
    }
  }

  // ─── Feedback flow ──────────────────────────────────────────────────────────

  private startFeedbackFlow(telegramId: string): string {
    this.stateService.set(telegramId, { flow: 'FEEDBACK', step: 'orderId', data: {} });
    return `⭐ *Share Your Feedback*\n\nYour feedback helps us improve!\n\nPlease provide your Order ID (e.g., GC-2026-1001):`;
  }

  private async handleFeedbackStep(telegramId: string, text: string, state: any): Promise<string> {
    const t = text.trim();

    if (state.step === 'orderId') {
      this.stateService.update(telegramId, { step: 'rating', data: { orderId: t.toUpperCase() } });
      return `📊 How would you rate our service?\n\n1️⃣ Poor\n2️⃣ Fair\n3️⃣ Good\n4️⃣ Very Good\n5️⃣ Excellent\n\nReply with 1–5:`;
    }

    if (state.step === 'rating') {
      const rating = parseInt(t, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return '⚠️ Please reply with a number between 1 and 5.';
      }
      this.stateService.update(telegramId, { step: 'comments', data: { rating } });
      return `💬 Any comments or suggestions? (or type *skip*):`;
    }

    if (state.step === 'comments') {
      const comments = t.toLowerCase() === 'skip' ? '' : t;
      this.stateService.update(telegramId, { data: { comments } });
      return this.finalizeFeedback(telegramId);
    }

    this.stateService.reset(telegramId);
    return '❌ Something went wrong. Please type "feedback" to start again.';
  }

  private async finalizeFeedback(telegramId: string): Promise<string> {
    const state = this.stateService.get(telegramId);
    this.stateService.reset(telegramId);
    const stars = '⭐'.repeat(state.data.rating);
    try {
      await this.feedbackService.create({
        orderId:  state.data.orderId,
        rating:   Number(state.data.rating),
        comments: state.data.comments,
      });
      return `🙏 *Thank you for your feedback!*\n\n${stars} (${state.data.rating}/5)\n\nYour response has been recorded. We appreciate your time!`;
    } catch (err) {
      this.logger.error(`Feedback save failed: ${err.message}`);
      return `🙏 Thank you! ${stars} (${state.data.rating}/5) — Feedback noted.`;
    }
  }
}
