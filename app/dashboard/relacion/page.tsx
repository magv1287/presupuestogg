'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Pill } from '@/components/ui/Pill';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { formatCurrency } from '@/lib/utils/currency';
import { SPANISH_MONTHS } from '@/lib/utils/dates';

export default function RelacionPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // Mock data - replace with real Firestore queries
  const mockData = {
    categories: [
      {
        name: 'Comida',
        total: 1200,
        transactions: [
          { id: '1', date: '2024-12-15', description: 'Whole Foods', amount: 150, excluded: false },
          { id: '2', date: '2024-12-10', description: 'Trader Joes', amount: 85, excluded: false },
          { id: '3', date: '2024-12-05', description: 'Restaurant', amount: 65, excluded: false },
        ],
      },
      {
        name: 'Transporte',
        total: 800,
        transactions: [
          { id: '4', date: '2024-12-20', description: 'Uber', amount: 45, excluded: false },
          { id: '5', date: '2024-12-18', description: 'Gas Station', amount: 60, excluded: false },
        ],
      },
      {
        name: 'Entretenimiento',
        total: 600,
        transactions: [
          { id: '6', date: '2024-12-22', description: 'Netflix', amount: 15.99, excluded: false },
          { id: '7', date: '2024-12-12', description: 'Movie Theater', amount: 45, excluded: false },
        ],
      },
    ],
    aiAnalysis: {
      summary: 'Este mes tuviste un buen control de gastos. La tasa de ahorro del 27% está por encima del promedio.',
      insights: [
        'Comida representa el 19% de tus gastos, dentro del rango saludable (15-25%)',
        'Gastos de transporte aumentaron 15% vs mes anterior',
        'Entretenimiento se mantuvo estable en ~$600/mes',
      ],
      recommendations: [
        'Considera meal prep para reducir gastos en restaurantes',
        'Evalúa opciones de transporte público para reducir costos de Uber',
        'Mantén el buen control en entretenimiento',
      ],
      score: 85,
    },
  };
  
  useEffect(() => {
    // Simulate data loading + AI analysis
    setTimeout(() => {
      setAnalysis(mockData.aiAnalysis);
      setLoading(false);
    }, 1000);
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
          Relación Mensual
        </h1>
        <p className="text-[#9CA3AF]">
          {SPANISH_MONTHS[selectedMonth]} {selectedYear}
        </p>
      </div>
      
      {/* GonGar Advisor Analysis */}
      {analysis && (
        <div className="bg-gradient-to-br from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-[#F9FAFB]">
                  GonGar Advisor
                </h3>
                <span className="px-3 py-1 bg-[#10B981] text-white text-sm font-semibold rounded-full">
                  Score: {analysis.score}/100
                </span>
              </div>
              <p className="text-[#E5E7EB] mb-4">
                {analysis.summary}
              </p>
              
              {/* Insights */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[#10B981] mb-2">💡 Insights</h4>
                <ul className="space-y-2">
                  {analysis.insights.map((insight: string, index: number) => (
                    <li key={index} className="text-sm text-[#D1D5DB] flex items-start gap-2">
                      <span className="text-[#10B981] mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-[#10B981] mb-2">🎯 Recomendaciones</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-[#D1D5DB] flex items-start gap-2">
                      <span className="text-[#10B981] mt-0.5">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Accordion */}
      <div className="space-y-4">
        {mockData.categories.map((category, index) => (
          <CollapsibleSection
            key={index}
            title={category.name}
            defaultOpen={index === 0}
            badge={
              <span className="text-sm font-semibold text-[#10B981]">
                {formatCurrency(category.total)}
              </span>
            }
          >
            <div className="space-y-2">
              {category.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-[#1F2937] rounded-lg hover:bg-[#374151] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-[#F9FAFB]">
                        {tx.description}
                      </span>
                      <Pill category={category.name} size="sm" />
                    </div>
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(tx.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AmountDisplay amount={-tx.amount} size="sm" showSign={false} />
                    <button className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}
