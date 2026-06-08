import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty() @IsString() customerName: string;
  @ApiProperty() @IsString() company: string;
  @ApiProperty() @IsString() mobile: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() sampleType: string;
  @ApiProperty() @IsString() pickupAddress: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telegramChatId?: string;
}
