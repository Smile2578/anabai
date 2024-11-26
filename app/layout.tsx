// app/layout.tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/providers/providers';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnabAI - Votre assistant voyage intelligent pour le Japon',
  description: 'Découvrez le Japon authentique avec AnabAI, votre assistant de voyage IA personnalisé. Planifiez votre itinéraire, trouvez des spots secrets et vivez des expériences uniques.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={plusJakartaSans.className}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
