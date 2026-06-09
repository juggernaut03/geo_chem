import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

export default function MetricCard({ title, value, Icon, iconBg, iconColor, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={26} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest truncate">{title}</p>
        <p className="mt-0.5 text-3xl font-bold text-gray-900 leading-none">{value}</p>
        {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
      </div>
    </div>
  );
}
