import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, Complaint, ComplaintDocument, Feedback, FeedbackDocument } from '../schemas';
import { OrderStatus } from '../common/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Complaint.name) private complaintModel: Model<ComplaintDocument>,
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async getSummary() {
    const [
      totalOrders,
      ordersByStatus,
      openComplaints,
      avgRating,
      recentOrders,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.complaintModel.countDocuments({ status: 'OPEN' }),
      this.feedbackModel.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      this.orderModel.find().sort({ createdAt: -1 }).limit(5).select('orderId customerName status createdAt'),
    ]);

    const statusMap = Object.fromEntries(ordersByStatus.map(s => [s._id, s.count]));
    const pendingPickup = statusMap[OrderStatus.PENDING_PICKUP] || 0;
    const inProgress = (statusMap[OrderStatus.UNDER_ANALYSIS] || 0) + (statusMap[OrderStatus.RECEIVED_AT_LAB] || 0);

    return {
      totalOrders,
      pendingPickup,
      inProgress,
      completed: statusMap[OrderStatus.COMPLETED] || 0,
      openComplaints,
      avgSatisfactionScore: Math.round((avgRating[0]?.avg || 0) * 10) / 10,
      ordersByStatus: statusMap,
      recentOrders,
    };
  }
}
