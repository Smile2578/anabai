import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlogPost } from '@/types/blog';

interface FeaturedPostProps {
  post?: BlogPost | null;
  loading?: boolean;
}

export function FeaturedPost({ post, loading }: FeaturedPostProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full aspect-[16/9]" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  if (!post) return null;

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-[16/9]">
          <Image
            src={typeof post.coverImage?.url === 'string' ? post.coverImage.url : '/images/placeholder.jpg'}
            alt={typeof post.coverImage?.alt === 'string' ? post.coverImage.alt : (typeof post.title === 'string' ? post.title : 'Article image')}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-background/80">
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-xl md:text-2xl font-bold line-clamp-2 text-white">
              {typeof post.title === 'string' ? post.title : post.title.fr}
            </h3>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-2">
            {format(new Date(post.publishedAt || post.createdAt), 'dd MMMM yyyy', { locale: fr })}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {typeof post.excerpt === 'string' ? post.excerpt : post.excerpt.fr}
          </p>
        </div>
      </Card>
    </Link>
  );
} 