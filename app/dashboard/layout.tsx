// app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/layout/Header';
import { Sidebar } from '@/components/dashboard/layout/Sidebar';
import { DashboardLayoutProps } from '@/types/dashboard/layout';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1">
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}