// Core types for GonGar Presupuesto Familiar

export interface Profile {
  name: string;
  email: string;
  savingsAccounts: SavingsAccount[];
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsAccount {
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  date: string; // "2026-06-15"
  description: string;
  merchant: string;
  amount: number; // always positive
  type: 'income' | 'expense';
  category: string;
  account: string;
  month: string; // "2026-06"
  year: number; // 2026
  confidence: number; // AI categorization confidence
  needsReview: boolean;
  excluded: boolean;
  flagged: boolean;
  uploadId: string;
  uploadedAt: Date;
  createdAt: Date;
}

export interface MonthlyAnalysis {
  month: string; // "2026-06"
  monthLabel: string; // "Junio 2026"
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage
  categoryBreakdown: Record<string, number>;
  transactionCount: number;
  aiReport: string; // full markdown report
  aiSummary: string; // one-line summary for context
  generatedAt: Date;
  updatedAt: Date;
}

export interface Upload {
  id: string;
  filename: string;
  account: string;
  month: string; // "2026-06"
  format: 'apple-wallet' | 'capital-one' | 'bank-of-america' | 'unknown';
  rowCount: number;
  newTransactions: number;
  duplicatesFound: number;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
  uploadedAt: Date;
}

export interface CategoryConfig {
  color: string;
  bg: string;
  icon: string;
}

export type CSVFormat = 'apple-wallet' | 'capital-one' | 'bank-of-america' | 'unknown';

export interface ParsedTransaction {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  excluded?: boolean;
  flagged?: boolean;
}

export interface CategorizationResult {
  index: number;
  category: string;
  confidence: number;
  type: 'income' | 'expense';
}

export interface DuplicateCheckResult {
  newCount: number;
  duplicateCount: number;
  newTransactions: ParsedTransaction[];
  duplicates: ParsedTransaction[];
}
