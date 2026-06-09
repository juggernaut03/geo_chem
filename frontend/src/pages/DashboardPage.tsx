import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/endpoints';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { DashboardSummary, OrderStatus } from '../types';

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getSummary().then(r => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>;
  if (!data) return null;

  const metrics = [
    { title: 'Total Orders', value: data.totalOrders, icon: '📋', color: 'bg-blue-50' },
    { title: 'Pending Pickup', value: data.pendingPickup, icon: '⏳', color: 'bg-yellow-50' },
    { title: 'In Progress', value: data.inProgress, icon: '🔬', color: 'bg-purple-50' },
    { title: 'Completed', value: data.completed, icon: '✅', color: 'bg-green-50' },
    { title: 'Open Complaints', value: data.openComplaints, icon: '⚠️', color: 'bg-red-50' },
    { title: 'Avg Satisfaction', value: `${data.avgSatisfactionScore}/5`, icon: '⭐', color: 'bg-orange-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
        </div>
        <div className="space-y-3">
          {data.recentOrders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order.orderId}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium text-blue-600">{order.orderId}</span>
                <span className="text-sm text-gray-700">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status as OrderStatus} />
                <span className="text-xs text-gray-400">
                  {order.createdAt && new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Orders by Status */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Orders by Status</h2>
        <div className="space-y-2">
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="w-40">
                <StatusBadge status={status as OrderStatus} />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((count / data.totalOrders) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
