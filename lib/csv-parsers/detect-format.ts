import { CSVFormat } from '@/types';

export function detectFormat(headers: string[]): CSVFormat {
  const headerStr = headers.join(',').toLowerCase();
  
  // Apple Card / Goldman Sachs HYSA
  // Columns: Transaction Date, Clearing Date, Description, Merchant, Category, Type, Amount (USD)
  if (
    headerStr.includes('transaction date') &&
    headerStr.includes('merchant') &&
    headerStr.includes('type') &&
    headerStr.includes('amount (usd)')
  ) {
    return 'apple-wallet';
  }
  
  // Capital One Credit Card + Savings
  // Columns: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
  if (
    headerStr.includes('transaction date') &&
    headerStr.includes('card no.') &&
    headerStr.includes('debit') &&
    headerStr.includes('credit')
  ) {
    return 'capital-one';
  }
  
  // Bank of America
  // Columns: Date, Description, Amount, Running Bal.
  if (
    headerStr.includes('date') &&
    headerStr.includes('description') &&
    headerStr.includes('amount') &&
    headerStr.includes('running bal')
  ) {
    return 'bank-of-america';
  }
  
  return 'unknown';
}
