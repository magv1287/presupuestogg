'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const SIDEBAR_WIDTH_COLLAPSED = '64px';
const SIDEBAR_WIDTH_EXPANDED = '240px';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: true,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(true);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
  }, []);

  // Main layout always uses collapsed width; expanded sidebar is an overlay
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width-collapsed', SIDEBAR_WIDTH_COLLAPSED);
    document.documentElement.style.setProperty('--sidebar-width-expanded', SIDEBAR_WIDTH_EXPANDED);
    document.documentElement.style.setProperty('--sidebar-width', SIDEBAR_WIDTH_COLLAPSED);
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width-collapsed');
      document.documentElement.style.removeProperty('--sidebar-width-expanded');
      document.documentElement.style.removeProperty('--sidebar-width');
    };
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}
