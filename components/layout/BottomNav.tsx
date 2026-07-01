'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/resumen', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/relacion', label: 'Relación', icon: TrendingUp },
  { href: '/dashboard/cuenta', label: 'Cuenta', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111827] border-t border-[#1F2937] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-[#10B981]' : 'text-[#6B7280]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
