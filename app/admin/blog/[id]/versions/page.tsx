'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, BlogPostVersion } from '@/models/blog.model';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Props {
  params: {
    id: string;
  };
}

export default function BlogPostVersionsPage({ params }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<BlogPostVersion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: post, mutate } = useSWR<BlogPost>(
    `/api/admin/blog/${params.id}`,
    fetcher
  );

  const handleRestore = async (versionIndex: number) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette version ?')) {
      return;
    }

    setIsRestoring(true);

    try {
      const response = await fetch(`/api/admin/blog/${params.id}/versions/${versionIndex}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la restauration');
      }

      toast({
        title: 'Version restaurée',
        description: 'L\'article a été restauré à la version sélectionnée.',
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

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Historique des versions</h1>
          <p className="text-gray-600">
            Article : {post.title.fr}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/blog/${params.id}/edit`)}
        >
          Retour à l'édition
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead>Titre (FR)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {post.versions?.map((version: BlogPostVersion, index: number) => (
            <TableRow key={version.createdAt.toString()}>
              <TableCell>
                {format(new Date(version.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
              </TableCell>
              <TableCell>{version.createdBy.name}</TableCell>
              <TableCell>{version.title.fr}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVersion(version);
                      setIsDialogOpen(true);
                    }}
                  >
                    Voir
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRestore(index)}
                    disabled={isRestoring}
                  >
                    Restaurer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la version</DialogTitle>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Titre</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Français</p>
                    <p>{selectedVersion.title.fr}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">English</p>
                    <p>{selectedVersion.title.en}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Extrait</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Français</p>
                    <p>{selectedVersion.excerpt.fr}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">English</p>
                    <p>{selectedVersion.excerpt.en}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Contenu</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Français</p>
                    <div 
                      className="prose prose-sm max-w-none border rounded-md p-4"
                      dangerouslySetInnerHTML={{ __html: selectedVersion.content.fr }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">English</p>
                    <div 
                      className="prose prose-sm max-w-none border rounded-md p-4"
                      dangerouslySetInnerHTML={{ __html: selectedVersion.content.en || '' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Métadonnées</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p>{selectedVersion.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 