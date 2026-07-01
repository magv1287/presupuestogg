'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface EditMonthDialogProps {
  isOpen: boolean;
  monthLabel: string;
  existingCount: number;
  onReplace: () => void;
  onMerge: () => void;
  onClose: () => void;
}

export function EditMonthDialog({
  isOpen,
  monthLabel,
  existingCount,
  onReplace,
  onMerge,
  onClose,
}: EditMonthDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">
            {monthLabel} ya tiene datos
          </h3>
          <p className="text-[#9CA3AF] mb-6">
            Este mes tiene {existingCount} transaccion{existingCount !== 1 ? 'es' : ''} guardada
            {existingCount !== 1 ? 's' : ''}. ¿Cómo desean continuar?
          </p>
          <div className="space-y-3">
            <button
              onClick={onMerge}
              className="w-full px-4 py-3 bg-[#10B98120] border border-[#10B981] text-[#10B981] rounded-lg hover:bg-[#10B98130] transition-colors font-medium text-sm"
            >
              Agregar / Mergear — conservar datos existentes
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full px-4 py-3 bg-[#EF444420] border border-[#EF4444] text-[#EF4444] rounded-lg hover:bg-[#EF444430] transition-colors font-medium text-sm"
            >
              Empezar de cero — borrar todo y reconstruir
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-[#9CA3AF] hover:text-[#F9FAFB] text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="¿Empezar de cero?"
        description={`Esto eliminará las ${existingCount} transacciones existentes de ${monthLabel}. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar y empezar de cero"
        variant="danger"
        onConfirm={() => {
          setShowConfirm(false);
          onReplace();
        }}
        onClose={() => setShowConfirm(false)}
      />
    </>
  );
}
