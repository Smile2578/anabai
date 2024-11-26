// providers/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const syncSession = () => {
      console.log('🔄 [Auth] Syncing session');
      router.refresh();
    };

    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, [router]);

  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Rafraîchir toutes les 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}

interface ProvidersProps extends React.PropsWithChildren {
  [key: string]: unknown;
}

export function Providers({ children, ...props }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
        onError: (error) => console.error('🔴 [Mutation Error]:', error),
        onSuccess: (data) => console.log('✅ [Mutation Success]:', { data }),
      },
    },
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nouveau : observer les changements d'état de session
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('next-auth')) {
        console.log('🔄 [Storage] Auth state changed');
        window.dispatchEvent(new Event('session-change'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          {...props}
        >
          {mounted && children}
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}