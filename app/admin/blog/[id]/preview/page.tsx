'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Blog } from '@/types/blog';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function BlogPreviewPage({ params }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${id}/preview`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement de l\'article');
        }

        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Impossible de charger l\'article.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm mb-4">
            {post.status === 'draft' && 'Brouillon'}
            {post.status === 'published' && 'Publié'}
            {post.status === 'archived' && 'Archivé'}
          </div>
          <h1 className="text-4xl font-bold">{post.title.fr}</h1>
        </div>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Retour
          </Button>
          <Button
            onClick={() => router.push(`/admin/blog/${id}/edit`)}
          >
            Modifier
          </Button>
        </div>
      </div>

      <article className="prose prose-lg max-w-none">
        {/* En-tête de l'article */}
        <header className="not-prose mb-8">
          <div className="flex items-center text-gray-600 mb-6">
            <span>{post.author?.name}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.published_at || undefined}>
              {post.published_at ? format(new Date(post.published_at), 'dd MMMM yyyy', { locale: fr }) : 'Non publié'}
            </time>
            {post.metadata?.readingTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.metadata.readingTime} min de lecture</span>
              </>
            )}
          </div>
          {post.cover_image?.url && (
            <div className="aspect-video relative mb-8">
              <Image
                src={post.cover_image.url}
                alt={post.cover_image.alt || ''}
                fill
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          )}
        </header>

        {/* Contenu de l'article */}
        <div 
          dangerouslySetInnerHTML={{ __html: post.content.fr || '' }}
        />

        {/* Pied de l'article */}
        <footer className="not-prose mt-8 pt-8 border-t">
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
    </div>
  );
} 