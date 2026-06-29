'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Sidebar } from '@/components/Sidebar';
import { PeriodSelector } from '@/components/PeriodSelector';
import { IncomeInput } from '@/components/IncomeInput';
import { getTransactionsByPeriod, savePeriodIncome, savePeriodAnalysis } from '@/lib/firebase/firestore';
import { getPeriodAnalysis, canAnalyzePeriod } from '@/lib/periodValidation';
import { generatePeriodList, formatPeriodLabel } from '@/lib/periodUtils';
import { Period, PeriodWithStatus, PeriodExpenses } from '@/types/period';
import { MonthlyExpenses } from '@/types/transaction';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Compare() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [periods, setPeriods] = useState<PeriodWithStatus[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [currentPeriodAnalysis, setCurrentPeriodAnalysis] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadPeriods();
    }
  }, [user]);

  const loadPeriods = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const periodList = generatePeriodList(6); // Últimos 6 meses = 12 quincenas
      const periodsWithStatus: PeriodWithStatus[] = [];

      for (const period of periodList) {
        const analysis = await getPeriodAnalysis(period.id, user.uid);
        const validation = await canAnalyzePeriod(period, user.uid);

        let status: 'completed' | 'available' | 'locked' | 'in-progress' = 'locked';
        
        if (analysis) {
          status = analysis.isCompleted ? 'completed' : 'in-progress';
        } else if (validation.allowed) {
          status = 'available';
        }

        periodsWithStatus.push({
          ...period,
          status,
          analysis: analysis || undefined,
        });
      }

      setPeriods(periodsWithStatus);
    } catch (error: any) {
      addToast('error', error.message || 'Error al cargar periodos');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodSelect = async (period: Period) => {
    if (!user) return;

    setSelectedPeriod(period);
    setAnalysis(null);
    setShowIncomeInput(false);

    // Cargar análisis existente si hay
    const existingAnalysis = await getPeriodAnalysis(period.id, user.uid);
    setCurrentPeriodAnalysis(existingAnalysis);

    if (existingAnalysis?.isCompleted) {
      // Mostrar análisis completado
      setAnalysis(existingAnalysis.geminiAnalysis);
    } else {
      // Mostrar input de ingresos
      setShowIncomeInput(true);
    }
  };

  const handleSaveIncome = async (user1Income: number, user2Income: number) => {
    if (!user || !selectedPeriod) return;

    try {
      await savePeriodIncome(user.uid, selectedPeriod.id, user1Income, user2Income);
      addToast('success', 'Ingresos guardados exitosamente');
      setShowIncomeInput(false);
      
      // Recargar periodos para actualizar estados
      await loadPeriods();
      
      // Proceder a cargar transacciones y analizar
      await analyzeSelectedPeriod(user1Income, user2Income);
    } catch (error: any) {
      throw new Error(error.message || 'Error al guardar ingresos');
    }
  };

  const analyzeSelectedPeriod = async (user1Income: number, user2Income: number) => {
    if (!user || !selectedPeriod) return;

    setAnalyzing(true);
    try {
      // Validar que se puede analizar
      const validation = await canAnalyzePeriod(selectedPeriod, user.uid);
      if (!validation.allowed) {
        addToast('error', validation.reason || 'No se puede analizar este periodo');
        return;
      }

      // Cargar transacciones del periodo
      const transactions = await getTransactionsByPeriod(
        user.uid,
        selectedPeriod.startDate,
        selectedPeriod.endDate
      );

      // Calcular gastos por categoría
      const categories: { [key: string]: number } = {};
      let totalExpenses = 0;

      transactions.forEach(t => {
        if (t.amount < 0) {
          totalExpenses += Math.abs(t.amount);
          categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
        }
      });

      const monthData: MonthlyExpenses = {
        month: formatPeriodLabel(selectedPeriod),
        totalExpenses,
        totalIncome: user1Income + user2Income,
        categories,
        transactions,
      };

      // Llamar a Gemini
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthsData: [monthData],
          monthlyIncomes: {
            [formatPeriodLabel(selectedPeriod)]: {
              user1: user1Income,
              user2: user2Income,
              total: user1Income + user2Income,
            },
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const geminiAnalysis = data.analysis;
        setAnalysis(geminiAnalysis);

        // Guardar análisis completo en Firestore
        const expenses: PeriodExpenses = {
          periodId: selectedPeriod.id,
          totalExpenses,
          categories,
          transactionCount: transactions.length,
        };

        await savePeriodAnalysis(user.uid, selectedPeriod.id, expenses, geminiAnalysis);
        
        addToast('success', '¡Análisis completado exitosamente!');
        
        // Recargar periodos
        await loadPeriods();
      } else {
        addToast('error', data.error || 'Error al analizar con IA');
      }
    } catch (error: any) {
      addToast('error', error.message || 'Error al analizar el periodo');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Sidebar />
        
        <main className="ml-64 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#e5e5e5] mb-2">Análisis Quincenal</h2>
            <p className="text-[#a3a3a3]">Gestiona y analiza tus gastos por quincena</p>
          </div>
          {/* Period Selection */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#f5f5f5] mb-2">Selecciona una Quincena</h2>
              <p className="text-[#a3a3a3]">
                Solo puedes analizar periodos si el anterior ya está completado
              </p>
            </div>
            
            <PeriodSelector
              periods={periods}
              selectedPeriod={selectedPeriod}
              onSelectPeriod={handlePeriodSelect}
              loading={loading}
            />
          </div>

          {/* Income Input */}
          {showIncomeInput && selectedPeriod && (
            <div className="mb-8">
              <IncomeInput
                periodId={selectedPeriod.id}
                existingIncome={currentPeriodAnalysis?.incomes || null}
                onSave={handleSaveIncome}
                isEditing={!!currentPeriodAnalysis}
              />
            </div>
          )}

          {/* Analyzing State */}
          {analyzing && (
            <div className="bg-[#1a1a1a] border border-[#404040] rounded-2xl p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-12 w-12 text-[#3b82f6]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-[#f5f5f5] mb-1">Analizando con IA...</h3>
                  <p className="text-[#a3a3a3]">Esto puede tomar unos segundos</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {analysis && !analyzing && (
            <div className="bg-[#1a1a1a] border border-[#404040] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#f5f5f5]">Análisis de IA</h2>
                  <p className="text-[#a3a3a3]">{selectedPeriod && formatPeriodLabel(selectedPeriod)}</p>
                </div>
              </div>
              
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-[#d4d4d4] leading-relaxed text-lg">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">✂️</span>
                    Recortar Gastos
                  </h3>
                  <ul className="space-y-3">
                    {analysis.cutRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-[#d4d4d4] flex gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <h3 className="font-semibold text-yellow-400 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">📈</span>
                    Aumentar Presupuesto
                  </h3>
                  <ul className="space-y-3">
                    {analysis.increaseRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-[#d4d4d4] flex gap-2">
                        <span className="text-yellow-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-2xl">💰</span>
                    Inversiones
                  </h3>
                  <ul className="space-y-3">
                    {analysis.investmentSuggestions.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-[#d4d4d4] flex gap-2">
                        <span className="text-green-400 font-bold">•</span>
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
