import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  writeBatch,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { DefaultPage } from '@/types';

const HOUSEHOLD_ID = 'main';

export interface UserPreference {
  defaultPage: DefaultPage;
}

export interface HouseholdProfile {
  savingsAccounts: Array<{ name: string; balance: number }>;
  emergencyFund: {
    currentBalance: number;
    targetMonths: number;
  };
  onboardingCompleted: boolean;
  onboardingStep: number;
  userPreferences?: Record<string, UserPreference>;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseholdTransaction {
  id: string;
  date: Date;
  description: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  owner: 'Miguel' | 'Grecia';
  source: 'apple-wallet' | 'capital-one' | 'bank-of-america' | 'manual';
  account: string;
  month: string;
  year: number;
  excluded: boolean;
  flagged: boolean;
  exclusionReason?: string;
  needsReview?: boolean;
  confidence?: number;
  uploadId: string;
  createdAt: Date;
}

export interface MonthlyAnalysis {
  month: string;
  monthLabel: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  categoryBreakdown: Record<string, number>;
  transactionCount: number;
  aiReport: string;
  aiSummary: string;
  generatedAt: Date;
  aiAnalysisStale?: boolean;
  lastDataEditAt?: Date;
  editHistory?: Array<{
    editedAt: Date;
    editType: 'replace' | 'merge';
    transactionsAdded: number;
    transactionsRemoved: number;
  }>;
}

export interface HouseholdUpload {
  id: string;
  filename: string;
  account: string;
  month: string;
  format: string;
  rowCount: number;
  newTransactions: number;
  duplicatesFound: number;
  internalTransfersFound: number;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
  uploadedAt: Date;
}

function mapTransactionDoc(
  docId: string,
  data: Record<string, unknown>
): HouseholdTransaction {
  return {
    id: docId,
    date: (data.date as Timestamp).toDate(),
    description: data.description as string,
    merchant: data.merchant as string,
    amount: data.amount as number,
    type: data.type as 'income' | 'expense',
    category: data.category as string,
    owner: data.owner as 'Miguel' | 'Grecia',
    source: data.source as HouseholdTransaction['source'],
    account: (data.account as string) || '',
    month: data.month as string,
    year: data.year as number,
    excluded: data.excluded as boolean,
    flagged: data.flagged as boolean,
    exclusionReason: data.exclusionReason as string | undefined,
    needsReview: (data.needsReview as boolean) || false,
    confidence: data.confidence as number | undefined,
    uploadId: data.uploadId as string,
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export const getHouseholdProfile = async (): Promise<HouseholdProfile | null> => {
  const profileRef = doc(db, 'household', HOUSEHOLD_ID, 'data', 'profile');
  const profileSnap = await getDoc(profileRef);

  if (profileSnap.exists()) {
    const data = profileSnap.data();
    return {
      savingsAccounts: data.savingsAccounts || [],
      emergencyFund: data.emergencyFund || { currentBalance: 0, targetMonths: 3 },
      onboardingCompleted: data.onboardingCompleted || false,
      onboardingStep: data.onboardingStep || 1,
      userPreferences: data.userPreferences || {},
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  return null;
};

export const updateHouseholdProfile = async (
  profile: Partial<HouseholdProfile>
): Promise<void> => {
  const profileRef = doc(db, 'household', HOUSEHOLD_ID, 'data', 'profile');
  const profileSnap = await getDoc(profileRef);

  if (profileSnap.exists()) {
    await updateDoc(profileRef, {
      ...profile,
      updatedAt: Timestamp.now(),
    });
  } else {
    await setDoc(profileRef, {
      savingsAccounts: [],
      emergencyFund: { currentBalance: 0, targetMonths: 3 },
      onboardingCompleted: false,
      onboardingStep: 1,
      ...profile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
};

export const addHouseholdTransaction = async (
  transaction: Omit<HouseholdTransaction, 'id' | 'createdAt'>
): Promise<{ id: string; isNew: boolean }> => {
  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');

  const duplicateQuery = query(
    transactionsRef,
    where('date', '==', Timestamp.fromDate(transaction.date)),
    where('amount', '==', transaction.amount),
    where('merchant', '==', transaction.merchant)
  );

  const duplicates = await getDocs(duplicateQuery);

  if (!duplicates.empty) {
    return { id: duplicates.docs[0].id, isNew: false };
  }

  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.now(),
  });

  return { id: docRef.id, isNew: true };
};

export const addHouseholdTransactions = async (
  transactions: Omit<HouseholdTransaction, 'id' | 'createdAt'>[]
): Promise<{ saved: number; duplicates: number }> => {
  let saved = 0;
  let duplicates = 0;

  for (const transaction of transactions) {
    const result = await addHouseholdTransaction(transaction);
    if (result.isNew) {
      saved += 1;
    } else {
      duplicates += 1;
    }
  }

  return { saved, duplicates };
};

export const getHouseholdTransactionsByMonth = async (
  year: number,
  month: number,
  includeExcluded = false
): Promise<HouseholdTransaction[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');

  if (includeExcluded) {
    const q = query(
      transactionsRef,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) =>
      mapTransactionDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
    );
  }

  const q = query(
    transactionsRef,
    where('excluded', '==', false),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) =>
    mapTransactionDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
};

export const getHouseholdTransactionsByYear = async (
  year: number
): Promise<HouseholdTransaction[]> => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');
  const q = query(
    transactionsRef,
    where('excluded', '==', false),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) =>
    mapTransactionDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
};

export const getAllHouseholdTransactions = async (
  includeExcluded = false
): Promise<HouseholdTransaction[]> => {
  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');

  const q = includeExcluded
    ? query(transactionsRef, orderBy('date', 'desc'))
    : query(transactionsRef, where('excluded', '==', false), orderBy('date', 'desc'));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) =>
    mapTransactionDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
  );
};

export const getAvailableYears = async (): Promise<number[]> => {
  const transactions = await getAllHouseholdTransactions();
  const years = new Set(transactions.map((tx) => tx.year || tx.date.getFullYear()));
  if (years.size === 0) {
    return [new Date().getFullYear()];
  }
  return Array.from(years).sort((a, b) => b - a);
};

export const getAverageMonthlyExpenses = async (months = 3): Promise<number> => {
  const transactions = await getAllHouseholdTransactions();
  if (transactions.length === 0) return 0;

  const monthTotals = new Map<string, number>();

  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const key = tx.month || `${tx.date.getFullYear()}-${(tx.date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthTotals.set(key, (monthTotals.get(key) || 0) + tx.amount);
    });

  const sortedMonths = Array.from(monthTotals.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, months);

  if (sortedMonths.length === 0) return 0;

  const total = sortedMonths.reduce((sum, [, amount]) => sum + amount, 0);
  return total / sortedMonths.length;
};

export const saveMonthlyAnalysis = async (
  month: string,
  analysis: Omit<MonthlyAnalysis, 'month' | 'generatedAt'>
): Promise<void> => {
  const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', month);

  await setDoc(analysisRef, {
    month,
    ...analysis,
    generatedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getMonthlyAnalysis = async (month: string): Promise<MonthlyAnalysis | null> => {
  const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', month);
  const analysisSnap = await getDoc(analysisRef);

  if (analysisSnap.exists()) {
    const data = analysisSnap.data();
    return {
      month: data.month,
      monthLabel: data.monthLabel,
      year: data.year,
      totalIncome: data.totalIncome,
      totalExpenses: data.totalExpenses,
      netSavings: data.netSavings,
      savingsRate: data.savingsRate,
      categoryBreakdown: data.categoryBreakdown,
      transactionCount: data.transactionCount,
      aiReport: data.aiReport,
      aiSummary: data.aiSummary,
      generatedAt: data.generatedAt.toDate(),
      aiAnalysisStale: data.aiAnalysisStale || false,
      lastDataEditAt: data.lastDataEditAt?.toDate(),
      editHistory: data.editHistory?.map(
        (entry: { editedAt: Timestamp; editType: string; transactionsAdded: number; transactionsRemoved: number }) => ({
          editedAt: entry.editedAt.toDate(),
          editType: entry.editType as 'replace' | 'merge',
          transactionsAdded: entry.transactionsAdded,
          transactionsRemoved: entry.transactionsRemoved,
        })
      ),
    };
  }

  return null;
};

export const getMonthlyAnalysisList = async (): Promise<string[]> => {
  const analysisRef = collection(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis');
  const snapshot = await getDocs(analysisRef);
  return snapshot.docs.map((docSnap) => docSnap.id).sort((a, b) => b.localeCompare(a));
};

export const getMonthsWithAiReport = async (): Promise<string[]> => {
  const analysisRef = collection(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis');
  const snapshot = await getDocs(analysisRef);
  return snapshot.docs
    .filter((docSnap) => {
      const data = docSnap.data();
      return typeof data.aiReport === 'string' && data.aiReport.trim().length > 0;
    })
    .map((docSnap) => docSnap.id)
    .sort((a, b) => b.localeCompare(a));
};

export const hasHouseholdTransactions = async (): Promise<boolean> => {
  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');
  const snapshot = await getDocs(query(transactionsRef, limit(1)));
  return !snapshot.empty;
};

export const updateHouseholdTransactionCategory = async (
  transactionId: string,
  category: string
): Promise<void> => {
  const txRef = doc(db, 'household', HOUSEHOLD_ID, 'transactions', transactionId);
  await updateDoc(txRef, {
    category,
    needsReview: false,
    confidence: 1,
  });
};

export const saveHouseholdUpload = async (
  upload: Omit<HouseholdUpload, 'id' | 'uploadedAt'>
): Promise<string> => {
  const uploadsRef = collection(db, 'household', HOUSEHOLD_ID, 'uploads');
  const docRef = await addDoc(uploadsRef, {
    ...upload,
    uploadedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getHouseholdUploads = async (): Promise<HouseholdUpload[]> => {
  const uploadsRef = collection(db, 'household', HOUSEHOLD_ID, 'uploads');
  const q = query(uploadsRef, orderBy('uploadedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      filename: data.filename,
      account: data.account,
      month: data.month,
      format: data.format,
      rowCount: data.rowCount,
      newTransactions: data.newTransactions,
      duplicatesFound: data.duplicatesFound,
      internalTransfersFound: data.internalTransfersFound || 0,
      status: data.status,
      errorMessage: data.errorMessage,
      uploadedAt: data.uploadedAt.toDate(),
    };
  });
};

export function groupTransactionsByYearMonth(
  transactions: HouseholdTransaction[]
): Record<number, Record<string, HouseholdTransaction[]>> {
  const grouped: Record<number, Record<string, HouseholdTransaction[]>> = {};

  transactions.forEach((tx) => {
    const year = tx.year || tx.date.getFullYear();
    const monthKey =
      tx.month || `${year}-${(tx.date.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][monthKey]) grouped[year][monthKey] = [];
    grouped[year][monthKey].push(tx);
  });

