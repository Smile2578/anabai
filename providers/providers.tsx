// providers/providers.tsx
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { Attribute, ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && status !== 'loading') {
      setInitialized(true);
    }
  }, [status, initialized]);

  if (!initialized) {
    return null;
  }

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