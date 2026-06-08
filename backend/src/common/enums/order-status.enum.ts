export enum OrderStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKUP_ASSIGNED = 'PICKUP_ASSIGNED',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  RECEIVED_AT_LAB = 'RECEIVED_AT_LAB',
  UNDER_ANALYSIS = 'UNDER_ANALYSIS',
  QUALITY_REVIEW = 'QUALITY_REVIEW',
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_DELIVERED = 'REPORT_DELIVERED',
  FEEDBACK_PENDING = 'FEEDBACK_PENDING',
  COMPLETED = 'COMPLETED',
}

export const ORDER_STATUS_ETA: Record<string, number> = {
  [OrderStatus.PENDING_PICKUP]: 1,
  [OrderStatus.PICKUP_ASSIGNED]: 1,
  [OrderStatus.SAMPLE_COLLECTED]: 1,
  [OrderStatus.RECEIVED_AT_LAB]: 3,
  [OrderStatus.UNDER_ANALYSIS]: 2,
  [OrderStatus.QUALITY_REVIEW]: 1,
  [OrderStatus.REPORT_GENERATED]: 1,
  [OrderStatus.REPORT_DELIVERED]: 0,
  [OrderStatus.FEEDBACK_PENDING]: 0,
  [OrderStatus.COMPLETED]: 0,
};

export const ORDER_STATUS_MESSAGES: Record<string, string> = {
  [OrderStatus.PENDING_PICKUP]: '⏳ Your sample is pending pickup.',
  [OrderStatus.PICKUP_ASSIGNED]: '🚗 A pickup engineer has been assigned.',
  [OrderStatus.SAMPLE_COLLECTED]: '📦 Sample collected and in transit to lab.',
  [OrderStatus.RECEIVED_AT_LAB]: '🏭 Sample received at our laboratory.',
  [OrderStatus.UNDER_ANALYSIS]: '🔬 Sample is currently under analysis.',
  [OrderStatus.QUALITY_REVIEW]: '✅ Analysis complete. Under quality review.',
  [OrderStatus.REPORT_GENERATED]: '📄 Your report has been generated.',
  [OrderStatus.REPORT_DELIVERED]: '📬 Your report has been delivered.',
  [OrderStatus.FEEDBACK_PENDING]: '⭐ Please share your feedback.',
  [OrderStatus.COMPLETED]: '🎉 Order completed. Thank you!',
};
