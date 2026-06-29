'use client';

import React, { useState, useEffect } from 'react';
import { PeriodIncome } from '@/types/period';

interface IncomeInputProps {
  periodId: string;
  existingIncome?: PeriodIncome | null;
  onSave: (user1Income: number, user2Income: number) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const IncomeInput: React.FC<IncomeInputProps> = ({
  periodId,
  existingIncome,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [user1Income, setUser1Income] = useState('');
  const [user2Income, setUser2Income] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingIncome) {
      setUser1Income(existingIncome.user1Income.toString());
      setUser2Income(existingIncome.user2Income.toString());
    }
  }, [existingIncome]);

  const totalIncome = (parseFloat(user1Income) || 0) + (parseFloat(user2Income) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const income1 = parseFloat(user1Income);
    const income2 = parseFloat(user2Income);

    if (isNaN(income1) || income1 <= 0) {
      setError('Ingresa un ingreso válido para Grecia');
      return;
    }

    if (isNaN(income2) || income2 <= 0) {
      setError('Ingresa un ingreso válido para Miguel');
      return;
    }

    setSaving(true);
    try {
      await onSave(income1, income2);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los ingresos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#404040] rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#f5f5f5] mb-1">
            {isEditing ? 'Editar Ingresos Netos' : 'Ingresos Netos del Periodo'}
          </h3>
          <p className="text-sm text-[#a3a3a3]">
            Ingresa el dinero neto recibido (después de impuestos) para cada persona
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Grecia Input */}
          <div>
            <label className="block text-sm font-medium text-[#d4d4d4] mb-2">
              Grecia (gcgv25@gmail.com)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-lg">$</span>
              <input
                type="number"
                step="0.01"
                value={user1Income}
                onChange={(e) => setUser1Income(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#404040] rounded-lg text-[#f5f5f5] placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
                disabled={saving}
              />
            </div>
          </div>

          {/* Miguel Input */}
          <div>
            <label className="block text-sm font-medium text-[#d4d4d4] mb-2">
              Miguel (magv.1287@gmail.com)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-lg">$</span>
              <input
                type="number"
                step="0.01"
                value={user2Income}
                onChange={(e) => setUser2Income(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#404040] rounded-lg text-[#f5f5f5] placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Total Display */}
        <div className="p-4 bg-[#262626] border border-[#404040] rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#d4d4d4]">Ingreso Total del Hogar:</span>
            <span className="text-2xl font-bold text-[#10b981]">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-5 py-2.5 bg-[#262626] border border-[#404040] text-[#d4d4d4] rounded-lg hover:bg-[#404040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving || !user1Income || !user2Income}
            className="px-6 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white rounded-lg hover:from-[#60a5fa] hover:to-[#3b82f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? 'Actualizar Ingresos' : 'Guardar Ingresos'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