  return grouped;
}

export function computeMonthMetrics(transactions: HouseholdTransaction[]) {
  const active = transactions.filter((tx) => !tx.excluded);
  const income = active
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = active
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const netSavings = income - expenses;
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

  const categoryBreakdown = active
    .filter((tx) => tx.type === 'expense' && tx.category)
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  return { income, expenses, netSavings, savingsRate, categoryBreakdown };
}

export const getTransactionsByMonthKey = async (
  monthKey: string,
  includeExcluded = true
): Promise<HouseholdTransaction[]> => {
  const [yearStr, monthStr] = monthKey.split('-');
  return getHouseholdTransactionsByMonth(parseInt(yearStr, 10), parseInt(monthStr, 10), includeExcluded);
};

export const deleteHouseholdTransactionsByMonth = async (
  monthKey: string
): Promise<number> => {
  const transactions = await getTransactionsByMonthKey(monthKey, true);
  if (transactions.length === 0) return 0;

  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');
  const batchSize = 400;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const chunk = transactions.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach((tx) => {
      batch.delete(doc(transactionsRef, tx.id));
    });
    await batch.commit();
  }

  return transactions.length;
};

export const markAnalysesStale = async (monthKeys: string[]): Promise<void> => {
  for (const monthKey of monthKeys) {
    const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', monthKey);
    const snap = await getDoc(analysisRef);
    if (snap.exists()) {
      await updateDoc(analysisRef, {
        aiAnalysisStale: true,
        lastDataEditAt: Timestamp.now(),
      });
    }
  }
};

