'use client';

import { DraftTransaction } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthLabel } from '@/lib/utils/dates';

interface DraftTransactionListProps {
  items: DraftTransaction[];
  targetMonth: string;
  onRemove: (tempId: string) => void;
}

export function DraftTransactionList({ items, targetMonth, onRemove }: DraftTransactionListProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-[#9CA3AF] text-sm">
        No hay transacciones en el borrador. Sube archivos o agrega transacciones manuales.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#9CA3AF] mb-4">
        {items.length} transaccion{items.length !== 1 ? 'es' : ''} en borrador
        {targetMonth ? ` para ${getMonthLabel(targetMonth)}` : ''}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#9CA3AF] border-b border-[#1F2937]">
              <th className="text-left py-2 px-3">Fecha</th>
              <th className="text-left py-2 px-3">Descripción</th>
              <th className="text-right py-2 px-3">Monto</th>
              <th className="text-left py-2 px-3">Cuenta</th>
              <th className="text-left py-2 px-3">Origen</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.tempId} className="border-b border-[#1F2937] hover:bg-[#1F2937]">
                <td className="py-2 px-3 text-[#9CA3AF]">
                  {new Date(item.date + 'T12:00:00').toLocaleDateString('es-ES')}
                </td>
                <td className="py-2 px-3 text-[#F9FAFB]">{item.description}</td>
                <td
                  className={`py-2 px-3 text-right font-mono ${
                    item.type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}
                  {formatCurrency(item.amount)}
                </td>
                <td className="py-2 px-3 text-[#9CA3AF]">{item.account}</td>
                <td className="py-2 px-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.origin === 'file'
                        ? 'bg-[#3B82F620] text-[#3B82F6]'
                        : 'bg-[#8B5CF620] text-[#8B5CF6]'
                    }`}
                  >
                    {item.origin === 'file' ? 'Archivo' : 'Manual'}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => onRemove(item.tempId)}
                    className="text-[#EF4444] hover:text-[#DC2626] text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
