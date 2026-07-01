'use client';

import { useState, useCallback } from 'react';
import { DraftTransaction, ManualTransactionInput } from '@/types';

function generateTempId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useMonthDraft() {
  const [targetMonth, setTargetMonth] = useState<string>('');
  const [draftItems, setDraftItems] = useState<DraftTransaction[]>([]);
  const [editMode, setEditMode] = useState<'new' | 'replace' | 'merge'>('new');

  const addFromParsed = useCallback(
    (
      transactions: Array<{
        date: string;
        description: string;
        merchant: string;
        amount: number;
        type: 'income' | 'expense';
        owner?: 'Miguel' | 'Grecia';
        source?: string;
        account?: string;
        sourceFilename?: string;
      }>,
      sourceFilename?: string
    ) => {
      const newItems: DraftTransaction[] = transactions.map((tx) => ({
        tempId: generateTempId(),
        date: tx.date,
        description: tx.description,
        merchant: tx.merchant || tx.description,
        amount: tx.amount,
        type: tx.type,
        account: tx.account || 'unknown',
        origin: 'file' as const,
        sourceFilename: sourceFilename || tx.sourceFilename,
        owner: tx.owner,
        source: tx.source,
      }));
      setDraftItems((prev) => [...prev, ...newItems]);
    },
    []
  );

  const addManual = useCallback((input: ManualTransactionInput) => {
    const item: DraftTransaction = {
      tempId: generateTempId(),
      date: input.date,
      description: input.description,
      merchant: input.description,
      amount: input.amount,
      type: input.type,
      account: input.account,
      origin: 'manual',
    };
    setDraftItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((tempId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.tempId !== tempId));
  }, []);

  const clear = useCallback(() => {
    setDraftItems([]);
    setEditMode('new');
  }, []);

  const updateItem = useCallback((tempId: string, updates: Partial<DraftTransaction>) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, ...updates } : item))
    );
  }, []);

  return {
    targetMonth,
    setTargetMonth,
    draftItems,
    editMode,
    setEditMode,
    addFromParsed,
    addManual,
    removeItem,
    updateItem,
    clear,
  };
}
