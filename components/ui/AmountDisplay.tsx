import { formatCurrency } from '@/lib/utils/currency';

interface AmountDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}

export function AmountDisplay({ amount, size = 'md', showSign = true }: AmountDisplayProps) {
  const isPositive = amount >= 0;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };
  
  const colorClass = isPositive ? 'text-[#10B981]' : 'text-[#EF4444]';
  const bgClass = isPositive ? 'bg-[#10B98120]' : 'bg-[#EF444420]';
  
  const displayAmount = showSign && isPositive ? `+${formatCurrency(amount)}` : formatCurrency(amount);
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono font-semibold ${sizeClasses[size]} ${colorClass} ${bgClass}`}
    >
      {displayAmount}
    </span>
  );
}
