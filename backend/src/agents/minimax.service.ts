import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MinimaxService {
  private readonly logger = new Logger(MinimaxService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('MINIMAX_API_KEY') || '';
    this.baseUrl = this.config.get<string>('MINIMAX_BASE_URL') || 'https://api.minimax.chat/v1';
  }

  async polishResponse(rawText: string, context: string): Promise<string> {
    if (!this.apiKey) return rawText;
    try {
      const response = await axios.post(
        `${this.baseUrl}/text/chatcompletion_v2`,
        {
          model: 'abab6.5s-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional lab assistant for Geo-Chem India. Make responses friendly, concise and professional. Keep emojis minimal.',
            },
            { role: 'user', content: `Polish this response for a customer:\n\n${rawText}\n\nContext: ${context}` },
          ],
          max_tokens: 300,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );
      return response.data?.choices?.[0]?.message?.content || rawText;
    } catch (err) {
      this.logger.warn(`Minimax polish failed: ${err.message}`);
      return rawText;
    }
  }

  async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
    if (!this.apiKey) return 'NEUTRAL';
    try {
      const response = await axios.post(
        `${this.baseUrl}/text/chatcompletion_v2`,
        {
          model: 'abab6.5s-chat',
          messages: [
            { role: 'system', content: 'Classify sentiment as POSITIVE, NEUTRAL, or NEGATIVE. Reply with only one word.' },
            { role: 'user', content: text },
          ],
          max_tokens: 10,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
          timeout: 8000,
        },
      );
      const result = response.data?.choices?.[0]?.message?.content?.trim().toUpperCase();
      if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(result)) return result as any;
    } catch (err) {
      this.logger.warn(`Minimax sentiment failed: ${err.message}`);
    }
    return 'NEUTRAL';
  }
}
