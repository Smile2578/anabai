// components/admin/Sidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Briefcase,
  BookOpen,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { motion } from 'framer-motion';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    description: 'Gestion des utilisateurs',
  },
  {
    name: 'Lieux',
    href: '/admin/places',
    icon: MapPin,
    description: 'Gestion des lieux',
  },
  {
    name: 'Voyages',
    href: '/admin/trips',
    icon: Briefcase,
    description: 'Gestion des voyages',
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: BookOpen,
    description: 'Articles de blog',
  },
  {
    name: 'Guides',
    href: '/admin/guides',
    icon: FileText,
    description: 'Guides de voyage',
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration du site',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        'relative flex flex-col border-r bg-muted/10 h-screen',
        isCollapsed ? 'items-center' : ''
      )}
    >
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background">
        {!isCollapsed && (
          <Link href="/admin">
            <span className="text-xl font-semibold">AnabAI</span>
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

      <ScrollArea className="flex flex-col flex-1 p-4">
        <nav className="grid gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isCollapsed ? 'justify-center px-2' : ''
                  )}
                >
                  <item.icon
                    className={cn('h-5 w-5', isCollapsed ? '' : 'mr-3')}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Indicateur de version en bas de la sidebar */}
      {!isCollapsed && (
        <div className="p-4 text-xs text-muted-foreground">
          <p>Version 1.0.0</p>
        </div>
      )}
    </motion.div>
  );
}