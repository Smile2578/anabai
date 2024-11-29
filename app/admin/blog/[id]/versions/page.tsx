'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, BlogPostVersion } from '@/types/blog';
import useSWR from 'swr';
import { use } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Params = Promise<{ id: string }>;

export default function BlogVersionsPage(props: { params: Params }) {
  const params = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: post, mutate } = useSWR<BlogPost>(
    `/api/admin/blog/${params.id}`,
    fetcher
  );

  if (!post?.versions?.length) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Aucune version disponible</h1>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/blog/${params.id}/edit`)}
          >
            Retour à l'édition
          </Button>
        </div>
      </div>
    );
  }

  const handleRestore = async (versionIndex: number) => {
    try {
      setIsRestoring(true);
      const response = await fetch(
        `/api/admin/blog/${params.id}/versions/${versionIndex}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la restauration');
      }

      toast({
        title: 'Version restaurée',
        description: 'L\'article a été restauré avec succès.',
      });

      mutate();
      router.push(`/admin/blog/${params.id}/edit`);
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la restauration.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Versions de l'article</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/blog/${params.id}/edit`)}
        >
          Retour à l'édition
        </Button>
      </div>

      <div className="space-y-6">
        {post.versions.map((version: BlogPostVersion, index: number) => (
          <div
            key={version.createdAt.toString()}
            className="border rounded-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {version.title.fr}
                </h2>
                <p className="text-sm text-gray-500">
                  Créée le{' '}
                  {format(new Date(version.createdAt), 'dd MMMM yyyy à HH:mm', {
                    locale: fr,
                  })}
                  {' par '}
                  {version.createdBy.name}
                </p>
              </div>
              <Button
                onClick={() => handleRestore(index)}
                disabled={isRestoring}
              >
                Restaurer cette version
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 