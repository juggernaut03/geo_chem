import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() company: string;
  @ApiProperty() @IsString() mobile: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telegramId?: string;
}
