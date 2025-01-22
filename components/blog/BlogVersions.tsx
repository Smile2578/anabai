'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Blog, BlogVersion } from '@/types/blog';
import { Loader2 } from 'lucide-react';

interface BlogVersionsProps {
  post: Blog;
}

export function BlogVersions({ post }: BlogVersionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [versions, setVersions] = useState<BlogVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('blog_versions')
          .select('*')
          .eq('blog_id', post.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVersions(data || []);
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast({
          description: 'Impossible de charger les versions.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [post.id, toast]);

  const handleRestore = async (version: BlogVersion) => {
    try {
      setIsRestoring(true);
      const supabase = createClient();

      // Créer une nouvelle version avec le contenu actuel
      const { data: currentBlog, error: fetchError } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', post.id)
        .single();

      if (fetchError) throw fetchError;

      // Mettre à jour l'article avec les données de la version
      const { error: updateError } = await supabase
        .from('blogs')
        .update({
          title: version.version_data.title,
          content: version.version_data.content,
          excerpt: version.version_data.excerpt,
          cover_image: version.version_data.cover_image,
          category_id: version.version_data.category,
          tags: version.version_data.tags,
          seo: version.version_data.seo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (updateError) throw updateError;

      // Créer une nouvelle version avec l'ancien contenu
      const { error: versionError } = await supabase
        .from('blog_versions')
        .insert({
          blog_id: post.id,
          version_data: {
            title: currentBlog.title,
            content: currentBlog.content,
            excerpt: currentBlog.excerpt,
            cover_image: currentBlog.cover_image,
            category: currentBlog.category_id,
            tags: currentBlog.tags,
            seo: currentBlog.seo,
          },
          version_number: versions.length + 1,
          created_by: currentBlog.author_id,
        });

      if (versionError) throw versionError;

      toast({
        description: 'L\'article a été restauré à la version sélectionnée.',
      });

      router.refresh();
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        description: 'Impossible de restaurer la version.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Versions de l&apos;article</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Retour
        </Button>
      </div>

      <div className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.id}
            className="p-6 rounded-lg border bg-card"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Version {version.version_number}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Créée le {format(new Date(version.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
              <Button
                onClick={() => handleRestore(version)}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restauration...
                  </>
                ) : (
                  'Restaurer'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Titre</h4>
                <p>{version.version_data.title.fr}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Extrait</h4>
                <p>{version.version_data.excerpt.fr}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {version.version_data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {versions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune version disponible.
          </div>
        )}
      </div>
    </div>
  );
} 