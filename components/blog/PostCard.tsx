'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Clock, Calendar} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { BlogPost } from '@/types/blog';

interface PostCardProps {
  post: BlogPost;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const title = typeof post.title === 'string' ? post.title : post.title.fr;
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt : post.excerpt.fr;
  const imageUrl = post.coverImage?.url || '/images/placeholder.jpg';
  const category = post.category || 'Culture';
  const date = new Date(post.publishedAt || post.createdAt).toISOString();
  const formattedDate = format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  
  // Calcul du temps de lecture (environ 200 mots par minute)
  const content = typeof post.content === 'string' ? post.content : post.content.fr;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={className}
    >
      <Link href={`/blog/${post.slug}`}>
        <Card className="group overflow-hidden bg-background hover:shadow-lg transition-all">
          {/* Image Container */}
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min de lecture
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  <p className="font-medium leading-none">{post.author?.name}</p>
                  <p className="text-xs text-muted-foreground">Auteur</p>
                </div>
              </div>
              <time dateTime={date} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </time>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
} 