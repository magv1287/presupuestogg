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
  const [monthlyIncomes, setMonthlyIncomes] = useState<{ [month: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIncomeInputs, setShowIncomeInputs] = useState(false);

  const handleMonthSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const month = e.target.value;
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
      const newIncomes = { ...monthlyIncomes };
      delete newIncomes[month];
      setMonthlyIncomes(newIncomes);
    } else {
      setSelectedMonths([...selectedMonths, month]);
      setMonthlyIncomes({ ...monthlyIncomes, [month]: '' });
    }
  };

  const handleIncomeChange = (month: string, value: string) => {
    setMonthlyIncomes({ ...monthlyIncomes, [month]: value });
  };

  const loadMonthsData = async () => {
    if (!user || selectedMonths.length === 0) return;

    // Validate that all incomes are filled
    const missingIncomes = selectedMonths.filter(month => !monthlyIncomes[month] || monthlyIncomes[month].trim() === '');
    if (missingIncomes.length > 0) {
      setError('Por favor, ingresa los ingresos para todos los meses seleccionados');
      return;
    }

    setLoading(true);
    setError(null);
    setShowIncomeInputs(false);

    try {
      const data: MonthlyExpenses[] = [];

      for (const monthStr of selectedMonths) {
        const [year, month] = monthStr.split('-').map(Number);
        const transactions = await getTransactionsByMonth(user.uid, year, month);

        const categories: { [key: string]: number } = {};
        let totalExpenses = 0;

        transactions.forEach(t => {
          if (t.amount < 0) {
            totalExpenses += Math.abs(t.amount);
            categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
          }
        });

        const income = parseFloat(monthlyIncomes[monthStr]) || 0;

        data.push({
          month: monthStr,
          totalExpenses,
          totalIncome: income,
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
      const incomesAsNumbers: { [month: string]: number } = {};
      Object.entries(monthlyIncomes).forEach(([month, value]) => {
        incomesAsNumbers[month] = parseFloat(value) || 0;
      });

      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          monthsData,
          monthlyIncomes: incomesAsNumbers
        }),
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
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecciona meses para comparar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {generateMonthOptions().map(month => (
                <label key={month} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    value={month}
                    checked={selectedMonths.includes(month)}
                    onChange={handleMonthSelect}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-all"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </span>
                </label>
              ))}
            </div>

            {/* Income Inputs */}
            {selectedMonths.length > 0 && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Ingresos por Periodo</h3>
                    <p className="text-sm text-blue-800">Ingresa los ingresos reales para cada mes seleccionado</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {selectedMonths.map(month => (
                    <div key={month}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {format(new Date(month + '-01'), 'MMMM yyyy')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={monthlyIncomes[month] || ''}
                          onChange={(e) => handleIncomeChange(month, e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={loadMonthsData}
                disabled={selectedMonths.length === 0 || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando...
                  </>
                ) : (
                  'Cargar Datos'
                )}
              </button>
              {monthsData.length > 0 && (
                <button
                  onClick={analyzeWithAI}
                  disabled={analyzing}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analizando...
                    </>
                  ) : (
                    <>
                      🤖 Analizar con IA
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          )}

          {/* Data Display */}
          {monthsData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen de Gastos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthsData.map(month => {
                  const balance = month.totalIncome - month.totalExpenses;
                  return (
                    <div key={month.month} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">
                        {format(new Date(month.month + '-01'), 'MMMM yyyy')}
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Ingresos:</span>
                          <span className="font-semibold text-green-600">${month.totalIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Gastos:</span>
                          <span className="font-semibold text-red-600">${month.totalExpenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="text-gray-700 font-medium">Balance:</span>
                          <span className={`font-bold text-lg ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${balance.toFixed(2)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-gray-700 font-medium mb-2">Top Categorías:</p>
                          {Object.entries(month.categories)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([cat, amount]) => (
                              <div key={cat} className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 truncate mr-2">{cat}</span>
                                <span className="text-gray-900 font-medium">${amount.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {analysis && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Análisis de IA</h2>
              </div>
              
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <span className="text-xl">✂️</span>
                    Recortar Gastos
                  </h3>
                  <ul className="space-y-3">
                    {analysis.cutRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-700 mb-4 flex items-center gap-2">
                    <span className="text-xl">📈</span>
                    Aumentar Presupuesto
                  </h3>
                  <ul className="space-y-3">
                    {analysis.increaseRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    Inversiones
                  </h3>
                  <ul className="space-y-3">
                    {analysis.investmentSuggestions.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
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
