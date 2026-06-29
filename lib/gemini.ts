import { GoogleGenerativeAI } from '@google/generative-ai';
import { MonthlyExpenses } from '@/types/transaction';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiAnalysis {
  cutRecommendations: string[];
  increaseRecommendations: string[];
  investmentSuggestions: string[];
  summary: string;
}

export const analyzeExpenses = async (
  monthsData: MonthlyExpenses[],
  monthlyIncomes: { [month: string]: number }
): Promise<GeminiAnalysis> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Eres un asesor financiero experto. Analiza los siguientes datos de gastos mensuales de una familia y proporciona recomendaciones pragmáticas y realistas.

DATOS DE GASTOS:
${monthsData.map(month => `
Mes: ${month.month}
Total de Gastos: $${month.totalExpenses.toFixed(2)}
Ingresos Reales del Periodo: $${(monthlyIncomes[month.month] || 0).toFixed(2)}
Balance: $${((monthlyIncomes[month.month] || 0) - month.totalExpenses).toFixed(2)}
Categorías:
${Object.entries(month.categories).map(([cat, amount]) => `  - ${cat}: $${amount.toFixed(2)}`).join('\n')}
`).join('\n---\n')}

INSTRUCCIONES:
1. Identifica áreas donde se puede RECORTAR el gasto de forma REALISTA (no sugieras eliminar gastos esenciales).
2. Identifica áreas donde podría ser NECESARIO AUMENTAR el presupuesto (salud, educación, emergencias, etc.).
3. Basándote en el excedente o déficit REAL (ingresos vs gastos), proporciona sugerencias ESTRATÉGICAS de inversión o ahorro.
4. Sé directo, pragmático y específico. Usa números cuando sea posible.

Responde en formato JSON con esta estructura exacta:
{
  "cutRecommendations": ["recomendación 1", "recomendación 2", ...],
  "increaseRecommendations": ["recomendación 1", "recomendación 2", ...],
  "investmentSuggestions": ["sugerencia 1", "sugerencia 2", ...],
  "summary": "Resumen ejecutivo del análisis en 2-3 oraciones"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
    }
    
    const analysis: GeminiAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Error al analizar los gastos con IA');
  }
};
