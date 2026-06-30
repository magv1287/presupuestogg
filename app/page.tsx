'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { user, householdProfile, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!householdProfile?.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard/resumen');
      }
    }
  }, [user, householdProfile, loading, router]);
  
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
    </div>
  );
}
