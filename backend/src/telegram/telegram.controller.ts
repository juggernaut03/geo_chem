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
    return this.telegramService.handleUpdate(update);
  }
}
