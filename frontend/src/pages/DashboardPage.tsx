import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Clock, FlaskConical, CheckCircle2,
  AlertTriangle, Star, TrendingUp, ArrowRight,
} from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const metrics = [
    {
      title: 'Total Orders', value: data.totalOrders,
      Icon: ClipboardList, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      trend: 'All time',
    },
    {
      title: 'Pending Pickup', value: data.pendingPickup,
      Icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
      trend: 'Awaiting collection',
    },
    {
      title: 'In Progress', value: data.inProgress,
      Icon: FlaskConical, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
      trend: 'Under analysis',
    },
    {
      title: 'Completed', value: data.completed,
      Icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
      trend: 'Reports delivered',
    },
    {
      title: 'Open Complaints', value: data.openComplaints,
      Icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-500',
      trend: 'Needs attention',
    },
    {
      title: 'Avg Satisfaction', value: `${data.avgSatisfactionScore}/5`,
      Icon: Star, iconBg: 'bg-orange-50', iconColor: 'text-orange-400',
      trend: 'Customer rating',
    },
  ];

  const maxCount = Math.max(...Object.values(data.ordersByStatus));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time operations overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <TrendingUp size={13} className="text-green-500" />
          Live data
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Orders — takes 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Orders</h2>
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order.orderId}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm font-semibold text-blue-600 group-hover:text-blue-700 truncate">
                    {order.orderId}
                  </span>
                  <span className="text-sm text-gray-600 truncate">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={order.status as OrderStatus} />
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {order.createdAt && new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Orders by Status — takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5">By Status</h2>
          <div className="space-y-3">
            {Object.entries(data.ordersByStatus)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 truncate pr-2">
                      {status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
