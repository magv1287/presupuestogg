'use client';

import { ReactNode, useState, KeyboardEvent } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
  onToggle?: (open: boolean) => void;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  badge,
  onToggle,
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

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1F2937] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <h3 className="text-lg font-semibold text-[#F9FAFB]">{title}</h3>
          {badge}
        </div>

        <svg
          className={`w-5 h-5 text-[#9CA3AF] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <div
        className={`transition-all duration-200 ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
