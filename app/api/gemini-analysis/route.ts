import { NextRequest, NextResponse } from 'next/server';
import { analyzeExpenses } from '@/lib/gemini';
import { MonthlyExpenses } from '@/types/transaction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthsData, monthlyIncomes } = body as { 
      monthsData: MonthlyExpenses[];
      monthlyIncomes: { [month: string]: { user1: number; user2: number; total: number } };
    };

    if (!monthsData || !Array.isArray(monthsData) || monthsData.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un mes de datos para analizar' },
        { status: 400 }
      );
    }

    if (!monthlyIncomes || Object.keys(monthlyIncomes).length === 0) {
      return NextResponse.json(
        { error: 'Se requieren los ingresos mensuales para cada periodo' },
        { status: 400 }
      );
    }

    const analysis = await analyzeExpenses(monthsData, monthlyIncomes);

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
