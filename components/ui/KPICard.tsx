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
  
  const getComparisonColor = () => {
    if (!comparison) return '';
    if (comparison.direction === 'up') return 'text-[#10B981] bg-[#10B98120]';
    if (comparison.direction === 'down') return 'text-[#EF4444] bg-[#EF444420]';
    return 'text-[#9CA3AF] bg-[#1F2937]';
  };
  
  const getComparisonIcon = () => {
    if (!comparison) return null;
    if (comparison.direction === 'up') return '↑';
    if (comparison.direction === 'down') return '↓';
    return '→';
  };
  
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 transition-all duration-200 hover:border-[#374151]">
      <div className="flex items-start justify-between mb-4">
        <div className="text-[#9CA3AF]">
          {icon}
        </div>
        {comparison && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${getComparisonColor()}`}>
            {getComparisonIcon()} {formatPercentage(Math.abs(comparison.value))}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm text-[#9CA3AF] mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#F9FAFB] font-mono tracking-tight">
          {displayValue}
        </p>
      </div>
    </div>
  );
}
