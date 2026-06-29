import Papa from 'papaparse';
import { createHash } from 'crypto';
import { ParsedTransaction } from './appleWallet';

// Bank of America CSV format
// Expected columns: Date, Description, Amount, Running Bal.
export const parseBofaCSV = (csvContent: string): ParsedTransaction[] => {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const transactions: ParsedTransaction[] = [];

  for (const row of results.data as any[]) {
    try {
      const date = new Date(row['Date'] || row['Posted Date']);
      const amount = parseFloat(row['Amount']?.replace(/[^0-9.-]/g, '') || '0');
      const description = row['Description'] || row['Payee'] || 'Unknown';
      // BOFA doesn't always provide category, so we'll default to Uncategorized
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
      console.error('Error parsing BOFA row:', row, error);
    }
  }

  return transactions;
};
