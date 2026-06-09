import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type Intent = 'CREATE_ORDER' | 'TRACK_ORDER' | 'COMPLAINT' | 'FEEDBACK' | 'FAQ' | 'UNKNOWN';

export interface IntentResult {
  intent: Intent;
  orderId?: string;
  confidence: number;
}

const SYSTEM_PROMPT = `You are the Geo-Chem lab assistant intent classifier.
Classify the user message into exactly one intent:
- CREATE_ORDER: user wants to create a new sample test request
- TRACK_ORDER: user wants to track/check status of an order (look for order ID like GC-2026-XXXX)
- COMPLAINT: user wants to report a problem, delay, or issue
- FEEDBACK: user wants to give feedback or rating
- FAQ: user is asking a general question about services
- UNKNOWN: none of the above

Also extract orderId if present (format: GC-YYYY-XXXX).

Respond ONLY with valid JSON: {"intent": "...", "orderId": "..." or null, "confidence": 0.0-1.0}`;

@Injectable()
export class HermesService {
  private readonly logger = new Logger(HermesService.name);
  private readonly ollamaUrl: string;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.ollamaUrl = this.config.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';
    this.model = this.config.get<string>('OLLAMA_MODEL') || 'nous-hermes2';
  }

  async detectIntent(message: string): Promise<IntentResult> {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        stream: false,
        format: 'json',
      }, { timeout: 15000 });

      const content = response.data?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return {
        intent: parsed.intent || 'UNKNOWN',
        orderId: parsed.orderId || undefined,
        confidence: parsed.confidence || 0.5,
      };
    } catch (err) {
      this.logger.warn(`Hermes intent detection failed: ${err.message}`);
      return this.fallbackDetect(message);
    }
  }

  private fallbackDetect(message: string): IntentResult {
    const lower = message.toLowerCase();
    const orderIdMatch = message.match(/GC-\d{4}-\d{4}/i);

    if (orderIdMatch || lower.includes('track') || lower.includes('status') || lower.includes('where')) {
      return { intent: 'TRACK_ORDER', orderId: orderIdMatch?.[0], confidence: 0.8 };
    }
    if (lower.includes('create') || lower.includes('new') || lower.includes('request') || lower.includes('sample')) {
      return { intent: 'CREATE_ORDER', confidence: 0.7 };
    }
    if (lower.includes('complaint') || lower.includes('problem') || lower.includes('delay') || lower.includes('issue') || lower.includes('lodge')) {
      return { intent: 'COMPLAINT', confidence: 0.7 };
    }
    if (lower.includes('feedback') || lower.includes('rating') || lower.includes('review')) {
      return { intent: 'FEEDBACK', confidence: 0.7 };
    }
    return { intent: 'UNKNOWN', confidence: 0.3 };
  }
}
