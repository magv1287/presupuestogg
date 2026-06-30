'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { KPICard } from '@/components/ui/KPICard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { formatCurrency } from '@/lib/utils/currency';
import { SPANISH_MONTHS } from '@/lib/utils/dates';

export default function ResumenPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  
  // Mock data - replace with real Firestore queries
  const mockData = {
    income: 8500,
    expenses: 6200,
    savings: 2300,
    savingsRate: 27,
    categoryBreakdown: [
      { category: 'Comida', amount: 1200 },
      { category: 'Transporte', amount: 800 },
      { category: 'Entretenimiento', amount: 600 },
      { category: 'Hogar', amount: 1500 },
      { category: 'Salud', amount: 400 },
      { category: 'Otros', amount: 1700 },
    ],
    monthlyTrend: [
      { month: 'Oct', income: 8000, expenses: 6500 },
      { month: 'Nov', income: 8200, expenses: 6100 },
      { month: 'Dic', income: 8500, expenses: 6200 },
    ],
  };
  
  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 500);
  }, [selectedMonth, selectedYear]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">
          Resumen Financiero
        </h1>
        <p className="text-[#9CA3AF]">
          {SPANISH_MONTHS[selectedMonth]} {selectedYear}
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Ingresos"
          value={mockData.income}
          comparison={{ value: 3.7, direction: 'up' }}
        />
        
        <KPICard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          label="Gastos"
          value={mockData.expenses}
          comparison={{ value: 1.6, direction: 'up' }}
        />
        
        <KPICard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Ahorro"
          value={mockData.savings}
          comparison={{ value: 12.3, direction: 'up' }}
        />
        
        <KPICard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          label="Tasa de Ahorro"
          value={`${mockData.savingsRate}%`}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
            Tendencia Mensual
          </h3>
          <IncomeExpenseChart data={mockData.monthlyTrend} />
        </div>
        
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
            Gastos por Categoría
          </h3>
          <CategoryDonutChart data={mockData.categoryBreakdown} />
        </div>
      </div>
      
      {/* Top Categories */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">
          Top Categorías
        </h3>
        <div className="space-y-3">
          {mockData.categoryBreakdown
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((cat, index) => {
              const percentage = (cat.amount / mockData.expenses) * 100;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#F9FAFB]">
                        {cat.category}
                      </span>
                      <span className="text-sm text-[#9CA3AF]">
                        {formatCurrency(cat.amount)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
