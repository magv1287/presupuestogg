'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getAllHouseholdTransactions,
  getMonthlyAnalysis,
  saveMonthlyAnalysis,
  groupTransactionsByYearMonth,
  computeMonthMetrics,
  HouseholdTransaction,
  MonthlyAnalysis,
} from '@/lib/firebase/household';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { EmptyState } from '@/components/ui/EmptyState';
import { KPICard } from '@/components/ui/KPICard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils/currency';
import { getMonthLabel } from '@/lib/utils/dates';
import { Sparkles, RefreshCw, Pencil } from 'lucide-react';

function RelacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState<
    Record<number, Record<string, HouseholdTransaction[]>>
  >({});
  const [analysisMap, setAnalysisMap] = useState<Record<string, MonthlyAnalysis | null>>({});
  const [generatingMonth, setGeneratingMonth] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const transactions = await getAllHouseholdTransactions();
      setGrouped(groupTransactionsByYearMonth(transactions));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAnalysis = useCallback(async (monthKey: string) => {
    const analysis = await getMonthlyAnalysis(monthKey);
    setAnalysisMap((prev) => ({ ...prev, [monthKey]: analysis }));
  }, []);

  useEffect(() => {
    const monthParam = searchParams.get('month');
    if (monthParam) {
      setExpandedMonth(monthParam);
      loadAnalysis(monthParam);
    }
  }, [searchParams, loadAnalysis]);

  const handleGenerateAnalysis = async (monthKey: string, txs: HouseholdTransaction[]) => {
    setGeneratingMonth(monthKey);
    try {
      const metrics = computeMonthMetrics(txs);
      const categoryBreakdown = Object.entries(metrics.categoryBreakdown).map(
        ([category, amount]) => ({ category, amount })
      );
      const topTransactions = [...txs]
        .filter((tx) => tx.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map((tx) => ({
          description: tx.description,
          amount: tx.amount,
          category: tx.category,
        }));

      const [yearStr, monthStr] = monthKey.split('-');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(monthStr, 10),
          year: parseInt(yearStr, 10),
          monthKey,
          income: metrics.income,
          expenses: metrics.expenses,
          categoryBreakdown,
          topTransactions,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      await saveMonthlyAnalysis(monthKey, {
        monthLabel: getMonthLabel(monthKey),
        year: parseInt(yearStr, 10),
        totalIncome: metrics.income,
        totalExpenses: metrics.expenses,
        netSavings: metrics.netSavings,
        savingsRate: metrics.savingsRate,
        categoryBreakdown: metrics.categoryBreakdown,
        transactionCount: txs.filter((tx) => !tx.excluded).length,
        aiReport: data.aiReport,
        aiSummary: data.aiSummary,
        aiAnalysisStale: false,
      });

      await loadAnalysis(monthKey);
      addToast('success', `Análisis de ${getMonthLabel(monthKey)} generado correctamente`);
    } catch (error) {
      console.error('Error generating analysis:', error);
      addToast(
        'error',
        error instanceof Error
          ? error.message
          : 'No se pudo generar el análisis. Intenta de nuevo.'
      );
    } finally {
      setGeneratingMonth(null);
      setConfirmRegenerate(null);
    }
  };

  const handleEditMonth = (monthKey: string) => {
    router.push(`/dashboard/preparar?month=${monthKey}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]" />
      </div>
    );
  }

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  if (years.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F9FAFB] tracking-tight">
            Relación Mensual
          </h1>
          <p className="text-[#9CA3AF] mt-1">
            Historial de transacciones del hogar y análisis GonGar Advisor
          </p>
        </div>
        <EmptyState
          icon="📋"
          title="No hay transacciones del hogar"
          description="Carguen extractos bancarios para ver la relación mensual del hogar."
          ctaLabel="Preparar mes"
          ctaAction={() => router.push('/dashboard/preparar')}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB] tracking-tight">
          Relación Mensual
        </h1>
        <p className="text-[#9CA3AF] mt-1">
          Historial de transacciones del hogar y análisis GonGar Advisor
        </p>
      </div>

      <div className="space-y-6">
        {years.map((year) => {
          const months = Object.keys(grouped[year]).sort((a, b) => b.localeCompare(a));
          const isCurrentYear = year === new Date().getFullYear();

          return (
            <CollapsibleSection
              key={year}
              title={`${year}`}
              defaultOpen={isCurrentYear}
              variant="year"
            >
              <div className="space-y-4 mt-2">
                {months.map((monthKey, monthIndex) => {
                  const txs = grouped[year][monthKey];
                  const metrics = computeMonthMetrics(txs);
                  const analysis = analysisMap[monthKey];
                  const categoryData = Object.entries(metrics.categoryBreakdown).map(
                    ([category, amount]) => ({ category, amount })
                  );
                  const isExpanded =
                    expandedMonth === monthKey || (isCurrentYear && monthIndex === 0 && !expandedMonth);

                  return (
                    <CollapsibleSection
                      key={monthKey}
                      title={getMonthLabel(monthKey)}
                      defaultOpen={isExpanded}
                      variant="month"
                      onToggle={(open) => {
                        if (open && analysisMap[monthKey] === undefined) {
                          loadAnalysis(monthKey);
                        }
                      }}
                      badge={
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-[#10B981]">
                            +{formatCurrency(metrics.income)}
                          </span>
                          <span className="text-xs font-mono text-[#EF4444]">
                            -{formatCurrency(metrics.expenses)}
                          </span>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                              metrics.savingsRate > 15
                                ? 'bg-[#10B98120] text-[#10B981]'
                                : metrics.savingsRate >= 5
                                  ? 'bg-[#F59E0B20] text-[#F59E0B]'
                                  : 'bg-[#EF444420] text-[#EF4444]'
                            }`}
                          >
                            {metrics.savingsRate}%
                          </span>
                          {analysis?.aiAnalysisStale && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B20] text-[#F59E0B]">
                              ⚠️ Análisis desactualizado
                            </span>
                          )}
                          {analysis && !analysis.aiAnalysisStale && (
                            <span className="text-[#10B981]">✓</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMonth(monthKey);
                            }}
                            className="text-xs px-2 py-0.5 rounded-full bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151] transition-colors flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </button>
                        </div>
                      }
                    >
                      <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <KPICard icon="💰" label="Balance" value={metrics.netSavings} />
                          <KPICard icon="📈" label="Ingresos" value={metrics.income} />
                          <KPICard icon="💸" label="Gastos" value={metrics.expenses} />
                          <KPICard
                            icon="🏦"
                            label="Tasa Ahorro"
                            value={`${metrics.savingsRate}%`}
                          />
                        </div>

                        {categoryData.length > 0 && (
                          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                            <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">
                              Gastos por Categoría
                            </h3>
                            <div className="max-w-sm mx-auto">
                              <CategoryDonutChart data={categoryData} />
                            </div>
                          </div>
                        )}

                        <TransactionTable transactions={txs} onCategoryUpdated={loadData} />

                        <div className="bg-[#8B5CF620] border border-[#8B5CF640] rounded-2xl p-6">
                          {analysis ? (
                            <div>
                              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                <h4 className="text-lg font-semibold text-[#F9FAFB] flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                                  GonGar Advisor — {getMonthLabel(monthKey)}
                                  {analysis.aiAnalysisStale && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B20] text-[#F59E0B] font-normal">
                                      ⚠️ Análisis desactualizado
                                    </span>
                                  )}
                                </h4>
                                <button
                                  onClick={() => setConfirmRegenerate(monthKey)}
                                  className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] border border-[#374151] px-3 py-1.5 rounded-lg"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Regenerar
                                </button>
                              </div>
                              {analysis.aiAnalysisStale && (
                                <p className="text-sm text-[#F59E0B] mb-4">
                                  Los datos de este mes cambiaron. Consideren regenerar el análisis para
                                  reflejar la información actualizada del hogar.
                                </p>
                              )}
                              <div className="prose prose-invert max-w-none text-[#D1D5DB] whitespace-pre-wrap text-sm">
                                {analysis.aiReport}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Sparkles className="w-8 h-8 text-[#8B5CF6] mx-auto mb-3" />
                              <h4 className="text-lg font-semibold text-[#F9FAFB] mb-2">
                                GonGar Advisor está listo para analizar {getMonthLabel(monthKey)}
                              </h4>
                              <p className="text-sm text-[#9CA3AF] mb-4">
                                El análisis compara este mes con el historial del hogar y da
                                recomendaciones personalizadas.
                              </p>
                              <button
                                onClick={() => handleGenerateAnalysis(monthKey, txs)}
                                disabled={generatingMonth === monthKey}
                                className="px-6 py-3 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50"
                              >
                                {generatingMonth === monthKey
                                  ? 'Generando análisis...'
                                  : '✨ Generar Análisis'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>
                  );
                })}
              </div>
            </CollapsibleSection>
          );
        })}
      </div>

      {confirmRegenerate && (
        <ConfirmDialog
          isOpen={!!confirmRegenerate}
          title="¿Regenerar análisis?"
          description="Esto reemplazará el análisis guardado para este mes del hogar."
          confirmLabel="Regenerar"
          variant="warning"
          onConfirm={() => {
            const monthKey = confirmRegenerate;
            const [yearStr] = monthKey.split('-');
            const txs = grouped[parseInt(yearStr, 10)]?.[monthKey] || [];
            handleGenerateAnalysis(monthKey, txs);
          }}
          onClose={() => setConfirmRegenerate(null)}
        />
      )}
    </div>
  );
}

export default function RelacionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]" />
        </div>
      }
    >
      <RelacionContent />
    </Suspense>
  );
}
