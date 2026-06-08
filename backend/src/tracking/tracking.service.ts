import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ORDER_STATUS_ETA, ORDER_STATUS_MESSAGES } from '../common/enums';

@Injectable()
export class TrackingService {
  constructor(private ordersService: OrdersService) {}

  async getStatus(orderId: string) {
    const order = await this.ordersService.findById(orderId);
    const eta = ORDER_STATUS_ETA[order.status] ?? 0;
    const message = ORDER_STATUS_MESSAGES[order.status] ?? 'Status updated.';

    return {
      orderId: order.orderId,
      status: order.status,
      message,
      etaDays: eta,
      statusHistory: order.statusHistory,
      assignedEngineer: order.assignedEngineer,
      lastUpdated: order.statusHistory.at(-1)?.timestamp,
    };
  }

  formatTrackingMessage(tracking: Awaited<ReturnType<TrackingService['getStatus']>>): string {
    const etaText = tracking.etaDays > 0 ? `\nEstimated completion: ${tracking.etaDays} day(s)` : '';
    return `📋 *Order: ${tracking.orderId}*\n${tracking.message}${etaText}`;
  }
}
