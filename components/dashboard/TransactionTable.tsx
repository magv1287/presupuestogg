'use client';

import { useState } from 'react';
import { HouseholdTransaction, updateHouseholdTransactionCategory } from '@/lib/firebase/household';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
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
      <table className="w-full text-sm table-fixed min-w-[720px]">
        <colgroup>
          <col className="w-[100px]" />
          <col className="w-[28%]" />
          <col className="w-[16%]" />
          <col className="w-[110px]" />
          <col className="w-[14%]" />
          <col className="w-[100px]" />
        </colgroup>
        <thead>
          <tr className="text-[#9CA3AF] border-b border-[#1F2937]">
            <th className="text-left py-3 px-4 whitespace-nowrap">Fecha</th>
            <th className="text-left py-3 px-4 whitespace-nowrap">Descripción</th>
            <th className="text-left py-3 px-4 whitespace-nowrap">Categoría</th>
            <th className="text-right py-3 px-4 whitespace-nowrap">Monto</th>
            <th className="text-left py-3 px-4 whitespace-nowrap">Cuenta</th>
            <th className="text-left py-3 px-4 whitespace-nowrap">Origen</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const uncategorized = tx.needsReview || !tx.category;
            const origin = getOriginLabel(tx);

            return (
              <tr
                key={tx.id}
                className={`border-b border-[#1F2937] ${
                  tx.type === 'income' ? 'bg-[#10B98110]' : 'bg-[#EF444410]'
                } ${tx.excluded ? 'opacity-50' : ''}`}
              >
                <td className="py-3 px-4 text-[#9CA3AF] whitespace-nowrap">
                  {tx.date.toLocaleDateString('es-ES')}
                </td>
                <td className="py-3 px-4 text-[#F9FAFB] break-words">{tx.description}</td>
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
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <AmountDisplay
                    amount={tx.type === 'income' ? tx.amount : -tx.amount}
                    size="sm"
                  />
                </td>
                <td className="py-3 px-4 text-[#9CA3AF] whitespace-nowrap">
                  {getAccountLabel(tx)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#1F2937] text-[#9CA3AF]">
                    <span>{origin.emoji}</span>
                    <span>{origin.label}</span>
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
