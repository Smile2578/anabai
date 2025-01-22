import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BlogVersions } from '@/components/blog/BlogVersions';

type Props = {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blogs')
    .select('title')
    .eq('id', id)
    .single();

  if (!post) {
    return {
      title: 'Article non trouvé - Anaba',
      description: 'L\'article que vous recherchez n\'existe pas.',
    };
  }

  return {
    title: `Versions de l'article ${post.title.fr} - Anaba`,
    description: `Historique des versions de l'article ${post.title.fr}`,
  };
}

export default async function BlogVersionsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) {
    notFound();
  }

  return <BlogVersions post={post} />;
} 