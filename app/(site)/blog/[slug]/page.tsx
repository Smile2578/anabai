import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BlogArticle } from '@/components/blog/BlogArticle';

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blogs')
    .select('*, author:users(name, email), category:blog_categories(name)')
    .eq('status', 'published')
    .eq('slug', decodeURIComponent(slug))
    .single();

  if (!post) {
    return {
      title: 'Article non trouvé - Anaba',
      description: 'L\'article que vous recherchez n\'existe pas.',
    };
  }

  return {
    title: `${post.title.fr} - Anaba`,
    description: post.excerpt.fr,
    openGraph: {
      title: post.title.fr,
      description: post.excerpt.fr,
      images: post.cover_image?.url ? [{ url: post.cover_image.url }] : [],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blogs')
    .select('*, author:users(name, email), category:blog_categories(name)')
    .eq('status', 'published')
    .eq('slug', decodeURIComponent(slug))
    .single();

  if (!post) {
    notFound();
  }

  return <BlogArticle post={post} />;
} 