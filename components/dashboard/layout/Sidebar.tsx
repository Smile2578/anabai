// components/dashboard/layout/Sidebar.tsx
'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Brain,
  Calendar,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProps } from '@/types/dashboard/layout';

const navigation = [
  {
    name: 'Vue d\'ensemble',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Tableau de bord principal',
  },
  {
    name: 'Planification avec AnabAI',
    href: '/dashboard/planning',
    icon: Brain,
    description: 'Planification de voyage',
  },
  {
    name: 'Calendrier',
    href: '/dashboard/calendar',
    icon: Calendar,
    description: 'Gestion du calendrier',
  },
  {
    name: 'Profil',
    href: '/dashboard/profile',
    icon: User,
    description: 'Gestion du profil',
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configuration',
  },
];

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col border-r bg-background',
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      )}
    >
      <div className="flex h-[60px] items-center justify-between px-4">
        {!isCollapsed && (
          <Link href="/dashboard">
            <span className="anaba-title">Anaba.io</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isCollapsed ? 'justify-center px-2' : ''
                )}
              >
                <item.icon className={cn('h-5 w-5', isCollapsed ? '' : 'mr-3')} />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}