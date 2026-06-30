import Papa from 'papaparse';
import { detectFormat } from './detect-format';
import { parseAppleWallet } from './apple-wallet';
import { parseCapitalOne } from './capital-one';
import { parseBankOfAmerica } from './bank-of-america';
import { ParsedTransaction, CSVFormat } from '@/types';

export interface ParseResult {
  transactions: ParsedTransaction[];
  format: CSVFormat;
  errors: string[];
}

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        
        if (!results.data || results.data.length === 0) {
          errors.push('El archivo CSV está vacío');
          resolve({ transactions: [], format: 'unknown', errors });
          return;
        }
        
        // Detect format
        const headers = Object.keys(results.data[0] as any);
        const format = detectFormat(headers);
        
        if (format === 'unknown') {
          errors.push('Formato de CSV no reconocido. Formatos soportados: Apple Wallet, Capital One, Bank of America');
          resolve({ transactions: [], format: 'unknown', errors });
          return;
        }
        
        // Parse based on format
        let transactions: ParsedTransaction[] = [];
        
        try {
          switch (format) {
            case 'apple-wallet':
              transactions = parseAppleWallet(results.data);
              break;
            case 'capital-one':
              transactions = parseCapitalOne(results.data);
              break;
            case 'bank-of-america':
              transactions = parseBankOfAmerica(results.data);
              break;
          }
        } catch (error: any) {
          errors.push(`Error al parsear CSV: ${error.message}`);
        }
        
        resolve({ transactions, format, errors });
      },
      error: (error) => {
        resolve({
          transactions: [],
          format: 'unknown',
          errors: [`Error al leer archivo: ${error.message}`],
        });
      },
    });
  });
}
