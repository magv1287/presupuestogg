import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { CATEGORY_LIST } from '@/lib/utils/categories';

interface Transaction {
  id: string;
  description: string;
  merchant: string;
  amount: number;
}

export async function POST(req: NextRequest) {
  try {
    const { transactions }: { transactions: Transaction[] } = await req.json();

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions provided' }, { status: 400 });
    }

    const prompt = `Eres un asistente de categorización de transacciones financieras. 

Categorías disponibles: ${CATEGORY_LIST.join(', ')}

Transacciones a categorizar (formato: ID | Descripción | Comerciante | Monto):
${transactions.map((t) => `${t.id} | ${t.description} | ${t.merchant} | $${t.amount}`).join('\n')}

INSTRUCCIONES:
1. Asigna UNA categoría a cada transacción
2. Usa el contexto del comerciante y descripción
3. Responde SOLO con formato JSON: [{"id": "...", "category": "..."}]
4. NO incluyas explicaciones adicionales

Responde:`;

    const response = await generateText(prompt);

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const categorizations = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ categorizations });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to categorize transactions';
    console.error('Categorization error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
