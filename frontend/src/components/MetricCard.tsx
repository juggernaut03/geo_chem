interface MetricCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

export default function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
