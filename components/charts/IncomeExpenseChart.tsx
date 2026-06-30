'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface ChartData {
  month: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="month" 
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value: any) => formatCurrency(Number(value))}
        />
        <Legend 
          wrapperStyle={{ color: '#9CA3AF' }}
        />
        <Bar 
          dataKey="income" 
          fill="#10B981" 
          name="Ingresos"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="expenses" 
          fill="#EF4444" 
          name="Gastos"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
