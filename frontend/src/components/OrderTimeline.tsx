import { StatusEntry } from '../types';

export default function OrderTimeline({ history }: { history: StatusEntry[] }) {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {[...history].reverse().map((entry, idx) => (
          <li key={idx}>
            <div className="relative pb-8">
              {idx < history.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              )}
              <div className="relative flex space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                  {history.length - idx}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.status.replace(/_/g, ' ')}
                    </p>
                    {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-gray-400">
                    <p>{new Date(entry.timestamp).toLocaleDateString()}</p>
                    <p>{new Date(entry.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
