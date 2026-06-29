import Papa from 'papaparse';
import { createHash } from 'crypto';
import { ParsedTransaction } from './appleWallet';

// Capital One CSV format
// Expected columns: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
export const parseCapitalOneCSV = (csvContent: string): ParsedTransaction[] => {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const transactions: ParsedTransaction[] = [];

  for (const row of results.data as any[]) {
    try {
      const date = new Date(row['Transaction Date'] || row['Posted Date']);
      const debit = parseFloat(row['Debit']?.replace(/[^0-9.-]/g, '') || '0');
      const credit = parseFloat(row['Credit']?.replace(/[^0-9.-]/g, '') || '0');
      const amount = debit !== 0 ? -debit : credit;
      const description = row['Description'] || 'Unknown';
      const category = row['Category'] || 'Uncategorized';

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
      console.error('Error parsing Capital One row:', row, error);
    }
  }

  return transactions;
};
