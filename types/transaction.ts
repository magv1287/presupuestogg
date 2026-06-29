export interface Transaction {
  id: string;
  userId: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  source: 'Apple Wallet' | 'Capital One' | 'Bank of America';
  hash: string; // For deduplication
  createdAt: Date;
}

export interface MonthlyExpenses {
  month: string; // Format: YYYY-MM
  totalExpenses: number;
  totalIncome: number;
  categories: {
    [category: string]: number;
  };
  transactions: Transaction[];
}

export interface ComparisonData {
  months: string[];
  data: MonthlyExpenses[];
}
