'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { isEmailAllowed } from '@/lib/firebase/auth';
import { getUserProfile, createUserProfile } from '@/lib/firebase/firestore';
import { User } from '@/types/user';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Validate email
          if (!isEmailAllowed(firebaseUser.email)) {
            await auth.signOut();
            setError('Acceso denegado. Solo usuarios autorizados pueden acceder.');
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }

          setUser(firebaseUser);
          
          // Get or create user profile
          let profile = await getUserProfile(firebaseUser.uid);
          
          if (!profile) {
            // Create new profile
            await createUserProfile(firebaseUser.uid, firebaseUser.email!, {
              name: firebaseUser.displayName || '',
              monthlyIncome: 0,
              savingsAccounts: [],
            });
            profile = await getUserProfile(firebaseUser.uid);
          }
          
          setUserProfile(profile);
          setError(null);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Error de autenticación');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
