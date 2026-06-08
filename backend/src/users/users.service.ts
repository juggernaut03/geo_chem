import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByTelegramId(telegramId: string) {
    return this.userModel.findOne({ telegramId }).select('-passwordHash');
  }

  async findByMobile(mobile: string) {
    return this.userModel.findOne({ mobile }).select('-passwordHash');
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('-passwordHash');
  }

  async linkTelegram(userId: string, telegramId: string) {
    return this.userModel.findByIdAndUpdate(userId, { telegramId }, { new: true });
  }

  async createFromTelegram(data: { name: string; telegramId: string; mobile?: string; email?: string; company?: string }) {
    return this.userModel.create({
      name: data.name,
      telegramId: data.telegramId,
      mobile: data.mobile || '',
      email: data.email || `tg_${data.telegramId}@geochem.local`,
      company: data.company || 'Unknown',
    });
  }
}
