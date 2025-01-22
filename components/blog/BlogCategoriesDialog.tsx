import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/providers/SupabaseProvider';
import { BlogCategory } from '@/types/blog';
import { FolderCog, Trash2 } from 'lucide-react';

export function BlogCategoriesDialog() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [newCategory, setNewCategory] = useState({ fr: '', en: '' });
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Charger les catégories
  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name->fr');

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les catégories',
        variant: 'destructive',
      });
      return;
    }

    setCategories(data || []);
  }, [supabase, toast]);

  // Charger les catégories à l'ouverture du dialog
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  // Ajouter une catégorie
  const addCategory = async () => {
    if (!newCategory.fr.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la catégorie est requis',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('blog_categories')
      .insert({
        name: newCategory,
        slug: newCategory.fr.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la catégorie',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Succès',
      description: 'Catégorie créée avec succès',
    });

    setNewCategory({ fr: '', en: '' });
    loadCategories();
  };

  // Supprimer une catégorie
  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la catégorie',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Succès',
      description: 'Catégorie supprimée avec succès',
    });

    loadCategories();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} aria-describedby="Gérer les catégories">
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderCog className="mr-2 h-4 w-4" />
          Gérer les catégories
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer les catégories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nouvelle catégorie</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nom (FR)"
                value={newCategory.fr}
                onChange={(e) => setNewCategory(prev => ({ ...prev, fr: e.target.value }))}
              />
              <Input
                placeholder="Name (EN)"
                value={newCategory.en}
                onChange={(e) => setNewCategory(prev => ({ ...prev, en: e.target.value }))}
              />
              <Button onClick={addCategory}>Ajouter</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Catégories existantes</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{category.name.fr} {category.name.en ? `/ ${category.name.en}` : ''}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 