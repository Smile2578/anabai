// components/layout/Header.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader, Menu } from "lucide-react"
import AnabaLogo from "@/components/brand/AnabaLogo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Settings, LayoutDashboard, MapPinHouse, UserIcon, LogOut } from "lucide-react"
interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut({
        redirect: false,
        callbackUrl: '/'
      });
      
      // Forcer un rafraîchissement complet
      window.location.href = '/';
    } catch (error) {
      console.error('Signout error:', error);
      setIsLoading(false);
    }
  }, []);

  // Afficher un loader pendant le chargement initial
  if (isLoading) {
    return (
      <header className={cn("fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b", className)}>
        <div className="container mx-auto px-4 h-12 flex items-center justify-center">
          <Loader className="animate-spin h-5 w-5" />
        </div>
      </header>
    );
  }

  console.log('Header rendering:', { status, session });
  
  // Fonction pour obtenir les initiales de l'utilisateur
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Composant pour les liens de navigation
  const NavLinks = () => (
    <>
      <Link href="/trip-planner" className="text-sm hover:text-primary">
        AnabAI - Planificateur IA
      </Link>
      <Link href="/spots" className="text-sm hover:text-primary">
        Spots Secrets
      </Link>
      <Link href="/blog" className="text-sm hover:text-primary">
        Blog
      </Link>
      <Link href="/about" className="text-sm hover:text-primary">
        À propos
      </Link>
    </>
  )

  // Composant pour le menu utilisateur
  const UserMenu = () => {
    if (!session?.user) return null
    
    const isPremium = session.user.role === "premium"
    const isLuxury = session.user.role === "luxury"
    const isAdmin = session.user.role === "admin"
    const isEditor = session.user.role === "editor"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 border-2 border-primary">
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
              </>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b",
      "before:content-[''] before:fixed before:inset-0 before:z-[-1]",
      "overflow-visible",
      className
    )}>
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <AnabaLogo />
        
        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLinks />
        </nav>
        
        {/* Actions desktop */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <UserMenu />
              <Link href="/dashboard">
                <Button className="hidden md:flex bg-primary hover:bg-primary/90">
                  Planifier mon voyage
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="outline" className="hidden md:flex ml-3">
                  Se connecter
                </Button>
              </Link>

             <Link href="/dashboard">
                <Button className="hidden md:flex bg-primary hover:bg-primary/90">
                  Planifier mon voyage
                </Button>
              </Link>
            </>
          )}

          {/* Menu mobile */}
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                <SheetTitle className="text-secondary-main">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                <NavLinks />
                <hr className="border-border" />
                {!session ? (
                    <>
                    <Link href="/auth/signin">
                        <Button className="w-full">Se connecter</Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button variant="outline" className="w-full">
                        S&apos;inscrire
                        </Button>
                    </Link>
                    </>
                ) : (
                    <div className="space-y-4">
                    <div className="flex items-center space-x-4 py-2">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || "Avatar"} />
                        <AvatarFallback>{getInitials(session.user.name || "User")}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                    </div>
                    
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start">
                        Tableau de bord
                        </Button>
                    </Link>
                    <Link href="/account">
                        <Button variant="ghost" className="w-full justify-start">
                        Paramètres du compte
                        </Button>
                    </Link>
                    {(session.user.role === "admin" || session.user.role === "editor") && (
                        <>
                        <div className="text-sm font-medium text-muted-foreground pt-2">
                            Administration
                        </div>
                        <Link href="/admin/places">
                            <Button variant="ghost" className="w-full justify-start">
                            Gestion des lieux
                            </Button>
                        </Link>
                        {session.user.role === "admin" && (
                            <Link href="/admin/users">
                            <Button variant="ghost" className="w-full justify-start">
                                Gestion des utilisateurs
                            </Button>
                            </Link>
                        )}
                        </>
                    )}
                    <Button
                        variant="destructive"
                        className="w-full mt-4"
                        onClick={handleSignOut}
                    >
                        Se déconnecter
                    </Button>
                    </div>
                )}
                </nav>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  )
}