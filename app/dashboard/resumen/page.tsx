'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getHouseholdTransactionsByMonth } from '@/lib/firebase/household';
import { KPICard } from '@/components/ui/KPICard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/currency';
import { SPANISH_MONTHS } from '@/lib/utils/dates';
import { Sidebar } from '@/components/Sidebar';

export default function ResumenPage() {
  const { user, householdProfile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await getHouseholdTransactionsByMonth(selectedYear, selectedMonth);
        setTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedMonth, selectedYear, user]);
  
  // Calculate metrics from real data
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  
  // Category breakdown
  const categoryBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(c => c.category === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: t.category, amount: t.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount);
  
  // Emergency fund progress
  const emergencyFund = householdProfile?.emergencyFund;
  const avgMonthlyExpenses = expenses; // Simplified - could calculate 3-month average
  const emergencyFundTarget = avgMonthlyExpenses * (emergencyFund?.targetMonths || 3);
  const emergencyFundProgress = emergencyFundTarget > 0 
    ? Math.min(100, Math.round(((emergencyFund?.currentBalance || 0) / emergencyFundTarget) * 100))
    : 0;
  
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
        </div>
      </div>
    );
  }
  
  const hasData = transactions.length > 0;
  
  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">Resumen Financiero</h1>
          <p className="text-[#9CA3AF]">Vista general de ingresos, gastos y ahorros</p>
        </div>
        
        {/* Month Selector */}
        <div className="flex gap-4 mb-8">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            {SPANISH_MONTHS.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-[#111827] border border-[#1F2937] rounded-lg text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {!hasData ? (
          <EmptyState
            icon="📊"
            title="No hay datos para este mes"
            description="Sube tus archivos CSV bancarios para ver tu resumen financiero."
            ctaLabel="Subir CSVs"
            ctaAction={() => window.location.href = '/dashboard/upload'}
          />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                icon="💰"
                label="Ingresos"
                value={income}
              />
              
              <KPICard
                icon="💸"
                label="Gastos"
                value={expenses}
              />
              
              <KPICard
                icon="🏦"
                label="Ahorros"
                value={savings}
              />
              
              <KPICard
                icon="📈"
                label="Tasa de Ahorro"
                value={`${savingsRate}%`}
              />
            </div>
            
            {/* Emergency Fund Card */}
            {emergencyFund && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#F9FAFB] mb-1">
                      🛡️ Fondo de Emergencia
                    </h3>
                    <p className="text-sm text-[#9CA3AF]">
                      Meta: {emergencyFund.targetMonths} meses de gastos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#10B981]">
                      {formatCurrency(emergencyFund.currentBalance)}
                    </p>
                    <p className="text-sm text-[#9CA3AF]">
                      de {formatCurrency(emergencyFundTarget)}
                    </p>
                  </div>
                </div>
                
                <div className="relative h-4 bg-[#1F2937] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-500"
                    style={{ width: `${emergencyFundProgress}%` }}
                  />
                </div>
                
                <p className="text-sm text-[#9CA3AF] mt-2 text-center">
                  {emergencyFundProgress}% completado
                </p>
              </div>
            )}
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
                  Ingresos vs Gastos
                </h3>
                <IncomeExpenseChart
                  data={[
                    {
                      month: SPANISH_MONTHS[selectedMonth - 1].substring(0, 3),
                      income,
                      expenses
                    }
                  ]}
                />
              </div>
              
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
                  Gastos por Categoría
                </h3>
                {categoryBreakdown.length > 0 ? (
                  <CategoryDonutChart data={categoryBreakdown} />
                ) : (
                  <p className="text-[#9CA3AF] text-center py-8">
                    No hay gastos en este mes
                  </p>
                )}
              </div>
            </div>
            
            {/* Top Categories */}
            {categoryBreakdown.length > 0 && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
                  Top Categorías de Gasto
                </h3>
                <div className="space-y-3">
                  {categoryBreakdown.slice(0, 5).map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-[#F9FAFB]">{cat.category}</span>
                      <span className="text-[#10B981] font-semibold">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
