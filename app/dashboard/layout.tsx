'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0A0A0F]">
        <style jsx global>{`
          @media (min-width: 768px) {
            .dashboard-main {
              margin-left: var(--sidebar-width-collapsed, 64px);
              padding-left: 24px;
            }
          }
        `}</style>
        <Sidebar />
        <main className="dashboard-main pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
