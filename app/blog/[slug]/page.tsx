import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import connectDB from '@/lib/db/connection';
import BlogPost from '@/models/blog.model';
import type { BlogPost as BlogPostType } from '@/types/blog';
import Image from 'next/image';

type Props = {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  await connectDB();
  const post = await BlogPost.findOne({ slug: params.slug, status: 'published' }) as BlogPostType | null;

  if (!post) {
    return {
      title: 'Article non trouvé',
    };
  }

  return {
    title: post.seo?.title?.fr || post.title.fr,
    description: post.seo?.description?.fr || post.excerpt.fr,
    keywords: post.seo?.keywords || [],
    openGraph: {
      title: post.seo?.title?.fr || post.title.fr,
      description: post.seo?.description?.fr || post.excerpt.fr,
      images: post.coverImage?.url ? [
        {
          url: post.coverImage.url,
          width: 1200,
          height: 630,
          alt: post.coverImage.alt,
        },
      ] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  await connectDB();
  const post = await BlogPost.findOne({ slug: params.slug, status: 'published' }) as BlogPostType | null;

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto py-10 px-4">
      {/* En-tête de l'article */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title.fr}</h1>
        <div className="flex items-center text-gray-600 mb-6">
          <span>{post.author.name}</span>
          <span className="mx-2">•</span>
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt ? format(post.publishedAt, 'dd MMMM yyyy', { locale: fr }) : ''}
          </time>
        </div>
        {post.coverImage?.url && (
          <div className="aspect-video relative mb-8">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              fill
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        )}
      </header>

      {/* Contenu de l'article */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.fr || '' }}
      />

      {/* Pied de l'article */}
      <footer className="mt-8 pt-8 border-t">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
} 