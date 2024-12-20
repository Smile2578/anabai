// components/layout/Header.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Book, FileText, Loader, Menu } from "lucide-react"
import AnabaLogo from "@/components/brand/AnabaLogo"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
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
import { Settings, LayoutDashboard, MapPinHouse, UserIcon, BarChart3 } from "lucide-react"
import { SignOutButton } from '@/components/auth/SignOutButton';
import { useSessionManager } from "@/hooks/useSessionManager"



export function Header({ className }: { className?: string }) {
  const { session, isLoading, isAuthenticated } = useSessionManager()
  const [mounted, setMounted] = useState(false)

  // Effet unique pour le montage
  useEffect(() => {
    setMounted(true)
  }, [])

  // Effet pour le logging, avec une protection contre les logs excessifs
  useEffect(() => {
    if (mounted && !isLoading) {
      console.log('🔄 [Header] Session update:', {
        isAuthenticated,
        sessionData: session
      })
    }
  }, [mounted, session?.user?.id, isAuthenticated, isLoading, session]) // Dépendance plus précise

  if (!mounted || isLoading) {
    return (
      <header className={cn("fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b", className)}>
        <div className="container mx-auto px-4 h-12 flex items-center justify-center">
          <Loader className="animate-spin h-5 w-5" />
        </div>
      </header>
    )
  }

  // Fonction pour obtenir les initiales de l'utilisateur
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Composant pour le menu utilisateur
  const UserMenu = () => {
    if (!isAuthenticated || !session?.user) return null;
    
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
        <DropdownMenuContent className="w-56 bg-background/95" align="end" forceMount>
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
            <DropdownMenuItem asChild className="hover:bg-background/90">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/blog">
                <Book className="mr-2 h-4 w-4" />
                Anablog
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
                <DropdownMenuItem asChild>
                  <Link href="/admin/blog">
                    <FileText className="mr-2 h-4 w-4" />
                    Gestion des articles
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
                ) }
              </>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SignOutButton variant="destructive" showIcon={true} className="w-full justify-start" />
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
        
        {/* Actions desktop */}
        <div className="flex items-center gap-4">
          {isAuthenticated && session ? (
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
                <Button variant="secondary" className="hidden md:flex ml-3">
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

          <ThemeToggle />

          

          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className=" mr-2 w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-secondary-main">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Changer le thème</span>
                  <ThemeToggle />
                </div>
                <hr className="border-border" />
                {!isAuthenticated ? (
                  <>
                    <Link href="/auth/signin">
                      <Button className="w-full" variant="secondary">Se connecter</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button variant="default" className="w-full">
                        S&apos;inscrire
                      </Button>
                    </Link>
                  </>
                ) : session && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 py-2">
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage 
                          src={session.user.image || undefined} 
                          alt={session.user.name || "Avatar"} 
                        />
                        <AvatarFallback>
                          {getInitials(session.user.name || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Button>
                    </Link>
                    <Link href="/blog">
                      <Button variant="ghost" className="w-full justify-start">
                        <Book className="mr-2 h-4 w-4" />
                        Anablog
                      </Button>
                    </Link>
                    <Link href="/account">
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
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
                            <MapPinHouse className="mr-2 h-4 w-4" />
                            Gestion des lieux
                          </Button>
                        </Link>
                        {session.user.role === "admin" && (
                          <Link href="/admin/users">
                            <Button variant="ghost" className="w-full justify-start">
                              <UserIcon className="mr-2 h-4 w-4" />
                              Gestion des utilisateurs
                            </Button>
                          </Link>
                        )}
                        <Link href="/admin/blog">
                          <Button variant="ghost" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" />
                              Gestion des articles
                          </Button>
                        </Link>
                      </>
                    )}
                    <SignOutButton fullWidth variant="destructive" className="mt-4" />
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