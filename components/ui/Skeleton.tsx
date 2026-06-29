import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'button' | 'input' | 'circle';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height 
}) => {
  const baseClasses = 'skeleton rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    card: 'h-32 w-full rounded-2xl',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-12 w-full rounded-lg',
    circle: 'rounded-full',
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-[#1a1a1a] border border-[#404040] rounded-2xl p-6 ${className}`}>
      <Skeleton variant="text" className="mb-4" width="60%" />
      <Skeleton variant="text" className="mb-2" width="100%" />
      <Skeleton variant="text" className="mb-2" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton width="30%" />
          <Skeleton width="50%" />
          <Skeleton width="20%" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonPeriodGrid: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" height="120px" />
      ))}
    </div>
  );
};
