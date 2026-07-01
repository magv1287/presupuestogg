'use client';

import { useState } from 'react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ManualTransactionInput } from '@/types';

interface ManualTransactionFormProps {
  accounts: string[];
  defaultDate?: string;
  onAdd: (input: ManualTransactionInput) => void;
}

export function ManualTransactionForm({ accounts, defaultDate, onAdd }: ManualTransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaultDate || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [account, setAccount] = useState(accounts[0] || '');

  const handleSubmit = () => {
    if (!date || !description || amount <= 0 || !account) return;
    onAdd({ date, description, amount, type, account });
    setDescription('');
    setAmount(0);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-3 border border-dashed border-[#374151] rounded-lg text-[#10B981] hover:bg-[#10B98110] transition-colors text-sm font-medium"
      >
        + Agregar transacción manual
      </button>
    );
  }

  return (
    <div className="border border-[#374151] rounded-xl p-4 space-y-4 bg-[#1F2937]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1">Cuenta</label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            {accounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#9CA3AF] mb-1">Descripción</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Whole Foods, Uber, Depósito nómina..."
          className="w-full px-3 py-2 bg-[#111827] border border-[#374151] rounded-lg text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1">Monto</label>
          <CurrencyInput value={amount} onChange={setAmount} />
        </div>
        <div>
          <label className="block text-xs text-[#9CA3AF] mb-1">Tipo</label>
          <div className="flex gap-2">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-[#EF444420] text-[#EF4444] border border-[#EF4444]'
                  : 'bg-[#111827] text-[#9CA3AF] border border-[#374151]'
              }`}
            >
              Gasto
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === 'income'
                  ? 'bg-[#10B98120] text-[#10B981] border border-[#10B981]'
                  : 'bg-[#111827] text-[#9CA3AF] border border-[#374151]'
              }`}
            >
              Ingreso
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 py-2 bg-[#111827] text-[#9CA3AF] rounded-lg text-sm hover:bg-[#374151] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!date || !description || amount <= 0}
          className="flex-1 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-50"
        >
          Agregar al borrador
        </button>
      </div>
    </div>
  );
}
