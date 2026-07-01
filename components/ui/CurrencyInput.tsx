'use client';

interface CurrencyInputProps {
  value: string | number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0.00',
  className = '',
  disabled = false,
  id,
}: CurrencyInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-mono pointer-events-none select-none z-10">
        $
      </span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className={`w-full pl-9 pr-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] font-mono placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent disabled:opacity-50 ${className}`}
      />
    </div>
  );
}
