export interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  company: string;
  mobile: string;
  email: string;
  sampleType: string;
  pickupAddress: string;
  status: OrderStatus;
  statusHistory: StatusEntry[];
  assignedEngineer?: string;
  telegramChatId?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING_PICKUP'
  | 'PICKUP_ASSIGNED'
  | 'SAMPLE_COLLECTED'
  | 'RECEIVED_AT_LAB'
  | 'UNDER_ANALYSIS'
  | 'QUALITY_REVIEW'
  | 'REPORT_GENERATED'
  | 'REPORT_DELIVERED'
  | 'FEEDBACK_PENDING'
  | 'COMPLETED';

export interface StatusEntry {
  status: string;
  note: string;
  updatedBy: string;
  timestamp: string;
}

export interface DashboardSummary {
  totalOrders: number;
  pendingPickup: number;
  inProgress: number;
  completed: number;
  openComplaints: number;
  avgSatisfactionScore: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Partial<Order>[];
}
