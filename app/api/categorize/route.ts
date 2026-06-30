import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORIES = [
  'Comida',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Hogar',
  'Ropa',
  'Tecnología',
  'Viajes',
  'Servicios',
  'Ahorro/Inversión',
  'Ingresos',
  'Otros',
];

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
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Batch categorization prompt
    const prompt = `Eres un asistente de categorización de transacciones financieras. 

Categorías disponibles: ${CATEGORIES.join(', ')}

Transacciones a categorizar (formato: ID | Descripción | Comerciante | Monto):
${transactions.map(t => `${t.id} | ${t.description} | ${t.merchant} | $${t.amount}`).join('\n')}

INSTRUCCIONES:
1. Asigna UNA categoría a cada transacción
2. Usa el contexto del comerciante y descripción
3. Responde SOLO con formato JSON: [{"id": "...", "category": "..."}]
4. NO incluyas explicaciones adicionales

Responde:`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const categorizations = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json({ categorizations });
  } catch (error: any) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to categorize transactions' },
      { status: 500 }
    );
  }
}
