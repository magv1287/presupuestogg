'use client';

import { SPANISH_MONTHS } from '@/lib/utils/dates';

interface MonthSelectorProps {
  targetMonth: string;
  onChange: (monthKey: string) => void;
}

function getMonthOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= currentYear - 2; year--) {
    for (let month = 12; month >= 1; month--) {
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      options.push({
        value: monthKey,
        label: `${SPANISH_MONTHS[month - 1]} ${year}`,
      });
    }
  }

  return options;
}

export function MonthSelector({ targetMonth, onChange }: MonthSelectorProps) {
  const options = getMonthOptions();

  return (
    <div>
      <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
        ¿Qué mes vamos a preparar?
      </label>
      <select
        value={targetMonth}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
      >
        <option value="">Seleccionar mes...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
