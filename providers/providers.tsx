// providers/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Attribute, ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Force un refresh au montage
    router.refresh();

    // Écouter les changements de session
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('next-auth')) {
        router.refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  return children;
}

export function Providers({ children, ...props }: React.PropsWithChildren<{
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          {...props}
        >
          <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}