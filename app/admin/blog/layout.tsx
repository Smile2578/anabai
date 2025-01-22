// app/admin/blog/layout.tsx
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import SupabaseProvider from '@/providers/SupabaseProvider';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Création d'une instance de QueryClient qui persiste entre les rendus
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto px-4 py-6 space-y-8">
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </QueryClientProvider>
    </SupabaseProvider>
  );
}