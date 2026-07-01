'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { getDefaultPageRoute } from '@/lib/utils/stale-detection';

const PUBLIC_ROUTES = ['/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, householdProfile, loading } = useAuth();

  const getUserDefaultRoute = () => {
    const email = user?.email;
    const pref = email ? householdProfile?.userPreferences?.[email]?.defaultPage : undefined;
    return getDefaultPageRoute(pref || 'resumen');
  };

  useEffect(() => {
    if (loading) return;

    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login');
      return;
    }

    if (user && !householdProfile?.onboardingCompleted && pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }

    if (
      user &&
      householdProfile?.onboardingCompleted &&
      (pathname === '/login' || pathname === '/onboarding')
    ) {
      router.push(getUserDefaultRoute());
      return;
    }
  }, [user, householdProfile, loading, pathname, router]);
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }
  
  // Don't render children until auth check is complete
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }
  
  if (user && !householdProfile?.onboardingCompleted && pathname !== '/onboarding') {
    return null;
  }
  
  return <>{children}</>;
}
