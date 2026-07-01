import { ParsedTransaction } from '@/types';

export interface TransactionWithMeta extends ParsedTransaction {
  id?: string;
  owner?: 'Miguel' | 'Grecia';
  source?: string;
  account?: string;
  month?: string;
  exclusionReason?: string;
}

const INTERNAL_TRANSFER_KEYWORDS = [
  'online banking transfer',
  'payment thank you',
  'online payment',
  'autopay',
  'transfer to',
  'transfer from',
  'zelle payment to',
];

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.abs(Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) <= 0.01;
}

function applyKeywordExclusions(transactions: TransactionWithMeta[]): TransactionWithMeta[] {
  return transactions.map((tx) => {
    const desc = `${tx.description} ${tx.merchant}`.toLowerCase();
    const isKeywordMatch = INTERNAL_TRANSFER_KEYWORDS.some((kw) => desc.includes(kw));

    if (isKeywordMatch && !tx.excluded) {
      return {
        ...tx,
        excluded: true,
        exclusionReason: 'internal_transfer',
      };
    }
    return tx;
  });
}

function applyPairMatching(transactions: TransactionWithMeta[]): {
  transactions: TransactionWithMeta[];
  internalTransferCount: number;
} {
  const result = transactions.map((tx) => ({ ...tx }));
  const matched = new Set<number>();
  let internalTransferCount = 0;

  for (let i = 0; i < result.length; i++) {
    if (matched.has(i) || result[i].excluded) continue;

    for (let j = i + 1; j < result.length; j++) {
      if (matched.has(j) || result[j].excluded) continue;

      const a = result[i];
      const b = result[j];

      const isOppositeTypes =
        (a.type === 'expense' && b.type === 'income') ||
        (a.type === 'income' && b.type === 'expense');

      if (
        isOppositeTypes &&
        amountsMatch(a.amount, b.amount) &&
        daysBetween(a.date, b.date) <= 2 &&
        a.source !== b.source
      ) {
        result[i] = {
          ...result[i],
          excluded: true,
          exclusionReason: 'internal_transfer',
        };
        result[j] = {
          ...result[j],
          excluded: true,
          exclusionReason: 'internal_transfer',
        };
        matched.add(i);
        matched.add(j);
        internalTransferCount += 1;
        break;
      }
    }
  }

  return { transactions: result, internalTransferCount };
}

export function detectInternalTransfers(transactions: TransactionWithMeta[]): {
  transactions: TransactionWithMeta[];
  internalTransferCount: number;
} {
  const withKeywords = applyKeywordExclusions(transactions);
  const keywordCount = withKeywords.filter(
    (tx) => tx.excluded && tx.exclusionReason === 'internal_transfer'
  ).length;

  const { transactions: withPairs, internalTransferCount: pairCount } =
    applyPairMatching(withKeywords);

  return {
    transactions: withPairs,
    internalTransferCount: keywordCount + pairCount,
  };
}
