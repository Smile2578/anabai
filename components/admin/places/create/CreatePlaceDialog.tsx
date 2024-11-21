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
  import { PlaceCreate } from './PlaceCreate';
  import { FileCog } from 'lucide-react';
  import { ImportWizard } from '../import/ImportWizard';
  
  interface CreatePlaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (placeId: string) => void;
  }
  
  export function CreatePlaceDialog({
    open,
    onOpenChange,

  }: CreatePlaceDialogProps) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Ajouter un lieu</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lieu en le recherchant ou en important un fichier CSV.
            </DialogDescription>
          </DialogHeader>
  
          <Tabs defaultValue="search" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Rechercher un lieu</TabsTrigger>
              <TabsTrigger value="import">Importer un CSV</TabsTrigger>
            </TabsList>
  
            <TabsContent value="search" className="space-y-4">
              <Alert>
                <AlertDescription>
                  Recherchez un lieu sur Google Maps et importez-le directement.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <PlaceCreate />
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
                onComplete={() => {
                  onOpenChange(false);
                }}
                onCancel={() => onOpenChange(false)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }