import { NextRequest, NextResponse } from 'next/server';
import { generateFromImage } from '@/lib/gemini';
import { parseFilename, bankToSource } from '@/lib/csv-parsers/parse-filename';

interface ExtractedTransaction {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
}

async function extractTransactionsFromImage(
  buffer: ArrayBuffer,
  mimeType: 'image/png' | 'image/jpeg'
): Promise<{ transactions: ExtractedTransaction[]; error?: string }> {
  const base64 = Buffer.from(buffer).toString('base64');

  const prompt = `Eres un extractor de transacciones financieras de capturas de pantalla de apps bancarias en Estados Unidos.

Analiza esta imagen y extrae TODAS las transacciones visibles (fecha, descripción/comercio, monto).

Reglas:
- date: formato YYYY-MM-DD (infiere el año si no aparece, usa el año actual)
- description: texto legible de la transacción
- merchant: nombre del comercio o descripción corta
- amount: número positivo (sin símbolo $)
- type: "income" para depósitos/créditos, "expense" para débitos/gastos

Responde ÚNICAMENTE con un JSON array válido, sin markdown:
[{"date":"2026-06-15","description":"Whole Foods","merchant":"Whole Foods","amount":45.32,"type":"expense"}]

Si no puedes leer transacciones, responde con un array vacío: []`;

  try {
    const response = await generateFromImage(base64, mimeType, prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return {
        transactions: [],
        error: 'No pudimos leer esta captura automáticamente. Ingresa las transacciones manualmente.',
      };
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExtractedTransaction[];
    const valid = parsed.filter(
      (tx) =>
        tx.date &&
        tx.description &&
        typeof tx.amount === 'number' &&
        tx.amount > 0 &&
        (tx.type === 'income' || tx.type === 'expense')
    );

    if (valid.length === 0) {
      return {
        transactions: [],
        error: 'No pudimos leer esta captura automáticamente. Ingresa las transacciones manualmente.',
      };
    }

    return {
      transactions: valid.map((tx) => ({
        ...tx,
        merchant: tx.merchant || tx.description,
      })),
    };
  } catch {
    return {
      transactions: [],
      error: 'No pudimos leer esta captura automáticamente. Ingresa las transacciones manualmente.',
    };
  }
}

function getImageMimeType(filename: string): 'image/png' | 'image/jpeg' | null {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const monthOverride = formData.get('month') as string | null;

    if (!files.length) {
      return NextResponse.json({ error: 'No se recibieron imágenes' }, { status: 400 });
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
    }> = [];

    const fileResults: Array<{
      filename: string;
      format: string;
      rowCount: number;
      errors: string[];
      needsOwnerBankConfirmation: boolean;
    }> = [];

    for (const file of files) {
      const mimeType = getImageMimeType(file.name);
      if (!mimeType) {
        fileResults.push({
          filename: file.name,
          format: 'screenshot',
          rowCount: 0,
          errors: ['Formato no soportado. Usa .png, .jpg o .jpeg'],
          needsOwnerBankConfirmation: false,
        });
        continue;
      }

      const filenameMeta = parseFilename(file.name.replace(/\.(png|jpe?g)$/i, '.csv'));
      const buffer = await file.arrayBuffer();
      const { transactions, error } = await extractTransactionsFromImage(buffer, mimeType);

      const errors: string[] = [];
      if (error) errors.push(error);

      fileResults.push({
        filename: file.name,
        format: 'screenshot',
        rowCount: transactions.length,
        errors,
        needsOwnerBankConfirmation: !filenameMeta,
      });

      transactions.forEach((tx) => {
        allTransactions.push({
          ...tx,
          owner: filenameMeta?.owner || 'Miguel',
          source: filenameMeta ? bankToSource(filenameMeta.bank) : 'bank-of-america',
          account: filenameMeta?.bank || 'screenshot',
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
    const message = error instanceof Error ? error.message : 'Error al procesar capturas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
