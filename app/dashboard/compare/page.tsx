'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTransactionsByMonth } from '@/lib/firebase/firestore';
import { MonthlyExpenses } from '@/types/transaction';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Compare() {
  const { user } = useAuth();
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [monthsData, setMonthsData] = useState<MonthlyExpenses[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMonthSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const month = e.target.value;
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const loadMonthsData = async () => {
    if (!user || selectedMonths.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const data: MonthlyExpenses[] = [];

      for (const monthStr of selectedMonths) {
        const [year, month] = monthStr.split('-').map(Number);
        const transactions = await getTransactionsByMonth(user.uid, year, month);

        const categories: { [key: string]: number } = {};
        let totalExpenses = 0;
        let totalIncome = 0;

        transactions.forEach(t => {
          if (t.amount < 0) {
            totalExpenses += Math.abs(t.amount);
            categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
          } else {
            totalIncome += t.amount;
          }
        });

        data.push({
          month: monthStr,
          totalExpenses,
          totalIncome,
          categories,
          transactions,
        });
      }

      setMonthsData(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (monthsData.length === 0) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthsData }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Error al analizar con IA');
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la IA');
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate last 12 months
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(format(date, 'yyyy-MM'));
    }
    return months;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Comparar Meses</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Month Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecciona meses para comparar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generateMonthOptions().map(month => (
                <label key={month} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={month}
                    checked={selectedMonths.includes(month)}
                    onChange={handleMonthSelect}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{format(new Date(month + '-01'), 'MMMM yyyy')}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={loadMonthsData}
                disabled={selectedMonths.length === 0 || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Cargando...' : 'Cargar Datos'}
              </button>
              {monthsData.length > 0 && (
                <button
                  onClick={analyzeWithAI}
                  disabled={analyzing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {analyzing ? 'Analizando...' : '🤖 Analizar con IA'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Data Display */}
          {monthsData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Gastos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthsData.map(month => (
                  <div key={month.month} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">{format(new Date(month.month + '-01'), 'MMMM yyyy')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gastos:</span>
                        <span className="font-medium text-red-600">${month.totalExpenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos:</span>
                        <span className="font-medium text-green-600">${month.totalIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Balance:</span>
                        <span className={`font-medium ${month.totalIncome - month.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(month.totalIncome - month.totalExpenses).toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-gray-600 font-medium mb-1">Categorías:</p>
                        {Object.entries(month.categories).slice(0, 5).map(([cat, amount]) => (
                          <div key={cat} className="flex justify-between text-xs">
                            <span className="text-gray-500">{cat}:</span>
                            <span>${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {analysis && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Análisis de IA</h2>
              
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-800">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">✂️ Recortar Gastos</h3>
                  <ul className="space-y-2">
                    {analysis.cutRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">• {rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-yellow-600 mb-3">📈 Aumentar Presupuesto</h3>
                  <ul className="space-y-2">
                    {analysis.increaseRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">• {rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-green-600 mb-3">💰 Inversiones</h3>
                  <ul className="space-y-2">
                    {analysis.investmentSuggestions.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
