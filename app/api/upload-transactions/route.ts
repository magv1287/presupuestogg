import { NextRequest, NextResponse } from 'next/server';
import { parseTransactions, BankSource } from '@/lib/parsers';
import { addTransaction } from '@/lib/firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const source = formData.get('source') as BankSource | undefined;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Archivo y userId son requeridos' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();

    // Parse transactions
    const { transactions, source: detectedSource } = parseTransactions(csvContent, source);

    // Save to Firestore
    const results = await Promise.allSettled(
      transactions.map(async (transaction) => {
        return addTransaction({
          userId,
          date: transaction.date,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          source: detectedSource,
          hash: transaction.hash,
        });
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `${successful} transacciones procesadas, ${failed} fallidas`,
      total: transactions.length,
      successful,
      failed,
      source: detectedSource,
    });
  } catch (error: any) {
    console.error('Error uploading transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}
