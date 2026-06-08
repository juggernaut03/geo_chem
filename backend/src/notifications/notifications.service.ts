import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import * as nodemailer from 'nodemailer';
import { ORDER_STATUS_MESSAGES } from '../common/enums';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private bot: Telegraf;
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) this.bot = new Telegraf(token);

    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendTelegram(telegramChatId: string, message: string): Promise<void> {
    if (!this.bot || !telegramChatId) return;
    try {
      await this.bot.telegram.sendMessage(telegramChatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.warn(`Telegram send failed to ${telegramChatId}: ${err.message}`);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.warn(`Email send failed to ${to}: ${err.message}`);
    }
  }

  async notifyOrderUpdate(order: any): Promise<void> {
    const message = ORDER_STATUS_MESSAGES[order.status] || 'Your order status has been updated.';
    const fullMessage = `📋 *Order ${order.orderId}*\n${message}`;

    const promises: Promise<void>[] = [];

    if (order.telegramChatId) {
      promises.push(this.sendTelegram(order.telegramChatId, fullMessage));
    }

    if (order.email) {
      promises.push(
        this.sendEmail(
          order.email,
          `Geo-Chem Order Update: ${order.orderId}`,
          `<p>Dear ${order.customerName},</p><p>${message}</p><p>Order ID: <strong>${order.orderId}</strong></p>`,
        ),
      );
    }

    await Promise.allSettled(promises);
  }
}
