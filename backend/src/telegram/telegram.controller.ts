import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @ApiExcludeEndpoint()
  @Post('webhook')
  @HttpCode(200)
  handleWebhook(@Body() update: any, @Headers('x-telegram-bot-api-secret-token') _token: string) {
    // Fire-and-forget — respond 200 immediately so Telegram never retries
    this.telegramService.handleUpdate(update).catch(() => null);
  }
}
