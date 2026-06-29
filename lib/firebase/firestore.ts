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
    monthlyIncome: profile.monthlyIncome || 0,
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
      monthlyIncome: data.monthlyIncome,
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
