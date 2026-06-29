'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#141414] border-r border-[#262626] p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-[#10b981] mb-1">Presupuesto GonGar</h1>
            <p className="text-xs text-[#737373]">HYSA & Interés Compuesto</p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1a1a1a] text-[#10b981] border border-[#262626]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">Resumen</span>
            </Link>

            <Link
              href="/dashboard/upload"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium">Transacciones</span>
            </Link>

            <Link
              href="/dashboard/compare"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Análisis Quincenal</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#e5e5e5] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Cuenta</span>
            </Link>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
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

        {/* Main Content */}
        <main className="ml-64 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#e5e5e5] mb-2">Resumen</h2>
            <p className="text-[#a3a3a3]">Estado de la cuenta de ahorros</p>
          </div>

          {/* Balance Card */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 mb-6">
            <div className="text-center">
              <p className="text-sm text-[#a3a3a3] mb-2">Balance actual</p>
              <h3 className="text-5xl font-bold text-[#10b981] mb-2">$0.00</h3>
              <p className="text-sm text-[#737373]">0.00% APY</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-[#a3a3a3]">Depositado</span>
              </div>
              <p className="text-2xl font-bold text-[#e5e5e5]">$0.00</p>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#10b981]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-[#a3a3a3]">Intereses</span>
              </div>
              <p className="text-2xl font-bold text-[#10b981]">+$0.00</p>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#ef4444]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-[#a3a3a3]">Retirado</span>
              </div>
              <p className="text-2xl font-bold text-[#e5e5e5]">$0.00</p>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-[#a3a3a3]">Tasa actual</span>
              </div>
              <p className="text-2xl font-bold text-[#e5e5e5]">0.00%</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#e5e5e5] mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/upload"
                className="flex items-center gap-4 p-4 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e5e5e5]">Cargar Transacciones</p>
                  <p className="text-xs text-[#737373]">Sube archivos CSV</p>
                </div>
              </Link>

              <Link
                href="/dashboard/compare"
                className="flex items-center gap-4 p-4 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e5e5e5]">Análisis Quincenal</p>
                  <p className="text-xs text-[#737373]">Analiza con IA</p>
                </div>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-4 p-4 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#262626] rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <svg className="w-5 h-5 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e5e5e5]">Configuración</p>
                  <p className="text-xs text-[#737373]">Actualiza perfil</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
