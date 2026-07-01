import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';

interface AnalysisRequest {
  month: number;
  year: number;
  monthKey: string;
  income: number;
  expenses: number;
  categoryBreakdown: { category: string; amount: number }[];
  topTransactions: { description: string; amount: number; category: string }[];
  previousMonth?: {
    income: number;
    expenses: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const data: AnalysisRequest = await req.json();

    const netSavings = data.income - data.expenses;
    const savingsRate = data.income > 0 ? (netSavings / data.income) * 100 : 0;

    const systemPrompt = `Eres GonGar Advisor, el asesor financiero personal y exclusivo de la familia González-García (Miguel y Grecia).

TUS PRINCIPIOS:
1. Nunca recomiendas stocks individuales — solo ETFs de índice (VTI, VXUS, BND, SGOV)
2. Siempre priorizas el fondo de emergencia antes de cualquier inversión
3. Eres específico con cifras — nunca dices "considera ahorrar más"
4. Nunca inventas datos — solo usas los que se te proporcionan
5. Escribes siempre en español`;

    const contextPrompt = `DATOS DEL MES: ${data.monthKey}

INGRESOS TOTALES: $${data.income.toFixed(2)}
GASTOS TOTALES: $${data.expenses.toFixed(2)}
AHORRO NETO: $${netSavings.toFixed(2)} (${savingsRate.toFixed(1)}%)

GASTOS POR CATEGORÍA:
${JSON.stringify(data.categoryBreakdown, null, 2)}

TOP TRANSACCIONES:
${JSON.stringify(data.topTransactions, null, 2)}

${data.previousMonth ? `MES ANTERIOR: Ingresos $${data.previousMonth.income} | Gastos $${data.previousMonth.expenses}` : 'Sin datos de mes anterior.'}`;

    const instructionPrompt = `Genera el análisis siguiendo EXACTAMENTE esta estructura con estos títulos y emojis:

## 📊 SITUACIÓN DE ${data.month}/${data.year}

[2-3 oraciones sobre el mes]

## 📈 VS PERÍODO ANTERIOR

[Comparación concreta o indicar si es el primer mes]

## ⚠️ ÁREAS DE ATENCIÓN

[Máximo 4 categorías destacadas]

## ✂️ RECOMENDACIONES — CPA

[3-5 recomendaciones accionables con montos]

## 📈 DÓNDE PONER EL DINERO — Inversor

[Recomendaciones basadas en ahorro disponible]

RESUMEN_PARA_HISTORIAL: [Una oración de máximo 100 caracteres]

Límite: 700 palabras.`;

    const response = await generateText(
      `${contextPrompt}\n\n${instructionPrompt}`,
      systemPrompt
    );

    if (!response || response.trim().length < 50) {
      throw new Error('Gemini devolvió un reporte vacío o inválido');
    }

    const summaryMatch = response.match(/RESUMEN_PARA_HISTORIAL:\s*(.+)/);
    const aiSummary = summaryMatch ? summaryMatch[1].trim() : '';
    const aiReport = response.replace(/RESUMEN_PARA_HISTORIAL:[\s\S]+/, '').trim();

    if (!aiReport) {
      throw new Error('No se pudo generar el reporte de análisis');
    }

    return NextResponse.json({ aiReport, aiSummary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate analysis';
    console.error('Analysis error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
