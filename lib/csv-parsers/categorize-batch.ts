import { CATEGORY_LIST } from '@/lib/utils/categories';
import { generateText } from '@/lib/gemini';
import { TransactionWithMeta } from '@/lib/csv-parsers/detect-internal-transfers';

export class CategorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategorizationError';
  }
}

export async function categorizeBatch(
  transactions: TransactionWithMeta[],
  globalIndices: number[]
): Promise<Map<number, { category: string; confidence: number; type: 'income' | 'expense' }>> {
  const results = new Map<
    number,
    { category: string; confidence: number; type: 'income' | 'expense' }
  >();

  if (transactions.length === 0) return results;

  const batchSize = 50;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const batchIndices = globalIndices.slice(i, i + batchSize);
    const prompt = `Eres un categorizador experto de transacciones financieras personales en Estados Unidos.

Categoriza cada transacción en EXACTAMENTE UNA de estas categorías:
${CATEGORY_LIST.join(', ')}

Transacciones a categorizar:
${JSON.stringify(
  batch.map((tx, idx) => ({
    index: idx,
    description: tx.description,
    merchant: tx.merchant,
    amount: tx.amount,
    type: tx.type,
  }))
)}

Responde ÚNICAMENTE con un JSON array válido:
[{"index": 0, "category": "Supermercado", "confidence": 0.95, "type": "expense"}]`;

    try {
      const response = await generateText(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new CategorizationError('Respuesta de Gemini no parseable como JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        index: number;
        category: string;
        confidence: number;
        type: 'income' | 'expense';
      }>;

      if (parsed.length === 0 && batch.length > 0) {
        throw new CategorizationError('Gemini no devolvió categorizaciones');
      }

      const batchResults = new Set<number>();
      parsed.forEach((item) => {
        const globalIndex = batchIndices[item.index];
        if (globalIndex !== undefined) {
          results.set(globalIndex, item);
          batchResults.add(globalIndex);
        }
      });

      if (batchResults.size < batch.length) {
        throw new CategorizationError(
          `Faltan categorizaciones para ${batch.length - batchResults.size} transacciones`
        );
      }
    } catch (error) {
      if (error instanceof CategorizationError) throw error;
      throw new CategorizationError(
        error instanceof Error ? error.message : 'Error al categorizar con Gemini'
      );
    }
  }

  return results;
}
