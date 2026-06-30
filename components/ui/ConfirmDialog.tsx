'use client';

import { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  const variantStyles = {
    danger: 'bg-[#EF4444] hover:bg-[#DC2626]',
    warning: 'bg-[#F59E0B] hover:bg-[#D97706]',
    info: 'bg-[#3B82F6] hover:bg-[#2563EB]',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">
          {title}
        </h3>
        <p className="text-[#9CA3AF] mb-6">
          {description}
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1F2937] text-[#F9FAFB] rounded-lg hover:bg-[#374151] transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${variantStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
