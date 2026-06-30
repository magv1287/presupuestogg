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
  orderBy
} from 'firebase/firestore';
import { db } from './config';

const HOUSEHOLD_ID = 'main'; // Single household for Miguel & Grecia

// Household Profile operations
export interface HouseholdProfile {
  savingsAccounts: Array<{ name: string; balance: number }>;
  emergencyFund: {
    currentBalance: number;
    targetMonths: number;
  };
  onboardingCompleted: boolean;
  onboardingStep: number;
  createdAt: Date;
  updatedAt: Date;
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

// Transaction operations
export interface HouseholdTransaction {
  id: string;
  date: Date;
  description: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  owner: 'Miguel' | 'Grecia'; // For traceability only, never used for filtering
  source: 'apple-wallet' | 'capital-one' | 'bank-of-america';
  excluded: boolean;
  flagged: boolean;
  exclusionReason?: string;
  uploadId: string;
  createdAt: Date;
}

export const addHouseholdTransaction = async (
  transaction: Omit<HouseholdTransaction, 'id' | 'createdAt'>
): Promise<string> => {
  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');
  
  // Check for duplicates (same date + amount + merchant)
  const duplicateQuery = query(
    transactionsRef,
    where('date', '==', Timestamp.fromDate(transaction.date)),
    where('amount', '==', transaction.amount),
    where('merchant', '==', transaction.merchant)
  );
  
  const duplicates = await getDocs(duplicateQuery);
  
  if (!duplicates.empty) {
    return duplicates.docs[0].id; // Already exists
  }
  
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.now(),
  });
  
  return docRef.id;
};

export const getHouseholdTransactionsByMonth = async (
  year: number,
  month: number
): Promise<HouseholdTransaction[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const transactionsRef = collection(db, 'household', HOUSEHOLD_ID, 'transactions');
  const q = query(
    transactionsRef,
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    where('excluded', '==', false), // Always filter out excluded transactions
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    date: doc.data().date.toDate(),
    description: doc.data().description,
    merchant: doc.data().merchant,
    amount: doc.data().amount,
    type: doc.data().type,
    category: doc.data().category,
    owner: doc.data().owner,
    source: doc.data().source,
    excluded: doc.data().excluded,
    flagged: doc.data().flagged,
    exclusionReason: doc.data().exclusionReason,
    uploadId: doc.data().uploadId,
    createdAt: doc.data().createdAt.toDate(),
  }));
};

// Monthly Analysis operations
export interface MonthlyAnalysis {
  month: string; // "2026-06"
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  categoryBreakdown: Record<string, number>;
  aiAnalysis: {
    summary: string;
    insights: string[];
    recommendations: string[];
    alerts: string[];
    score: number;
  };
  generatedAt: Date;
}

export const saveMonthlyAnalysis = async (
  month: string,
  analysis: Omit<MonthlyAnalysis, 'month' | 'generatedAt'>
): Promise<void> => {
  const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', month);
  
  await setDoc(analysisRef, {
    month,
    ...analysis,
    generatedAt: Timestamp.now(),
  });
};

export const getMonthlyAnalysis = async (month: string): Promise<MonthlyAnalysis | null> => {
  const analysisRef = doc(db, 'household', HOUSEHOLD_ID, 'monthlyAnalysis', month);
  const analysisSnap = await getDoc(analysisRef);
  
  if (analysisSnap.exists()) {
    const data = analysisSnap.data();
    return {
      month: data.month,
      totalIncome: data.totalIncome,
      totalExpenses: data.totalExpenses,
      netSavings: data.netSavings,
      savingsRate: data.savingsRate,
      categoryBreakdown: data.categoryBreakdown,
      aiAnalysis: data.aiAnalysis,
      generatedAt: data.generatedAt.toDate(),
    };
  }
  
  return null;
};
