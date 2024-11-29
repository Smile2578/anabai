'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface HeroPostProps {
  post: BlogPost;
  className?: string;
}

export function HeroPost({ post, className }: HeroPostProps) {
  const title = typeof post.title === 'string' ? post.title : post.title.fr;
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt : post.excerpt.fr;
  const imageUrl = post.coverImage?.url || '/images/placeholder.jpg';
  const category = post.category || 'Culture';
  const date = new Date(post.publishedAt || post.createdAt).toISOString();
  const formattedDate = format(new Date(date), 'dd MMMM yyyy', { locale: fr });

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className={cn(
        "group relative overflow-hidden rounded-xl bg-background shadow-lg transition-all hover:shadow-xl",
        "h-[60vh] min-h-[500px] w-full",
        className
      )}>
        {/* Image */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative space-y-4"
          >
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              {category}
            </Badge>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h2>

            <p className="text-base md:text-lg text-muted-foreground line-clamp-2 max-w-2xl">
              {excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={date}>
                  {formattedDate}
                </time>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </Link>
  );
} 