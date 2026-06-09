import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, Counter, CounterDocument } from '../schemas';
import { OrderStatus } from '../common/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    private notificationsService: NotificationsService,
  ) {}

  private async generateOrderId(): Promise<string> {
    const year = new Date().getFullYear();
    const key = `order_${year}`;
    const counter = await this.counterModel.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    return `GC-${year}-${String(counter.seq).padStart(4, '0')}`;
  }

  async create(dto: CreateOrderDto, userId?: string) {
    const orderId = await this.generateOrderId();
    const order = await this.orderModel.create({
      ...dto,
      orderId,
      customerId: userId,
      status: OrderStatus.PENDING_PICKUP,
      statusHistory: [{
        status: OrderStatus.PENDING_PICKUP,
        note: 'Order created',
        updatedBy: 'system',
        timestamp: new Date(),
      }],
    });

    // Notify customer on creation
    this.notificationsService.notifyOrderUpdate(order).catch(() => null);
    return order;
  }

  async findById(orderId: string) {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  async findAll(filters: { status?: string; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const query = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.orderModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.orderModel.countDocuments(query),
    ]);
    return { orders, total, page, limit };
  }

  async updateStatus(orderId: string, dto: UpdateStatusDto, updatedBy: string) {
    const order = await this.findById(orderId);
    order.status = dto.status;
    if (dto.assignedEngineer) order.assignedEngineer = dto.assignedEngineer;
    order.statusHistory.push({
      status: dto.status,
      note: dto.note || '',
      updatedBy,
      timestamp: new Date(),
    });
    await order.save();

    // Notify customer on every status change
    this.notificationsService.notifyOrderUpdate(order).catch(() => null);
    return order;
  }

  async findByCustomer(customerId: string) {
    return this.orderModel.find({ customerId }).sort({ createdAt: -1 });
  }
}
