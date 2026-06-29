import { parseAppleWalletCSV } from './appleWallet';
import { parseCapitalOneCSV } from './capitalOne';
import { parseBofaCSV } from './bofa';
import { ParsedTransaction } from './appleWallet';

export type BankSource = 'Apple Wallet' | 'Capital One' | 'Bank of America';

export const detectBankSource = (csvContent: string): BankSource | null => {
  const firstLines = csvContent.split('\n').slice(0, 3).join('\n').toLowerCase();
  
  if (firstLines.includes('transaction date') && firstLines.includes('clearing date')) {
    return 'Apple Wallet';
  }
  
  if (firstLines.includes('card no.') || firstLines.includes('capital one')) {
    return 'Capital One';
  }
  
  if (firstLines.includes('running bal') || firstLines.includes('bank of america')) {
    return 'Bank of America';
  }
  
  return null;
};

export const parseTransactions = (
  csvContent: string,
  source?: BankSource
): { transactions: ParsedTransaction[]; source: BankSource } => {
  const detectedSource = source || detectBankSource(csvContent);
  
  if (!detectedSource) {
    throw new Error('No se pudo detectar el formato del banco. Formatos soportados: Apple Wallet, Capital One, Bank of America');
  }
  
  let transactions: ParsedTransaction[] = [];
  
  switch (detectedSource) {
    case 'Apple Wallet':
      transactions = parseAppleWalletCSV(csvContent);
      break;
    case 'Capital One':
      transactions = parseCapitalOneCSV(csvContent);
      break;
    case 'Bank of America':
      transactions = parseBofaCSV(csvContent);
      break;
  }
  
  return { transactions, source: detectedSource };
};

export type { ParsedTransaction };
