import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
}

export function EmptyState({ icon, title, description, ctaLabel, ctaAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center text-[#9CA3AF] mb-4">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">
        {title}
      </h3>
      
      <p className="text-[#9CA3AF] max-w-md mb-6">
        {description}
      </p>
      
      {ctaLabel && ctaAction && (
        <button
          onClick={ctaAction}
          className="px-6 py-2.5 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
