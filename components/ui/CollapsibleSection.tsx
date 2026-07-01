'use client';

import { ReactNode, useState, KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  onToggle?: (open: boolean) => void;
  variant?: 'year' | 'month' | 'default';
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  badge,
  onToggle,
  variant = 'default',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onToggle?.(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  const isMonth = variant === 'month';

  return (
    <div
      className={
        isMonth
          ? 'bg-[#0D1117] border border-[#1F2937] rounded-xl overflow-hidden'
          : 'bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden'
      }
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={
          isMonth
            ? 'w-full px-5 py-4 flex items-center justify-between hover:bg-[#161B22] transition-colors cursor-pointer'
            : 'w-full px-6 py-4 flex items-center justify-between hover:bg-[#1F2937] transition-colors cursor-pointer'
        }
      >
        {isMonth ? (
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="text-base font-semibold text-[#F9FAFB]">{title}</span>
            {badge}
          </div>
        ) : badge ? (
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="text-lg font-semibold text-[#F9FAFB]">{title}</span>
            {badge}
          </div>
        ) : (
          <span className="text-lg font-semibold text-[#F9FAFB]">{title}</span>
        )}

        <ChevronDown
          className={`text-[#9CA3AF] transition-transform duration-200 flex-shrink-0 ${
            isMonth ? 'w-4 h-4' : 'w-5 h-5'
          } ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </div>

      {isOpen && (
        <div className={isMonth ? 'px-5 pb-5' : 'px-6 pb-6'}>{children}</div>
      )}
    </div>
  );
}
