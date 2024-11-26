// providers/providers.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';

type ProvidersProps = ThemeProviderProps & {
  children: React.ReactNode;
};

export function Providers({ children, ...props }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('🔴 [Mutation Error]:', error);
        },
        onSuccess: (data) => {
          console.log('✅ [Mutation Success]:', { data });
        },
      },
    },
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          {...props}
        >
          {mounted && children}
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}