'use client';

import React from 'react';
import { Period, PeriodWithStatus, PeriodStatus } from '@/types/period';
import { formatPeriodShort, formatPeriodLabel } from '@/lib/periodUtils';

interface PeriodSelectorProps {
  periods: PeriodWithStatus[];
  selectedPeriod: Period | null;
  onSelectPeriod: (period: Period) => void;
  loading?: boolean;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  selectedPeriod,
  onSelectPeriod,
  loading = false,
}) => {
  const getStatusConfig = (status: PeriodStatus) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Completado',
          clickable: true,
        };
      case 'available':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          label: 'Disponible',
          clickable: true,
        };
      case 'locked':
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Bloqueado',
          clickable: false,
        };
      case 'in-progress':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
          label: 'En progreso',
          clickable: true,
        };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {periods.map((period) => {
        const config = getStatusConfig(period.status);
        const isSelected = selectedPeriod?.id === period.id;

        return (
          <button
            key={period.id}
            onClick={() => config.clickable && onSelectPeriod(period)}
            disabled={!config.clickable}
            className={`
              relative p-4 rounded-2xl border-2 transition-all
              ${config.bg} ${config.border}
              ${isSelected ? 'ring-2 ring-[#3b82f6] ring-offset-2 ring-offset-[#0f0f0f]' : ''}
              ${config.clickable ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'}
              ${config.clickable ? 'hover:shadow-lg' : ''}
            `}
            title={config.clickable ? formatPeriodLabel(period) : `${formatPeriodLabel(period)} - ${config.label}`}
          >
            {/* Status Icon */}
            <div className={`absolute top-3 right-3 ${config.text}`}>
              {config.icon}
            </div>

            {/* Period Label */}
            <div className="pr-8">
              <div className="text-sm font-medium text-[#a3a3a3] mb-1">
                {period.type === 'Q1' ? '1ra Quincena' : '2da Quincena'}
              </div>
              <div className="text-lg font-bold text-[#f5f5f5]">
                {formatPeriodShort(period)}
              </div>
            </div>

            {/* Status Label */}
            <div className={`mt-3 text-xs font-medium ${config.text}`}>
              {config.label}
            </div>

            {/* Locked Tooltip */}
            {period.status === 'locked' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-[#0f0f0f]/90 rounded-2xl p-2">
                <p className="text-xs text-center text-[#d4d4d4]">
                  Completa el periodo anterior primero
                </p>
              </div>
            )}

            {/* Completed Badge */}
            {period.status === 'completed' && period.analysis && (
              <div className="mt-2 pt-2 border-t border-green-500/20">
                <div className="text-xs text-green-400">
                  ${period.analysis.incomes.totalIncome.toLocaleString()}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const PeriodSelectorSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-2xl" />
      ))}
    </div>
  );
};
