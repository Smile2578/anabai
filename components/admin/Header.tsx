// components/admin/Header.tsx
'use client';

import { useSession} from "next-auth/react";
import { useState, useEffect } from 'react';
import { Bell, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Settings, MapPinHouse, UserIcon, BarChart3 } from 'lucide-react';
import AnabaLogo from "../brand/AnabaLogo";
import { SignOutButton } from '@/components/auth/SignOutButton';

export default function AdminHeader() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  if (!mounted || status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95">
        <div className="flex h-16 items-center justify-center">
          <Loader className="animate-spin h-5 w-5" />
        </div>
      </header>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!session?.user) return null
    
    const isPremium = session.user.role === "premium"
    const isLuxury = session.user.role === "luxury"
    const isAdmin = session.user.role === "admin"
    const isEditor = session.user.role === "editor"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur overflow-visible">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold">Administration AnabAI</h2>
          <p className="text-sm text-muted-foreground">
            Bienvenue, {session?.user?.name}
          </p>
        </div>

        <AnabaLogo />

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || undefined} alt={session.user.name || "Avatar"} />
              <AvatarFallback>{getInitials(session.user.name || "User")}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
              {(isPremium || isLuxury) && (
                <div className="flex items-center mt-1">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isPremium && "bg-primary/10 text-primary",
                    isLuxury && "bg-amber-500/10 text-amber-500"
                  )}>
                    {isPremium ? "Premium" : "Luxury"}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres du compte
              </Link>
            </DropdownMenuItem>
            {(isAdmin || isEditor) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Administration</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/admin/places">
                    <MapPinHouse className="mr-2 h-4 w-4" />
                    Gestion des lieux
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Gestion des utilisateurs
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/monitoring">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Monitoring
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    Thème: {theme === 'dark' ? 'Clair' : 'Sombre'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutButton variant="ghost" showIcon={true} className="w-full justify-start" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}