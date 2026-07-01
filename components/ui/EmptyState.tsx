import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
}

export function EmptyState({ icon, title, description, ctaLabel, ctaAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center text-[#9CA3AF] mb-4 md:mb-6">
        {icon}
      </div>

      <h3 className="text-base md:text-lg font-semibold text-[#F9FAFB] mb-2">{title}</h3>

      <p className="text-sm md:text-base text-[#9CA3AF] max-w-md mb-6 md:mb-8">{description}</p>

      {ctaLabel && ctaAction && (
        <Button onClick={ctaAction}>{ctaLabel}</Button>
      )}
    </div>
  );
}
