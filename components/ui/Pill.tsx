import { getCategoryConfig } from '@/lib/utils/categories';

interface PillProps {
  category: string;
  size?: 'sm' | 'md';
}

export function Pill({ category, size = 'md' }: PillProps) {
  const config = getCategoryConfig(category);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      {category}
    </span>
  );
}
