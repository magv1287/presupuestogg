import { ParsedTransaction } from '@/types';
import { formatDate } from '@/lib/utils/dates';

interface CapitalOneRow {
  'Transaction Date': string;
  'Posted Date': string;
  'Card No.': string;
  'Description': string;
  'Category': string;
  'Debit': string;
  'Credit': string;
}

export function parseCapitalOne(rows: any[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  for (const row of rows) {
    const description = row['Description']?.trim();
    const debitStr = row['Debit']?.replace(/[$,]/g, '');
    const creditStr = row['Credit']?.replace(/[$,]/g, '');
    
    const debit = parseFloat(debitStr) || 0;
    const credit = parseFloat(creditStr) || 0;
    
    const amount = debit > 0 ? debit : credit;
    
    if (isNaN(amount) || amount === 0) continue;
    
    // EXCLUSION RULE: Credit card payments
    const descLower = description?.toLowerCase() || '';
    if (
      descLower.includes('payment thank you') ||
      descLower.includes('online payment') ||
      descLower.includes('autopay')
    ) {
      continue; // Skip payments to avoid double-counting
    }
    
    // Determine transaction type
    const transactionType = debit > 0 ? 'expense' : 'income';
    
    const transaction: ParsedTransaction = {
      date: formatDate(new Date(row['Transaction Date'])),
      description: description || 'Unknown',
      merchant: description || 'Unknown',
      amount,
      type: transactionType,
      excluded: false,
      flagged: false,
    };
    
    transactions.push(transaction);
  }
  
  return transactions;
}
