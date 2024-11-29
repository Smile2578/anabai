'use client';

import { ColumnDef } from '@tanstack/react-table';
import { BlogPostPreview } from '@/types/blog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Eye, 
  Archive, 
  Trash2, 
  Send 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'published':
      return 'Publié';
    case 'draft':
      return 'Brouillon';
    case 'archived':
      return 'Archivé';
    default:
      return status;
  }
};

export const columns: ColumnDef<BlogPostPreview>[] = [
  {
    accessorKey: 'title',
    header: 'Titre',
    cell: ({ row }) => {
      const title = row.original.title;
      return (
        <div>
          <span className="font-medium">{title.fr}</span>
          {title.en && (
            <span className="text-sm text-muted-foreground block">
              {title.en}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={getStatusColor(row.original.status)}>
        {getStatusText(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Auteur',
    cell: ({ row }) => row.original.author.name,
  },
  {
    accessorKey: 'publishedAt',
    header: 'Date de publication',
    cell: ({ row }) => {
      const date = row.original.publishedAt;
      return date ? format(new Date(date), 'dd MMMM yyyy', { locale: fr }) : 'Non publié';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const post = row.original;
      const isDraft = post.status === 'draft';
      const isPublished = post.status === 'published';

      const handleAction = async (action: 'publish' | 'archive' | 'delete') => {
        try {
          const response = await fetch(`/api/admin/blog/${post._id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action }),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du statut');
          }

          // Recharger la page pour mettre à jour la liste
          window.location.reload();
        } catch (error) {
          console.error('Erreur:', error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/blog/${post._id}/edit`} className="flex items-center">
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
            {isDraft && (
              <DropdownMenuItem 
                onClick={() => handleAction('publish')}
                className="flex items-center text-green-600"
              >
                <Send className="mr-2 h-4 w-4" />
                Publier
              </DropdownMenuItem>
            )}
            {isPublished && (
              <DropdownMenuItem 
                onClick={() => handleAction('archive')}
                className="flex items-center text-orange-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/blog/${post.slug}`} className="flex items-center" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleAction('delete')}
              className="flex items-center text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 