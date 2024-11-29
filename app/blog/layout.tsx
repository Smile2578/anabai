import { Header } from '@/components/layout/Header';
import { Metadata } from 'next';
import { ScrollToTopWrapper } from '@/components/blog/ScrollToTopWrapper';

export const metadata: Metadata = {
  title: 'Blog - Anaba',
  description: 'Découvrez nos articles sur le Japon, sa culture et ses lieux incontournables.',
  openGraph: {
    title: 'Blog - Anaba',
    description: 'Découvrez nos articles sur le Japon, sa culture et ses lieux incontournables.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <div className="fixed bottom-8 right-8 z-50">
        <ScrollToTopWrapper />
      </div>
    </div>
  );
} 