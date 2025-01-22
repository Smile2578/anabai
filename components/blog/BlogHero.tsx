'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Blog } from '@/types/blog';

interface BlogHeroProps {
  post: Blog;
}

export function BlogHero({ post }: BlogHeroProps) {
  if (!post) {
    return (
      <div className="relative w-full h-[70vh] min-h-[600px] bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Découvrez nos articles sur le Japon
            </h1>
            <p className="text-xl text-muted-foreground">
              Culture, voyages et découvertes au pays du soleil levant
            </p>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = post.cover_image?.url || '/images/placeholder.jpg';
  const date = post.published_at || post.created_at;
  const formattedDate = format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  const wordCount = post.content.fr.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={post.cover_image?.alt || post.title.fr}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 h-full relative">
        <div className="h-full flex items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-6"
          >
            {/* Catégorie et métadonnées */}
            <div className="flex flex-wrap items-center gap-4">
              {post.category && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {post.category.name.fr}
                </Badge>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.author && (
                  <span>{post.author.name}</span>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={date}>{formattedDate}</time>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min de lecture</span>
                </div>
              </div>
            </div>

            {/* Titre et extrait */}
            <div className="space-y-4">
              <Link href={`/blog/${post.slug}`} className="group">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {post.title.fr}
                </h1>
              </Link>
              <p className="text-xl text-muted-foreground line-clamp-2">
                {post.excerpt.fr}
              </p>
            </div>

            {/* Bouton Lire */}
            <Link 
              href={`/blog/${post.slug}`}
              className={cn(
                "inline-flex items-center px-6 py-3 rounded-full",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "font-medium transition-colors"
              )}
            >
              Lire l&apos;article
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 