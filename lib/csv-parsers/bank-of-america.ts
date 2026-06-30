import { ParsedTransaction } from '@/types';
import { formatDate } from '@/lib/utils/dates';

interface BankOfAmericaRow {
  'Date': string;
  'Description': string;
  'Amount': string;
  'Running Bal.': string;
}

export function parseBankOfAmerica(rows: any[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  for (const row of rows) {
    const description = row['Description']?.trim();
    const amountStr = row['Amount']?.replace(/[$,]/g, '');
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount === 0) continue;
    
    const descLower = description?.toLowerCase() || '';
    
    // Determine transaction type
    const transactionType = amount < 0 ? 'expense' : 'income';
    
    // FLAGGING RULE: Transfers between accounts
    let flagged = false;
    if (
      descLower.includes('transfer') ||
      descLower.includes('online banking transfer') ||
      descLower.includes('zelle')
    ) {
      flagged = true; // Flag for manual review
    }
    
    const transaction: ParsedTransaction = {
      date: formatDate(new Date(row['Date'])),
      description: description || 'Unknown',
      merchant: description || 'Unknown',
      amount: Math.abs(amount),
      type: transactionType,
      excluded: false,
      flagged,
    };
    
    transactions.push(transaction);
  }
  
  return transactions;
}
