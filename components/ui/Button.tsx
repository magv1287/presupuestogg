'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#10B981] text-white hover:bg-[#059669]',
  secondary:
    'bg-[#1F2937] text-[#F9FAFB] border border-[#374151] hover:bg-[#374151]',
  danger:
    'border border-[#EF4444] text-[#EF4444] bg-transparent hover:bg-[#EF444420]',
};

export function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'px-4 py-2.5 min-h-[40px] text-sm',
        'md:px-7 md:py-3.5 md:min-h-[48px] md:text-base',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
