'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main
        className="min-h-screen pb-20 md:pb-0 transition-[margin-left] duration-200 ease-in-out"
        style={{
          marginLeft: collapsed ? '64px' : '64px',
        }}
      >
        <div className="px-6 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
