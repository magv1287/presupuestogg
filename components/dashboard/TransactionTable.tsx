'use client';

import { useState } from 'react';
import { HouseholdTransaction, updateHouseholdTransactionCategory } from '@/lib/firebase/household';
import { Pill } from '@/components/ui/Pill';
import { CATEGORY_LIST } from '@/lib/utils/categories';

const SOURCE_LABELS: Record<string, string> = {
  'apple-wallet': 'Apple Wallet',
  'capital-one': 'Capital One',
  'bank-of-america': 'Bank of America',
  manual: 'Manual',
};

function getOriginLabel(tx: HouseholdTransaction): { label: string; emoji: string } {
  if (tx.source === 'manual') {
    return { label: 'Manual', emoji: '✍️' };
  }
  return { label: 'Archivo', emoji: '📄' };
}

function getAccountLabel(tx: HouseholdTransaction): string {
  if (tx.account && tx.account !== 'unknown' && tx.account !== 'screenshot') {
    return tx.account;
  }
  return SOURCE_LABELS[tx.source] || tx.source;
}

interface TransactionTableProps {
  transactions: HouseholdTransaction[];
  onCategoryUpdated?: () => void;
}

export function TransactionTable({ transactions, onCategoryUpdated }: TransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleCategorySelect = async (txId: string, category: string) => {
    setSavingId(txId);
    try {
      await updateHouseholdTransactionCategory(txId, category);
      setEditingId(null);
      onCategoryUpdated?.();
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1F2937]">
            <th className="text-left py-3 px-4 text-[#9CA3AF] font-medium">Fecha</th>
            <th className="text-left py-3 px-4 text-[#9CA3AF] font-medium">Descripción</th>
            <th className="text-left py-3 px-4 text-[#9CA3AF] font-medium">Categoría</th>
            <th className="text-right py-3 px-4 text-[#9CA3AF] font-medium">Monto</th>
            <th className="text-left py-3 px-4 text-[#9CA3AF] font-medium">Cuenta</th>
            <th className="text-left py-3 px-4 text-[#9CA3AF] font-medium">Origen</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const uncategorized = tx.needsReview || !tx.category;
            const origin = getOriginLabel(tx);

            return (
              <tr
                key={tx.id}
                className={`border-b border-[#1F2937] hover:bg-[#1F2937] transition-colors ${
                  tx.excluded ? 'opacity-50' : ''
                }`}
              >
                <td className="py-3 px-4 text-[#9CA3AF] font-mono text-xs whitespace-nowrap">
                  {tx.date.toLocaleDateString('es-ES')}
                </td>
                <td className="py-3 px-4 text-[#F9FAFB]">{tx.description}</td>
                <td className="py-3 px-4">
                  {uncategorized ? (
                    editingId === tx.id ? (
                      <select
                        autoFocus
                        disabled={savingId === tx.id}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleCategorySelect(tx.id, e.target.value);
                        }}
                        onBlur={() => setEditingId(null)}
                        className="w-full px-2 py-1 text-xs bg-[#1F2937] border border-[#F59E0B] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                      >
                        <option value="">Elegir categoría...</option>
                        {CATEGORY_LIST.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        title="La categorización con IA falló para esta transacción. Haz clic para asignar manualmente."
                        onClick={() => setEditingId(tx.id)}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B20] text-[#F59E0B] border border-[#F59E0B40] hover:bg-[#F59E0B30] transition-colors whitespace-nowrap"
                      >
                        ⚠️ Sin categorizar
                      </button>
                    )
                  ) : (
                    <Pill category={tx.category} size="sm" />
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                  <span className={tx.type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#9CA3AF] whitespace-nowrap">
                  {getAccountLabel(tx)}
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-[#6B7280]">
                    {origin.emoji} {origin.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
