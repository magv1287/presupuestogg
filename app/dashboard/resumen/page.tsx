'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  getHouseholdTransactionsByMonth,
  getHouseholdTransactionsByYear,
  getAverageMonthlyExpenses,
  updateHouseholdProfile,
  getMonthsWithAiReport,
  hasHouseholdTransactions,
  HouseholdTransaction,
} from '@/lib/firebase/household';
import { KPICard } from '@/components/ui/KPICard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { formatCurrency } from '@/lib/utils/currency';
import { SPANISH_MONTHS, SPANISH_MONTHS_SHORT, getMonthLabel } from '@/lib/utils/dates';

function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr, 10) };
}

export default function ResumenPage() {
  const router = useRouter();
  const { user, householdProfile } = useAuth();
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');
  const [analyzedMonths, setAnalyzedMonths] = useState<string[]>([]);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<HouseholdTransaction[]>([]);
  const [yearChartData, setYearChartData] = useState<
    Array<{ month: string; income: number; expenses: number }>
  >([]);
  const [avgExpenses, setAvgExpenses] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const [analyzed, hasTx, avg] = await Promise.all([
          getMonthsWithAiReport(),
          hasHouseholdTransactions(),
          getAverageMonthlyExpenses(3),
        ]);

        setAnalyzedMonths(analyzed);
        setHasTransactions(hasTx);
        setAvgExpenses(avg);

        if (analyzed.length === 0) {
          setTransactions([]);
          setYearChartData([]);
          return;
        }

        const activeMonthKey =
          selectedMonthKey && analyzed.includes(selectedMonthKey)
            ? selectedMonthKey
            : analyzed[0];

        if (activeMonthKey !== selectedMonthKey) {
          setSelectedMonthKey(activeMonthKey);
        }

        const { year, month } = parseMonthKey(activeMonthKey);
        const [monthData, yearData] = await Promise.all([
          getHouseholdTransactionsByMonth(year, month),
          getHouseholdTransactionsByYear(year),
        ]);

        setTransactions(monthData);

        const analyzedSet = new Set(analyzed);
        const monthlyTotals = SPANISH_MONTHS_SHORT.map((label, index) => {
          const monthKey = `${year}-${(index + 1).toString().padStart(2, '0')}`;
          if (!analyzedSet.has(monthKey)) {
            return { month: label, income: 0, expenses: 0 };
          }
          const monthTx = yearData.filter((tx) => tx.date.getMonth() === index);
          const income = monthTx
            .filter((tx) => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
          const expenses = monthTx
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
          return { month: label, income, expenses };
        });

        setYearChartData(monthlyTotals);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedMonthKey, user]);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  const categoryBreakdown = transactions
    .filter((t) => t.type === 'expense' && t.category)
    .reduce<Array<{ category: string; amount: number }>>((acc, t) => {
      const existing = acc.find((c) => c.category === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: t.category, amount: t.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount);

  const emergencyFund = householdProfile?.emergencyFund;
  const emergencyFundTarget = avgExpenses * (emergencyFund?.targetMonths || 3);
  const emergencyFundProgress =
    emergencyFundTarget > 0
      ? Math.min(100, Math.round(((emergencyFund?.currentBalance || 0) / emergencyFundTarget) * 100))
      : 0;

  const progressColor =
    emergencyFundProgress < 33
      ? 'from-[#EF4444] to-[#DC2626]'
      : emergencyFundProgress < 66
        ? 'from-[#F59E0B] to-[#D97706]'
        : 'from-[#10B981] to-[#059669]';

  const handleSavingsBalanceUpdate = async (index: number, balance: number) => {
    if (!householdProfile) return;
    const updated = [...householdProfile.savingsAccounts];
    updated[index] = { ...updated[index], balance };
    await updateHouseholdProfile({ savingsAccounts: updated });
  };

  const selectedParsed = selectedMonthKey ? parseMonthKey(selectedMonthKey) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]" />
      </div>
    );
  }

  const hasAnalyzedData = analyzedMonths.length > 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB] tracking-tight">
          Resumen Financiero
        </h1>
        <p className="text-[#9CA3AF] mt-1">
          Vista general de ingresos, gastos y ahorros del household
        </p>
      </div>

      {!hasTransactions ? (
        <EmptyState
          icon="📊"
          title="Aún no hay datos del hogar"
          description="Carguen el primer extracto bancario del hogar para ver el resumen financiero."
          ctaLabel="Preparar primer mes"
          ctaAction={() => router.push('/dashboard/preparar')}
        />
      ) : !hasAnalyzedData ? (
        <EmptyState
          icon="✨"
          title="Transacciones cargadas, análisis pendiente"
          description="Tienen transacciones cargadas pero sin analizar. Ve a Relación Mensual y genera el análisis de GonGar Advisor para ver el resumen aquí."
          ctaLabel="Ir a Relación Mensual"
          ctaAction={() => router.push('/dashboard/relacion')}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-8">
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="px-4 py-2 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              {analyzedMonths.map((monthKey) => (
                <option key={monthKey} value={monthKey}>
                  {getMonthLabel(monthKey)}
                </option>
              ))}
            </select>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon="📅"
              title="Sin transacciones para este mes"
              description="No hay transacciones registradas para el mes analizado seleccionado."
              ctaLabel="Ir a Relación Mensual"
              ctaAction={() => router.push('/dashboard/relacion')}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <KPICard icon="💰" label="Balance del Mes" value={savings} />
                <KPICard icon="📈" label="Ingresos Totales" value={income} />
                <KPICard icon="💸" label="Gastos Totales" value={expenses} />
                <KPICard icon="🏦" label="Tasa de Ahorro" value={`${savingsRate}%`} />
              </div>

              {emergencyFund && (
                <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#F9FAFB] mb-1">
                        Fondo de Emergencia
                      </h3>
                      <p className="text-sm text-[#9CA3AF]">
                        {formatCurrency(emergencyFund.currentBalance)} de{' '}
                        {formatCurrency(emergencyFundTarget)} meta ({emergencyFund.targetMonths}{' '}
                        meses de gastos)
                      </p>
                    </div>
                    <span className="text-2xl font-bold font-mono text-[#10B981]">
                      {emergencyFundProgress}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-[#1F2937] rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
                      style={{ width: `${emergencyFundProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
                    Ingresos vs Gastos — {selectedParsed?.year}
                  </h3>
                  {yearChartData.some((d) => d.income > 0 || d.expenses > 0) ? (
                    <IncomeExpenseChart data={yearChartData} />
                  ) : (
                    <EmptyState
                      icon="📈"
                      title="Sin datos de gráfica"
                      description="Carguen extractos del hogar para ver la tendencia anual."
                    />
                  )}
                </div>

                <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">
                    Gastos por Categoría —{' '}
                    {selectedParsed ? SPANISH_MONTHS[selectedParsed.month - 1] : ''}
                  </h3>
                  {categoryBreakdown.length > 0 ? (
                    <div className="max-w-sm mx-auto">
                      <CategoryDonutChart data={categoryBreakdown} />
                    </div>
                  ) : (
                    <EmptyState
                      icon="🍩"
                      title="Sin gastos categorizados"
                      description="No hay gastos categorizados en este mes."
                    />
                  )}
                </div>
              </div>

              {categoryBreakdown.length > 0 && (
                <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
                    Top Categorías de Gasto
                  </h3>
                  <div className="space-y-3">
                    {categoryBreakdown.slice(0, 5).map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <span className="text-[#F9FAFB]">{cat.category}</span>
                        <span className="text-[#10B981] font-semibold font-mono">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {householdProfile && householdProfile.savingsAccounts.length > 0 && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Cuentas de Ahorro</h3>
              <div className="space-y-4">
                {householdProfile.savingsAccounts.map((account, index) => (
                  <div
                    key={account.name}
                    className="flex items-center justify-between gap-4 p-4 bg-[#1F2937] rounded-lg"
                  >
                    <span className="text-[#F9FAFB] font-medium">{account.name}</span>
                    <div className="w-40">
                      <CurrencyInput
                        value={account.balance}
                        onChange={(balance) => handleSavingsBalanceUpdate(index, balance)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xl font-bold font-mono text-[#10B981] mt-4">
                Total en Ahorro:{' '}
                {formatCurrency(
                  householdProfile.savingsAccounts.reduce((sum, a) => sum + a.balance, 0)
                )}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
