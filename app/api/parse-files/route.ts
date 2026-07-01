import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csv-parsers';
import { parseFilename, bankToSource } from '@/lib/csv-parsers/parse-filename';
import { parseMonthHintToYearMonth } from '@/lib/utils/dates';
import { CSVFormat } from '@/types';

function formatToSource(format: CSVFormat) {
  if (format === 'unknown') return 'bank-of-america';
  return format;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const monthOverride = formData.get('month') as string | null;

    if (!files.length) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 });
    }

    const allTransactions: Array<{
      date: string;
      description: string;
      merchant: string;
      amount: number;
      type: 'income' | 'expense';
      owner?: 'Miguel' | 'Grecia';
      source?: string;
      account?: string;
      sourceFilename: string;
      needsReview?: boolean;
      reviewReason?: string;
    }> = [];

    const fileResults: Array<{
      filename: string;
      format: string;
      rowCount: number;
      errors: string[];
      needsOwnerBankConfirmation: boolean;
    }> = [];

    for (const file of files) {
      const filenameMeta = parseFilename(file.name);
      const parsed = await parseCSV(file);

      fileResults.push({
        filename: file.name,
        format: parsed.format,
        rowCount: parsed.transactions.length,
        errors: parsed.errors,
        needsOwnerBankConfirmation: !filenameMeta,
      });

      parsed.transactions.forEach((tx) => {
        allTransactions.push({
          ...tx,
          owner: filenameMeta?.owner || 'Miguel',
          source: filenameMeta ? bankToSource(filenameMeta.bank) : formatToSource(parsed.format),
          account: filenameMeta?.bank || parsed.format,
          sourceFilename: file.name,
        });
      });
    }

    return NextResponse.json({
      success: true,
      transactions: allTransactions.map((tx) => ({
        ...tx,
        month: monthOverride || tx.date.slice(0, 7),
      })),
      fileResults,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al procesar archivos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
