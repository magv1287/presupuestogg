import Papa from 'papaparse';
import { createHash } from 'crypto';

export interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  category: string;
  hash: string;
}

// Apple Wallet (Goldman Sachs) CSV format
// Expected columns: Transaction Date, Clearing Date, Description, Merchant, Category, Type, Amount (USD)
export const parseAppleWalletCSV = (csvContent: string): ParsedTransaction[] => {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const transactions: ParsedTransaction[] = [];

  for (const row of results.data as any[]) {
    try {
      const date = new Date(row['Transaction Date'] || row['Clearing Date']);
      const amount = parseFloat(row['Amount (USD)']?.replace(/[^0-9.-]/g, '') || '0');
      const description = row['Description'] || row['Merchant'] || 'Unknown';
      const category = row['Category'] || 'Uncategorized';

      // Create unique hash for deduplication
      const hash = createHash('md5')
        .update(`${date.toISOString()}-${amount}-${description}`)
        .digest('hex');

      transactions.push({
        date,
        amount,
        description,
        category,
        hash,
      });
    } catch (error) {
      console.error('Error parsing Apple Wallet row:', row, error);
    }
  }

  return transactions;
};
