import { ParsedTransaction } from '@/types';
import { formatDate } from '@/lib/utils/dates';

interface AppleWalletRow {
  'Transaction Date': string;
  'Clearing Date': string;
  'Description': string;
  'Merchant': string;
  'Category': string;
  'Type': string; // "Debit" or "Credit"
  'Amount (USD)': string;
}

export function parseAppleWallet(rows: any[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  for (const row of rows) {
    const type = row['Type']?.trim();
    const category = row['Category']?.trim();
    const description = row['Description']?.trim();
    const amountStr = row['Amount (USD)']?.replace(/[$,]/g, '');
    const amount = Math.abs(parseFloat(amountStr));
    
    if (isNaN(amount) || amount === 0) continue;
    
    // EXCLUSION RULE: Credit card payments
    if (type === 'Credit' && (category === 'Payment' || description?.toLowerCase().includes('payment'))) {
      continue; // Skip credit card payments to avoid double-counting
    }
    
    // Determine transaction type
    const transactionType = type === 'Debit' ? 'expense' : 'income';
    
    const transaction: ParsedTransaction = {
      date: formatDate(new Date(row['Transaction Date'])),
      description: description || 'Unknown',
      merchant: row['Merchant']?.trim() || description || 'Unknown',
      amount,
      type: transactionType,
      excluded: false,
      flagged: false,
    };
    
    transactions.push(transaction);
  }
  
  return transactions;
}
