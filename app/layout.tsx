// app/layout.tsx
import type { Metadata } from "next";
import { Providers } from '@/providers/providers';
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AnabAI | Découvrez le Japon Authentique",
  description: "AnabAI - Votre assistant personnel pour découvrir les trésors cachés du Japon",
  metadataBase: new URL('https://anabai.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://anabai.com',
    title: 'AnabAI | Découvrez le Japon Authentique',
    description: 'AnabAI - Votre assistant personnel pour découvrir les trésors cachés du Japon',
    siteName: 'AnabAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnabAI | Découvrez le Japon Authentique',
    description: 'AnabAI - Votre assistant personnel pour découvrir les trésors cachés du Japon',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="fr" 
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}