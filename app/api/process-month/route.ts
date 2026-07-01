import { NextRequest, NextResponse } from 'next/server';
import { categorizeBatch, CategorizationError } from '@/lib/csv-parsers/categorize-batch';
import {
  detectInternalTransfers,
  TransactionWithMeta,
} from '@/lib/csv-parsers/detect-internal-transfers';
import { DraftTransaction } from '@/types';

interface ProcessMonthRequest {
  targetMonth: string;
  editMode: 'new' | 'replace' | 'merge';
  draftItems: DraftTransaction[];
  existingTransactions?: Array<{
    date: string;
    amount: number;
    merchant: string;
    description: string;
    type: 'income' | 'expense';
    category: string;
    source: string;
    account: string;
    owner: 'Miguel' | 'Grecia';
    excluded: boolean;
    flagged: boolean;
  }>;
}

function isDuplicate(
  tx: { date: string; amount: number; merchant: string },
  existing: Array<{ date: string; amount: number; merchant: string }>
): boolean {
  return existing.some(
    (e) => e.date === tx.date && e.amount === tx.amount && e.merchant === tx.merchant
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessMonthRequest = await request.json();
    const { targetMonth, editMode, draftItems, existingTransactions = [] } = body;

    if (!targetMonth || !draftItems?.length) {
      return NextResponse.json({ error: 'Mes y borrador son requeridos' }, { status: 400 });
    }

    const [yearStr, monthStr] = targetMonth.split('-');

    const parsedDraft: TransactionWithMeta[] = draftItems.map((item) => ({
      date: item.date,
      description: item.description,
      merchant: item.merchant || item.description,
      amount: item.amount,
      type: item.type,
      owner: item.owner || 'Miguel',
      source: item.source || (item.origin === 'manual' ? 'manual' : 'bank-of-america'),
      account: item.account,
      month: targetMonth,
      excluded: false,
      flagged: false,
    }));

    let combinedForTransferDetection = [...parsedDraft];

    if (editMode === 'merge' && existingTransactions.length > 0) {
      const existingAsMeta: TransactionWithMeta[] = existingTransactions.map((tx) => ({
        date: tx.date,
        description: tx.description,
        merchant: tx.merchant,
        amount: tx.amount,
        type: tx.type,
        owner: tx.owner,
        source: tx.source,
        account: tx.account,
        month: targetMonth,
        excluded: tx.excluded,
        flagged: tx.flagged,
        category: tx.category,
      }));
      combinedForTransferDetection = [...existingAsMeta, ...parsedDraft];
    }

    const { transactions: withTransfers, internalTransferCount } =
      detectInternalTransfers(combinedForTransferDetection);

    const newItemsOnly =
      editMode === 'merge'
        ? withTransfers.slice(existingTransactions.length)
        : withTransfers;

    const eligibleIndices = newItemsOnly
      .map((tx, index) => ({ tx, index }))
      .filter(({ tx }) => !tx.excluded);

    let categorizations: Map<
      number,
      { category: string; confidence: number; type: 'income' | 'expense' }
    >;

    try {
      categorizations = await categorizeBatch(
        eligibleIndices.map(({ tx }) => tx),
        eligibleIndices.map(({ index }) => index)
      );
    } catch (error) {
      const message =
        error instanceof CategorizationError
          ? 'No se pudo categorizar automáticamente. Intenta de nuevo o revisa la conexión con Gemini.'
          : error instanceof Error
            ? error.message
            : 'Error de categorización';
      return NextResponse.json({ error: message, categorizationFailed: true }, { status: 503 });
    }

    const existingForDupCheck =
      editMode === 'merge'
        ? existingTransactions.map((tx) => ({
            date: tx.date,
            amount: tx.amount,
            merchant: tx.merchant,
          }))
        : [];

    const processed = newItemsOnly.map((tx, index) => {
      const cat = categorizations.get(index);
      const uncategorized = !cat;
      return {
        date: tx.date,
        description: tx.description,
        merchant: tx.merchant,
        amount: tx.amount,
        type: cat?.type || tx.type,
        category: cat?.category || '',
        owner: (tx.owner || 'Miguel') as 'Miguel' | 'Grecia',
        source: (tx.source === 'manual'
          ? 'manual'
          : tx.source || 'bank-of-america') as 'apple-wallet' | 'capital-one' | 'bank-of-america' | 'manual',
        account: tx.account || 'unknown',
        month: targetMonth,
        year: parseInt(yearStr, 10),
        excluded: tx.excluded || false,
        flagged: tx.flagged || false,
        exclusionReason: tx.exclusionReason,
        confidence: cat?.confidence ?? 0,
        needsReview: uncategorized || (cat?.confidence ?? 0) < 0.7,
        uploadId: `process-${Date.now()}`,
        isDuplicate: isDuplicate(tx, existingForDupCheck),
      };
    });

    const newTransactions = processed.filter((tx) => !tx.isDuplicate);
    const duplicateCount = processed.length - newTransactions.length;

    const allForMetrics =
      editMode === 'merge'
        ? [
            ...existingTransactions.filter((tx) => !tx.excluded),
            ...newTransactions.filter((tx) => !tx.excluded),
          ]
        : newTransactions.filter((tx) => !tx.excluded);

    const income = allForMetrics
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = allForMetrics
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

    const categoryBreakdown = allForMetrics
      .filter((tx) => tx.type === 'expense' && tx.category)
      .reduce<Record<string, number>>((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

    return NextResponse.json({
      success: true,
      transactions: newTransactions.map(({ isDuplicate: _, ...tx }) => tx),
      internalTransferCount,
      duplicateCount,
      metrics: { income, expenses, netSavings, savingsRate, categoryBreakdown },
      transactionCount: allForMetrics.length,
      editMode,
      removedCount: editMode === 'replace' ? existingTransactions.length : 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al procesar mes';
    console.error('Process month error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
