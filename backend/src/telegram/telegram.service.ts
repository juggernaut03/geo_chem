import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(
    private config: ConfigService,
    private agentsService: AgentsService,
  ) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    const webhookUrl = this.config.get<string>('TELEGRAM_WEBHOOK_URL');
    if (this.bot && webhookUrl) {
      try {
        await this.bot.telegram.setWebhook(webhookUrl);
        this.logger.log(`Telegram webhook set: ${webhookUrl}`);
      } catch (err) {
        this.logger.warn(`Failed to set webhook: ${err.message}`);
      }
    }
  }

  async handleUpdate(update: any): Promise<void> {
    if (!update?.message) return;

    const msg = update.message;
    const telegramId = String(msg.chat.id);
    const text = msg.text || '';
    const userName = msg.from?.first_name;

    if (!text) return;

    if (text === '/start') {
      const firstName = userName ? ` ${userName}` : '';
      await this.sendMessage(
        telegramId,
        `👋 Welcome${firstName}! I'm the *Geo-Chem* assistant.\n\nI can help you:\n• *Create* a sample test request — type "new order"\n• *Track* your order — type "track GC-2026-XXXX"\n• *Lodge* a complaint — type "complaint"\n• *Share* feedback — type "feedback"\n\nHow can I help you today?`,
      );
      return;
    }

    try {
      const response = await this.agentsService.processMessage(telegramId, text, userName);
      await this.sendMessage(telegramId, response);
    } catch (err) {
      this.logger.error(`Error handling update: ${err.message}`);
      await this.sendMessage(telegramId, '❌ Something went wrong. Please try again.');
    }
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    if (!this.bot) return;
    try {
      await this.bot.telegram.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.warn(`Failed to send message to ${chatId}: ${err.message}`);
    }
  }
}
