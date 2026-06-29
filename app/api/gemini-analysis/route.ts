import { NextRequest, NextResponse } from 'next/server';
import { analyzeExpenses } from '@/lib/gemini';
import { MonthlyExpenses } from '@/types/transaction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthsData } = body as { monthsData: MonthlyExpenses[] };

    if (!monthsData || !Array.isArray(monthsData) || monthsData.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un mes de datos para analizar' },
        { status: 400 }
      );
    }

    const analysis = await analyzeExpenses(monthsData);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error in Gemini analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Error al analizar los gastos' },
      { status: 500 }
    );
  }
}
