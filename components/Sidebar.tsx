'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export const Sidebar = () => {
  const { householdProfile } = useAuth();
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
          href="/dashboard/resumen"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/resumen')
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
          href="/dashboard/relacion"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/relacion')
              ? 'bg-[#1a1a1a] text-[#10b981] border border-[#262626]'
              : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-sm font-medium">Relación Mensual</span>
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
          <span className="text-sm font-medium">Subir CSVs</span>
        </Link>

        <Link
          href="/dashboard/cuenta"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/cuenta')
              ? 'bg-[#1a1a1a] text-[#10b981] border border-[#262626]'
              : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm font-medium">Mi Cuenta</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            GG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#e5e5e5] truncate">
              GonGar Household
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
