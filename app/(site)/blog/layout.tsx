import { Metadata } from 'next';

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
  return children;
} 