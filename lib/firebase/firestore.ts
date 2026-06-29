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
import { User, UserProfile } from '@/types/user';
import { Transaction } from '@/types/transaction';
import { PeriodIncome, PeriodExpenses, PeriodAnalysis } from '@/types/period';

// User operations
export const createUserProfile = async (
  uid: string, 
  email: string, 
  profile: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    email,
    name: profile.name || '',
    savingsAccounts: profile.savingsAccounts || [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      uid,
      email: data.email,
      name: data.name,
      savingsAccounts: data.savingsAccounts,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }
  
  return null;
};

export const updateUserProfile = async (
  uid: string, 
  profile: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...profile,
    updatedAt: Timestamp.now(),
  });
};

// Transaction operations
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  // Check for duplicates using hash
  const q = query(
    collection(db, 'transactions'),
    where('hash', '==', transaction.hash),
    where('userId', '==', transaction.userId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Transaction already exists
    return querySnapshot.docs[0].id;
  }
  
  // Add new transaction
  const docRef = await addDoc(collection(db, 'transactions'), {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.now(),
  });
  
  return docRef.id;
};

export const getTransactionsByMonth = async (
  userId: string, 
  year: number, 
  month: number
): Promise<Transaction[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    date: doc.data().date.toDate(),
    amount: doc.data().amount,
    description: doc.data().description,
    category: doc.data().category,
    source: doc.data().source,
    hash: doc.data().hash,
    createdAt: doc.data().createdAt.toDate(),
  }));
};

export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    date: doc.data().date.toDate(),
    amount: doc.data().amount,
    description: doc.data().description,
    category: doc.data().category,
    source: doc.data().source,
    hash: doc.data().hash,
    createdAt: doc.data().createdAt.toDate(),
  }));
};

// Period operations
export const savePeriodIncome = async (
  userId: string,
  periodId: string,
  user1Income: number,
  user2Income: number
): Promise<void> => {
  const periodRef = doc(db, 'periods', userId, 'analyses', periodId);
  const periodSnap = await getDoc(periodRef);
  
  const incomeData = {
    periodId,
    user1Income,
    user2Income,
    totalIncome: user1Income + user2Income,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  if (periodSnap.exists()) {
    // Update existing
    await updateDoc(periodRef, {
      incomes: incomeData,
      updatedAt: Timestamp.now(),
    });
  } else {
    // Create new
    await setDoc(periodRef, {
      periodId,
      userId,
      incomes: incomeData,
      expenses: null,
      geminiAnalysis: null,
      isCompleted: false,
      completedAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
};

export const savePeriodAnalysis = async (
  userId: string,
  periodId: string,
  expenses: PeriodExpenses,
  geminiAnalysis: any
): Promise<void> => {
  const periodRef = doc(db, 'periods', userId, 'analyses', periodId);
  
  await updateDoc(periodRef, {
    expenses,
    geminiAnalysis,
    isCompleted: true,
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getTransactionsByPeriod = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  return getTransactionsByDateRange(userId, startDate, endDate);
};
