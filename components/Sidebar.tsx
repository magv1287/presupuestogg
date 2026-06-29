'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export const Sidebar = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#141414] border-r border-[#262626] p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#10b981] mb-1">Presupuesto GonGar</h1>
        <p className="text-xs text-[#737373]">HYSA & Interés Compuesto</p>
      </div>

      <nav className="space-y-2 flex-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard')
              ? 'bg-[#1a1a1a] text-[#10b981] border border-[#262626]'
              : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-medium">Resumen</span>
        </Link>

        <Link
          href="/dashboard/upload"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/upload')
              ? 'bg-[#1a1a1a] text-[#10b981] border border-[#262626]'
              : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium">Transacciones</span>
        </Link>

        <Link
          href="/dashboard/compare"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/compare')
              ? 'bg-[#1a1a1a] text-[#10b981] border border-[#262626]'
              : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Análisis Quincenal</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/settings')
              ? 'bg-[#1a1a1a] text-[#10b981] border border-[#262626]'
              : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Cuenta</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userProfile?.name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#e5e5e5] truncate">
              {userProfile?.email?.split('@')[0]}
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs text-[#737373] hover:text-[#10b981] transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
