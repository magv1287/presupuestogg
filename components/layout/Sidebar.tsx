'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, TrendingUp, User, LogOut } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

const NAV_ITEMS = [
  { href: '/dashboard/resumen', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/relacion', label: 'Relación Mensual', icon: TrendingUp },
  { href: '/dashboard/cuenta', label: 'Cuenta', icon: User },
];

export function Sidebar() {
  const { user } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full bg-[#111827] border-r border-[#1F2937] flex-col z-50 overflow-hidden transition-[width,box-shadow] duration-200 ease-in-out"
      style={{
        width: collapsed
          ? 'var(--sidebar-width-collapsed, 64px)'
          : 'var(--sidebar-width-expanded, 240px)',
        boxShadow: collapsed ? 'none' : '4px 0 24px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className={`relative pt-6 mb-4 min-h-[72px] ${collapsed ? 'px-2' : 'px-6'}`}>
        {/* Monogram — visible when collapsed */}
        <div
          className={`absolute inset-x-0 top-6 flex justify-center transition-opacity duration-200 ${
            collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span className="text-xl font-bold text-[#10B981]">GG</span>
        </div>
        {/* Full logo — visible when expanded */}
        <div
          className={`transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <h1 className="text-xl font-bold text-[#10B981] mb-1 whitespace-nowrap">GonGar</h1>
          <p className="text-xs text-[#9CA3AF] whitespace-nowrap">Presupuesto Familiar</p>
        </div>
      </div>

      <nav className={`flex-1 flex flex-col gap-y-4 ${collapsed ? 'px-2' : 'px-4'}`}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-200 border-l-4 ${
              collapsed ? 'px-3 justify-center' : 'px-4'
            } ${
              isActive(href)
                ? 'border-[#10B981] bg-[#10B98120] text-[#10B981]'
                : 'border-transparent text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB]'
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`mt-auto pt-4 border-t border-[#1F2937] ${collapsed ? 'px-2 pb-4' : 'px-4 pb-6'}`}>
        <div className={`flex items-center gap-3 py-2 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <UserAvatar
            name={user?.displayName}
            email={user?.email}
            size="sm"
            title={collapsed ? user?.displayName || user?.email || '' : undefined}
          />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F9FAFB] truncate">
                  {user?.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors p-1"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
