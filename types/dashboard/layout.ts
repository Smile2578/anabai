import { LucideIcon } from "lucide-react";

// types/dashboard/layout.ts
export interface DashboardLayoutProps {
    children: React.ReactNode;
  }
  
  export interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    description?: string;
  }
  
  export interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
  }
  
  export interface HeaderProps {
    user?: User;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'user' | 'premium' | 'luxury';
  }