export const appendEditHistory = async (
  monthKey: string,
  entry: {
    editType: 'replace' | 'merge';
    transactionsAdded: number;
    transactionsRemoved: number;
  }
): Promise<void> => {
  const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', monthKey);
  const snap = await getDoc(analysisRef);

  const historyEntry = {
    editedAt: Timestamp.now(),
    editType: entry.editType,
    transactionsAdded: entry.transactionsAdded,
    transactionsRemoved: entry.transactionsRemoved,
  };

  if (snap.exists()) {
    const existing = snap.data().editHistory || [];
    await updateDoc(analysisRef, {
      editHistory: [...existing, historyEntry],
      lastDataEditAt: Timestamp.now(),
    });
  }
};

export const updateAnalysisSummaryAfterEdit = async (
  monthKey: string,
  metrics: ReturnType<typeof computeMonthMetrics>,
  transactionCount: number
): Promise<void> => {
  const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', monthKey);
  const snap = await getDoc(analysisRef);

  if (snap.exists()) {
    const data = snap.data();
    const summary = `Ingresos $${metrics.income.toFixed(0)}, gastos $${metrics.expenses.toFixed(0)}, ahorro ${metrics.savingsRate}% (${transactionCount} transacciones)`;
    await updateDoc(analysisRef, {
      totalIncome: metrics.income,
      totalExpenses: metrics.expenses,
      netSavings: metrics.netSavings,
      savingsRate: metrics.savingsRate,
      categoryBreakdown: metrics.categoryBreakdown,
      transactionCount,
      aiSummary: summary,
      lastDataEditAt: Timestamp.now(),
    });
  }
};
