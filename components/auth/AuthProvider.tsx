'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { isAuthorizedUser } from '@/lib/firebase/auth';
import { getHouseholdProfile, updateHouseholdProfile, HouseholdProfile } from '@/lib/firebase/household';

interface AuthContextType {
  user: FirebaseUser | null;
  householdProfile: HouseholdProfile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  householdProfile: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Validate email (whitelist)
          if (!isAuthorizedUser(firebaseUser.email || '')) {
            await auth.signOut();
            setError('Acceso denegado. Solo usuarios autorizados pueden acceder.');
            setUser(null);
            setHouseholdProfile(null);
            setLoading(false);
            return;
          }

          setUser(firebaseUser);
          
          // Get or create household profile (shared between Miguel & Grecia)
          let profile = await getHouseholdProfile();
          
          if (!profile) {
            // Create new household profile
            await updateHouseholdProfile({
              savingsAccounts: [],
              emergencyFund: { currentBalance: 0, targetMonths: 3 },
              onboardingCompleted: false,
              onboardingStep: 1,
            });
            profile = await getHouseholdProfile();
          }
          
          setHouseholdProfile(profile);
          setError(null);
        } else {
          setUser(null);
          setHouseholdProfile(null);
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
    <AuthContext.Provider value={{ user, householdProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
