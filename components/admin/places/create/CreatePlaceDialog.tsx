// components/admin/places/create/CreatePlaceDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceCreate } from './PlaceCreate';
import { FileCog, AlertTriangle } from 'lucide-react';
import { ImportWizard } from '../import/ImportWizard';
import { useAuthors } from '@/hooks/useAuthors';
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface CreatePlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (placeId: string) => void;
}

export function CreatePlaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePlaceDialogProps) {
  const { authors, isLoading: isLoadingAuthors } = useAuthors();
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');

  // Valider si un auteur est sélectionné
  const isAuthorSelected = Boolean(selectedAuthorId);

  const handlePlaceCreated = (placeId: string) => {
    onSuccess(placeId); // Notifier le parent du succès avec l'ID
    onOpenChange(false); // Fermer la modale
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ajouter un lieu</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau lieu en le recherchant ou en important un fichier CSV.
          </DialogDescription>
        </DialogHeader>

        {/* Sélection de l'auteur */}
        <div className="space-y-4 mb-4">
          <Label htmlFor="author-select">Sélectionner l&apos;auteur</Label>
          <Select 
            value={selectedAuthorId} 
            onValueChange={setSelectedAuthorId}
            disabled={isLoadingAuthors}
          >
            <SelectTrigger id="author-select">
              <SelectValue placeholder="Choisir un auteur" />
            </SelectTrigger>
            <SelectContent>
              {authors.map(author => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name} ({author.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isAuthorSelected && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vous devez sélectionner un auteur avant de continuer
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="search" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" disabled={!isAuthorSelected}>
              Rechercher un lieu
            </TabsTrigger>
            <TabsTrigger value="import" disabled={!isAuthorSelected}>
              Importer un CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <Alert>
              <AlertDescription>
                Recherchez un lieu sur Google Maps et importez-le directement.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <PlaceCreate 
                authorId={selectedAuthorId}
                authorName={authors.find(a => a.id === selectedAuthorId)?.name || ''}
                authorRole={authors.find(a => a.id === selectedAuthorId)?.role || 'editor'}
                onSuccess={handlePlaceCreated}
              />
            </div>
          </TabsContent>

          <TabsContent value="import" className="border-none p-0">
            <Alert>
              <FileCog className="h-4 w-4" />
              <AlertDescription>
                Importez plusieurs lieux à partir d&apos;un fichier CSV.
              </AlertDescription>
            </Alert>
            
            <ImportWizard
              authorId={selectedAuthorId}
              authorName={authors.find(a => a.id === selectedAuthorId)?.name || ''}
              authorRole={authors.find(a => a.id === selectedAuthorId)?.role || 'editor'}
              onComplete={() => {
                onOpenChange(false);
                onSuccess('import-completed');
              }}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}