// providers/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import SupabaseProvider from './SupabaseProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </ThemeProvider>
  );
}