'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Blog } from '@/types/blog';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface BlogArticleProps {
  post: Blog;
}

export function BlogArticle({ post }: BlogArticleProps) {
  const { supabase } = useSupabase();

  useEffect(() => {
    // Incrémenter le nombre de vues
    supabase.rpc('increment_blog_views', { blog_id: post.id });
  }, [post.id, supabase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <article className="container mx-auto py-10 px-4">
        {/* En-tête de l'article */}
        <header className="mb-8">
          {/* Catégorie */}
          {post.category && (
            <Badge variant="secondary" className="mb-4">
              {post.category.name.fr}
            </Badge>
          )}

          {/* Titre */}
          <h1 className="text-4xl font-bold mb-4">{post.title.fr}</h1>

          {/* Métadonnées */}
          <div className="flex items-center text-muted-foreground mb-6">
            {post.author?.name && (
              <>
                <span>{post.author.name}</span>
                <span className="mx-2">•</span>
              </>
            )}
            <time dateTime={post.published_at || undefined}>
              {post.published_at ? format(new Date(post.published_at), 'dd MMMM yyyy', { locale: fr }) : ''}
            </time>
            {post.metadata?.readingTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.metadata.readingTime} min de lecture</span>
              </>
            )}
          </div>

          {/* Image de couverture */}
          {post.cover_image?.url && (
            <div className="aspect-video relative mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.cover_image.url}
                alt={post.cover_image.alt || ''}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Contenu de l'article */}
        <Card className="p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: post.content.fr || '' }}
          />
        </Card>

        {/* Pied de l'article */}
        <footer className="mt-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </footer>
      </article>
    </motion.div>
  );
} 