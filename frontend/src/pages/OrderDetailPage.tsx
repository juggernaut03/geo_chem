import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import { OrderStatus } from '../types';

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PICKUP:   ['PICKUP_ASSIGNED'],
  PICKUP_ASSIGNED:  ['SAMPLE_COLLECTED'],
  SAMPLE_COLLECTED: ['RECEIVED_AT_LAB'],
  RECEIVED_AT_LAB:  ['UNDER_ANALYSIS'],
  UNDER_ANALYSIS:   ['QUALITY_REVIEW'],
  QUALITY_REVIEW:   ['REPORT_GENERATED'],
  REPORT_GENERATED: ['REPORT_DELIVERED'],
  REPORT_DELIVERED: ['FEEDBACK_PENDING'],
  FEEDBACK_PENDING: ['COMPLETED'],
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [engineer, setEngineer] = useState('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId!).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note: string }) =>
      ordersApi.updateStatus(orderId!, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setNote('');
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (error || !order) return <div className="text-center py-16 text-red-500">Order not found</div>;

  const nextStatuses = NEXT_STATUSES[order.status as OrderStatus] ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/orders')} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
        ← Back to Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{order.orderId}</h1>
          <p className="text-gray-500 text-sm mt-1">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Customer Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['Name', order.customerName],
                ['Company', order.company],
                ['Mobile', order.mobile],
                ['Email', order.email],
                ['Sample Type', order.sampleType],
                ['Assigned Engineer', order.assignedEngineer || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-xs text-gray-500">Pickup Address</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{order.pickupAddress}</dd>
              </div>
            </dl>
          </div>

          {/* Update Status */}
          {nextStatuses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Update Status</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {order.status === 'PENDING_PICKUP' && (
                  <input
                    type="text"
                    value={engineer}
                    onChange={(e) => setEngineer(e.target.value)}
                    placeholder="Assign engineer name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <div className="flex gap-2">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ status, note })}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                    >
                      {updateMutation.isPending ? 'Updating...' : `Mark as ${status.replace(/_/g, ' ')}`}
                    </button>
                  ))}
                </div>
                {updateMutation.isSuccess && (
                  <p className="text-sm text-green-600">✓ Status updated successfully</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Status Timeline</h2>
          <OrderTimeline history={order.statusHistory} />
        </div>
      </div>
    </div>
  );
}
