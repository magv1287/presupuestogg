import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AnalysisRequest {
  month: string;
  year: number;
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
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // 3-Layer Prompt System for GonGar Advisor
    const systemPrompt = `Eres GonGar Advisor, un asistente financiero personal experto en análisis de presupuestos familiares. 

Tu personalidad:
- Empático y comprensivo
- Directo pero amable
- Enfocado en acciones concretas
- Usa lenguaje casual pero profesional

Tu objetivo: Ayudar a Miguel y Gaby a tomar mejores decisiones financieras.`;

    const contextPrompt = `Contexto del periodo ${data.month} ${data.year}:

RESUMEN FINANCIERO:
- Ingresos: $${data.income.toFixed(2)}
- Gastos: $${data.expenses.toFixed(2)}
- Balance: $${(data.income - data.expenses).toFixed(2)}
- Tasa de ahorro: ${((1 - data.expenses / data.income) * 100).toFixed(1)}%

DESGLOSE POR CATEGORÍA:
${data.categoryBreakdown.map(c => `- ${c.category}: $${c.amount.toFixed(2)} (${((c.amount / data.expenses) * 100).toFixed(1)}%)`).join('\n')}

TOP 5 TRANSACCIONES:
${data.topTransactions.map((t, i) => `${i + 1}. ${t.description} - $${t.amount.toFixed(2)} (${t.category})`).join('\n')}

${data.previousMonth ? `COMPARACIÓN CON MES ANTERIOR:
- Ingresos: ${data.previousMonth.income > data.income ? '↓' : '↑'} ${Math.abs(((data.income - data.previousMonth.income) / data.previousMonth.income) * 100).toFixed(1)}%
- Gastos: ${data.previousMonth.expenses > data.expenses ? '↓' : '↑'} ${Math.abs(((data.expenses - data.previousMonth.expenses) / data.previousMonth.expenses) * 100).toFixed(1)}%` : ''}`;

    const taskPrompt = `Genera un análisis financiero en formato JSON con esta estructura EXACTA:

{
  "summary": "Resumen ejecutivo en 2-3 oraciones sobre la salud financiera del mes",
  "insights": [
    "Insight 1: Observación específica con datos",
    "Insight 2: Patrón o tendencia identificada",
    "Insight 3: Comparación o contexto relevante"
  ],
  "recommendations": [
    "Recomendación 1: Acción concreta y específica",
    "Recomendación 2: Estrategia de optimización",
    "Recomendación 3: Meta o hábito a desarrollar"
  ],
  "alerts": [
    "Alerta 1: Área de preocupación si aplica"
  ],
  "score": 85
}

REGLAS:
1. El score es de 0-100 basado en: tasa de ahorro (40%), balance categorías (30%), tendencias (30%)
2. Insights deben incluir números específicos
3. Recommendations deben ser accionables
4. Alerts solo si hay problemas reales (gastos >90% ingresos, categoría >40% del total, etc.)
5. Usa lenguaje directo y personal
6. NO uses markdown, solo JSON puro

Responde SOLO con el JSON:`;

    const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\n${taskPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
