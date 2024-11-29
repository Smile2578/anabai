import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TimelinePost {
  _id: string;
  title: { fr: string };
  slug: string;
  publishedAt: Date;
}

interface TimelineGroup {
  month: Date;
  posts: TimelinePost[];
}

interface TimelineProps {
  groups: TimelineGroup[];
  loading?: boolean;
  className?: string;
}

export function Timeline({ groups, loading, className }: TimelineProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Archives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Archives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {groups.map((group) => (
          <div key={group.month.toISOString()}>
            <h3 className="font-medium text-lg text-foreground mb-4">
              {format(group.month, 'MMMM yyyy', { locale: fr })}
            </h3>
            <div className="border-l-2 border-muted pl-4 space-y-4">
              {group.posts.map((post) => (
                <div key={post._id} className="relative">
                  <div className="absolute -left-[1.1rem] top-2 h-2 w-2 rounded-full bg-primary" />
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(post.publishedAt), 'dd MMM', { locale: fr })}
                    </time>
                    <h4 className="text-foreground group-hover:text-primary transition-colors">
                      {post.title.fr}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 