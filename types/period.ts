export type PeriodType = 'Q1' | 'Q2'; // Quincena 1 (1-15) o Quincena 2 (16-fin de mes)

export interface Period {
  id: string; // Format: "YYYY-MM-Q1" or "YYYY-MM-Q2"
  year: number;
  month: number;
  type: PeriodType;
  startDate: Date;
  endDate: Date;
}

export interface PeriodIncome {
  periodId: string;
  user1Income: number; // Grecia (gcgv25@gmail.com)
  user2Income: number; // Miguel (magv.1287@gmail.com)
  totalIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodExpenses {
  periodId: string;
  totalExpenses: number;
  categories: {
    [category: string]: number;
  };
  transactionCount: number;
}

export interface PeriodAnalysis {
  periodId: string;
  userId: string;
  incomes: PeriodIncome;
  expenses: PeriodExpenses;
  geminiAnalysis: {
    cutRecommendations: string[];
    increaseRecommendations: string[];
    investmentSuggestions: string[];
    summary: string;
  } | null;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodValidationResult {
  allowed: boolean;
  reason?: string;
  missingPeriod?: string;
  missingPeriodLabel?: string;
}

export type PeriodStatus = 'completed' | 'available' | 'locked' | 'in-progress';

export interface PeriodWithStatus extends Period {
  status: PeriodStatus;
  analysis?: PeriodAnalysis;
}
