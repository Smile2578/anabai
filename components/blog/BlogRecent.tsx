'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Blog } from '@/types/blog';

interface BlogRecentProps {
  posts: Blog[];
}

export function BlogRecent({ posts }: BlogRecentProps) {
  if (!posts.length) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-8">Articles récents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => {
          const wordCount = post.content.fr.split(/\s+/).length;
          const readingTime = Math.max(1, Math.ceil(wordCount / 200));

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden bg-card hover:shadow-lg transition-all">
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={post.cover_image?.url || '/images/placeholder.jpg'}
                      alt={post.cover_image?.alt || post.title.fr}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Contenu */}
                  <div className="p-6 space-y-4">
                    {/* Catégorie et temps de lecture */}
                    <div className="flex items-center justify-between">
                      {post.category && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {post.category.name.fr}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {readingTime} min de lecture
                      </span>
                    </div>

                    {/* Titre et extrait */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title.fr}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt.fr}
                      </p>
                    </div>

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      {post.author && (
                        <div className="text-sm">
                          <p className="font-medium leading-none">{post.author.name}</p>
                          <p className="text-xs text-muted-foreground">Auteur</p>
                        </div>
                      )}
                      <time 
                        dateTime={post.published_at || post.created_at} 
                        className="text-xs text-muted-foreground flex items-center gap-1.5"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(post.published_at || post.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </time>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
} 