'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import type { BlogCategory } from '@/models/blog-category.model';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CategoryRowProps {
  category: BlogCategory;
  level?: number;
  onEdit: (category: BlogCategory) => void;
  onDelete: (category: BlogCategory) => void;
}

function CategoryRow({ category, level = 0, onEdit, onDelete }: CategoryRowProps) {
  return (
    <>
      <TableRow key={category._id}>
        <TableCell>
          <span style={{ marginLeft: `${level * 1.5}rem` }}>
            {category.name.fr}
          </span>
        </TableCell>
        <TableCell>{category.name.en}</TableCell>
        <TableCell>{category.slug}</TableCell>
        <TableCell>{category.order}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
            >
              Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(category)}
            >
              Supprimer
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {category.children?.map((child) => (
        <CategoryRow
          key={child._id}
          category={child}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

export default function BlogCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, mutate } = useSWR<BlogCategory[]>(
    '/api/admin/blog/categories',
    fetcher
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: {
        fr: formData.get('name-fr'),
        en: formData.get('name-en'),
      },
      description: {
        fr: formData.get('description-fr'),
        en: formData.get('description-en'),
      },
      parent: formData.get('parent') || undefined,
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      const response = await fetch(
        selectedCategory
          ? `/api/admin/blog/categories/${selectedCategory._id}`
          : '/api/admin/blog/categories',
        {
          method: selectedCategory ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      toast({
        title: selectedCategory ? 'Catégorie modifiée' : 'Catégorie créée',
        description: 'Les modifications ont été enregistrées avec succès.',
      });

      setIsDialogOpen(false);
      setSelectedCategory(null);
      mutate();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: BlogCategory) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/blog/categories/${category._id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast({
        title: 'Catégorie supprimée',
        description: 'La catégorie a été supprimée avec succès.',
      });

      mutate();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Catégories du Blog</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCategory(null)}>
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>

                <TabsContent value="fr" className="space-y-4">
                  <div>
                    <Label htmlFor="name-fr">Nom</Label>
                    <Input
                      id="name-fr"
                      name="name-fr"
                      defaultValue={selectedCategory?.name.fr}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-fr">Description</Label>
                    <Input
                      id="description-fr"
                      name="description-fr"
                      defaultValue={selectedCategory?.description?.fr}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <div>
                    <Label htmlFor="name-en">Name</Label>
                    <Input
                      id="name-en"
                      name="name-en"
                      defaultValue={selectedCategory?.name.en}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description-en">Description</Label>
                    <Input
                      id="description-en"
                      name="description-en"
                      defaultValue={selectedCategory?.description?.en}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label htmlFor="parent">Catégorie parente</Label>
                <select
                  id="parent"
                  name="parent"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue={selectedCategory?.parent?.toString()}
                >
                  <option value="">Aucune</option>
                  {categories?.map((cat: BlogCategory) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      disabled={cat._id === selectedCategory?._id}
                    >
                      {cat.name.fr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="order">Ordre d'affichage</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  defaultValue={selectedCategory?.order || 0}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom (FR)</TableHead>
            <TableHead>Nom (EN)</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Ordre</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.map((category: BlogCategory) => (
            <CategoryRow
              key={category._id}
              category={category}
              onEdit={(cat) => {
                setSelectedCategory(cat);
                setIsDialogOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 