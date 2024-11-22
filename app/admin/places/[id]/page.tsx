// app/admin/places/[id]/page.tsx
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceEditForm } from '@/components/admin/places/PlaceEditForm';
import { usePlace } from '@/hooks/usePlace';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, ArrowLeft } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';

export default function PlaceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { place, isLoading, error, updatePlace, deletePlace } = usePlace(resolvedParams.id);

  const handleDelete = async () => {
    try {
      await deletePlace();
      router.push('/admin/places');
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          Une erreur est survenue lors du chargement du lieu.
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container py-6">
        <div className="rounded-lg bg-muted p-4">
          Lieu non trouvé.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/places">
          <Button variant="link"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Éditer {place.name.fr}
        </h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le lieu sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <TooltipProvider>
      <PlaceEditForm
        place={place}
        onSubmit={updatePlace}
        />
      </TooltipProvider>
    </div>
  );
}