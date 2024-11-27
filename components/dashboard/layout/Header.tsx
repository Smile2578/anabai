// components/dashboard/layout/Header.tsx
'use client';

import { Bell, Search, Settings, LayoutDashboard, MapPinHouse, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { HeaderProps } from '@/types/dashboard/layout';
import { SignOutButton } from '@/components/auth/SignOutButton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type UserRole = 'user' | 'premium' | 'luxury' | 'admin' | 'editor';

interface User {
  role?: UserRole;
  image?: string;
  name?: string;
  email?: string;
}

export function Header({ user }: { user?: User }) {
  // Fonction pour obtenir les initiales de l'utilisateur
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const isPremium = user?.role === "premium"
  const isLuxury = user?.role === "luxury"
  const isAdmin = user?.role === "admin"
  const isEditor = user?.role === "editor"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="w-[300px] pl-8"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
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
                  </>
                )}
              </DropdownMenuGroup>
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