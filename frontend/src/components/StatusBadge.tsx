import { OrderStatus } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING_PICKUP:    { label: 'Pending Pickup',    color: 'bg-gray-100 text-gray-700' },
  PICKUP_ASSIGNED:   { label: 'Pickup Assigned',   color: 'bg-blue-100 text-blue-700' },
  SAMPLE_COLLECTED:  { label: 'Sample Collected',  color: 'bg-indigo-100 text-indigo-700' },
  RECEIVED_AT_LAB:   { label: 'Received at Lab',   color: 'bg-purple-100 text-purple-700' },
  UNDER_ANALYSIS:    { label: 'Under Analysis',    color: 'bg-yellow-100 text-yellow-700' },
  QUALITY_REVIEW:    { label: 'Quality Review',    color: 'bg-orange-100 text-orange-700' },
  REPORT_GENERATED:  { label: 'Report Generated',  color: 'bg-teal-100 text-teal-700' },
  REPORT_DELIVERED:  { label: 'Report Delivered',  color: 'bg-green-100 text-green-700' },
  FEEDBACK_PENDING:  { label: 'Feedback Pending',  color: 'bg-pink-100 text-pink-700' },
  COMPLETED:         { label: 'Completed',          color: 'bg-green-100 text-green-800' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
