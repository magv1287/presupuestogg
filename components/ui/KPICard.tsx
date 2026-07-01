import { formatCurrency, formatPercentage } from '@/lib/utils/currency';
import { ReactNode } from 'react';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  comparison?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export function KPICard({ icon, label, value, comparison }: KPICardProps) {
  const displayValue = typeof value === 'number' ? formatCurrency(value) : value;
  const isNegative = typeof value === 'number' && value < 0;

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {comparison && comparison.direction !== 'neutral' && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              comparison.direction === 'up'
                ? 'bg-[#10B98120] text-[#10B981]'
                : 'bg-[#EF444420] text-[#EF4444]'
            }`}
          >
            {comparison.direction === 'up' ? '↑' : '↓'}{' '}
            {formatPercentage(Math.abs(comparison.value))}
          </span>
        )}
      </div>
      <p className="text-sm text-[#9CA3AF]">{label}</p>
      <p
        className={`text-2xl font-bold font-mono tracking-tight ${
          isNegative ? 'text-[#EF4444]' : 'text-[#F9FAFB]'
        }`}
      >
        {displayValue}
      </p>
    </div>
  );
}
