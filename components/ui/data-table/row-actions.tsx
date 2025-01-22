'use client';

import { Row } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  Pencil, 
  Eye, 
  Archive, 
  Trash2, 
  Send,
  Star,
  StarOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Blog } from '@/types/blog';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface DataTableRowActionsProps {
  row: Row<Blog>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const post = row.original;
  const isDraft = post.status === 'draft';
  const isPublished = post.status === 'published';
  const isArchived = post.status === 'archived';
  const isFeatured = post.is_featured;
  const router = useRouter();

  const handleAction = async (action: string) => {
    try {
      console.log(`🔍 [DataTableRowActions] Tentative de ${action} pour l'article ${post.id}`);
      console.log('👤 [DataTableRowActions] Utilisateur:', user);
      
      if (!user) {
        toast.error('Vous devez être connecté pour effectuer cette action');
        return;
      }

      // Vérifier les permissions basées sur les métadonnées utilisateur
      const userRole = user.user_metadata?.role;
      console.log('👤 [DataTableRowActions] Rôle utilisateur:', userRole);

      if ((action === 'delete' || action === 'feature' || action === 'unfeature') && userRole !== 'admin') {
        toast.error('Seuls les administrateurs peuvent effectuer cette action');
        return;
      }

      if (!['admin', 'editor'].includes(userRole || '') && !(isDraft && post.author_id === user.id)) {
        toast.error('Vous n\'avez pas les permissions nécessaires');
        return;
      }

      const supabase = createClient();
      
      let response;
      switch (action) {
        case 'feature':
        case 'unfeature':
          response = await supabase
            .from('blogs')
            .update({ 
              is_featured: action === 'feature'
            })
            .eq('id', post.id)
            .select()
            .single();
          
          if (response.error) {
            console.error(`❌ [DataTableRowActions] Erreur lors de la ${action === 'feature' ? 'mise en avant' : 'suppression de la mise en avant'}:`, response.error);
            toast.error(`Erreur lors de la ${action === 'feature' ? 'mise en avant' : 'suppression de la mise en avant'} de l'article`);
            throw response.error;
          }
          console.log(`✅ [DataTableRowActions] Article ${action === 'feature' ? 'mis en avant' : 'retiré des articles mis en avant'} avec succès:`, response.data);
          toast.success(`Article ${action === 'feature' ? 'mis en avant' : 'retiré des articles mis en avant'} avec succès`);
          break;

        case 'publish':
          response = await supabase
            .from('blogs')
            .update({ 
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', post.id)
            .select()
            .single();
          
          if (response.error) {
            console.error('❌ [DataTableRowActions] Erreur lors de la publication:', response.error);
            toast.error('Erreur lors de la publication de l\'article');
            throw response.error;
          }
          console.log('✅ [DataTableRowActions] Article publié avec succès:', response.data);
          toast.success('Article publié avec succès');
          break;

        case 'archive':
          response = await supabase
            .from('blogs')
            .update({ status: 'archived' })
            .eq('id', post.id)
            .select()
            .single();
          
          if (response.error) {
            console.error('❌ [DataTableRowActions] Erreur lors de l\'archivage:', response.error);
            toast.error('Erreur lors de l\'archivage de l\'article');
            throw response.error;
          }
          console.log('✅ [DataTableRowActions] Article archivé avec succès:', response.data);
          toast.success('Article archivé avec succès');
          break;

        case 'delete':
          console.log('🗑️ Tentative de suppression de l\'article:', post.id);
          
          response = await fetch(`/api/admin/blog/${post.id}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Erreur lors de la suppression');
          }

          console.log('✅ Article supprimé avec succès');
          toast.success('L\'article a été supprimé avec succès');
          
          router.refresh();
          break;
      }

      // Invalider le cache pour recharger les données
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    } catch (error) {
      console.error('❌ [DataTableRowActions] Erreur:', error);
      toast.error('Une erreur est survenue lors de l\'action');
    }
  };

  // Vérifier si l'utilisateur peut supprimer/mettre en avant (admin uniquement)
  const isAdmin = user?.user_metadata?.role === 'admin';

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
          <Link href={`/admin/blog/${post.id}/edit`} className="flex items-center">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </DropdownMenuItem>
        {isAdmin && isPublished && (
          <DropdownMenuItem 
            onClick={() => handleAction(isFeatured ? 'unfeature' : 'feature')}
            className="flex items-center text-yellow-600"
          >
            {isFeatured ? (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                Retirer de la une
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Mettre à la une
              </>
            )}
          </DropdownMenuItem>
        )}
        {(isDraft || isArchived) && (
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
          <Link href={`/admin/blog/${post.id}/preview`} className="flex items-center" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Voir
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem 
            onClick={() => handleAction('delete')}
            className="flex items-center text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 