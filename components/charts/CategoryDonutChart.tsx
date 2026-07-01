'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import { getCategoryConfig } from '@/lib/utils/categories';

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryDonutChartProps {
  data: CategoryData[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="amount"
          nameKey="category"
        >
          {data.map((entry, index) => {
            const config = getCategoryConfig(entry.category);
            return <Cell key={`cell-${index}`} fill={config.color} />;
          })}
        </Pie>
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
          wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
          formatter={(value, entry) => {
            const payload = entry?.payload as CategoryData | undefined;
            return payload?.category || value;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
