// components/admin/places/ImportModal.tsx
import React from 'react';
import { AlertCircle, CheckCircle, Loader2, CheckSquare, Square } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUploadZone } from './FileUploadZone';
import { ImportProgress } from './ImportProgress';
import { DataPreviewTable } from './DataPreviewTable';
import { ImportPreview } from '@/types/place';
import { ImportProgressState } from '@/types/import';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const initialImportProgress: ImportProgressState = {
  currentStep: 0,
  totalSteps: 4,
  label: '',
  subLabel: '',
  progress: {
    current: 0,
    total: 0,
  },
  status: 'processing'
};

export function ImportModal({ open, onClose, onRefresh }: ImportModalProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState<ImportProgressState>(initialImportProgress);
  const [importPreviews, setImportPreviews] = React.useState<ImportPreview[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const isAllSelected = React.useMemo(() => {
    if (!importPreviews?.length) return false;
    return selectedRows.length === importPreviews.length;
  }, [importPreviews?.length, selectedRows.length]);

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(importPreviews?.map((_, index) => index.toString()) ?? []);
    }
  };

  const resetState = () => {
    setImportPreviews([]);
    setSelectedRows([]);
    setError(null);
    setSuccess(null);
    setImportProgress(initialImportProgress);
  };

  const handleFileUpload = async (file: File) => {
    try {
      resetState();
      setIsImporting(true);
      
      // Étape 1: Lecture du fichier CSV
      setImportProgress({
        currentStep: 1,
        totalSteps: 4,
        label: 'Lecture du fichier CSV',
        subLabel: 'Analyse du contenu',
        progress: { current: 0, total: 1 },
        status: 'processing'
      });
  
      const formData = new FormData();
      formData.append('file', file);
  
      // Import initial
      const importResponse = await fetch('/api/admin/places/import', {
        method: 'POST',
        body: formData
      });
  
      if (!importResponse.ok) {
        const errorData = await importResponse.json();
        throw new Error(errorData.message || 'Erreur lors de l\'import du fichier');
      }
  
      const importData = await importResponse.json();
      const totalPlaces = Array.isArray(importData?.previews) ? importData.previews.length : 0;
      
      if (totalPlaces === 0) {
        throw new Error('Aucun lieu trouvé dans le fichier');
      }
  
      setImportPreviews(importData.previews);
  
      // Étape 2: Enrichissement des données
      setImportProgress({
        currentStep: 2,
        totalSteps: 4,
        label: 'Enrichissement des données',
        subLabel: `Enrichissement de ${totalPlaces} lieux`,
        progress: {
          current: 0,
          total: totalPlaces
        },
        status: 'processing'
      });
  
      const enrichResponse = await fetch('/api/admin/places/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: importData.previews })
      });
  
      if (!enrichResponse.ok) {
        const errorData = await enrichResponse.json();
        throw new Error(errorData.message || 'Erreur lors de l\'enrichissement');
      }
  
      const enrichedData = await enrichResponse.json();
      let currentPreviews = enrichedData.previews ?? importData.previews;
      setImportPreviews(currentPreviews);
  
      // Étape 3: Validation des données
      setImportProgress({
        currentStep: 3,
        totalSteps: 4,
        label: 'Validation des données',
        subLabel: `Vérification de ${totalPlaces} lieux`,
        progress: {
          current: 0,
          total: totalPlaces
        },
        status: 'processing'
      });
  
      const validateResponse = await fetch('/api/admin/places/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: currentPreviews })
      });
  
      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        throw new Error(errorData.message || 'Erreur lors de la validation');
      }
  
      const validationData = await validateResponse.json();
      currentPreviews = validationData.results ?? currentPreviews;
      const stats = {
        valid: currentPreviews.filter((preview: { validationErrors?: unknown[] }) => 
          !preview.validationErrors?.length
        ).length,
        invalid: currentPreviews.filter((preview: { validationErrors?: unknown[] }) => 
          (preview.validationErrors?.length ?? 0) > 0
        ).length,
        duplicates: currentPreviews.filter((preview: { existingPlace?: unknown[] }) => 
          'existingPlace' in preview
        ).length
      };
      // Étape 4: Résumé final
      setImportProgress({
        currentStep: 4,
        totalSteps: 4,
        label: 'Import terminé',
        subLabel: `${stats.valid} lieux valides, ${stats.invalid} invalides, ${stats.duplicates} doublons`,
        progress: {
          current: totalPlaces,
          total: totalPlaces
        },
        status: stats.invalid === 0 && stats.duplicates === 0 ? 'success' : 'error'
      });
  
      setImportPreviews(currentPreviews);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setError(error instanceof Error ? error.message : 'L\'import a échoué');
      setImportProgress({
        ...initialImportProgress,
        status: 'error',
        label: 'Erreur lors de l\'import',
        subLabel: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);

      const selectedPreviews = importPreviews?.filter((_, index) => 
        selectedRows.includes(index.toString())
      );

      if (!selectedPreviews?.length) {
        setError('Veuillez sélectionner au moins un lieu à importer');
        return;
      }

      const saveResponse = await fetch('/api/admin/places/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: selectedPreviews })
      });

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }

      const saveData = await saveResponse.json();
      setSuccess(`${saveData.savedCount} lieu(x) importé(s) avec succès`);
      
      onRefresh();
      
      setTimeout(() => {
        resetState();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError(error instanceof Error ? error.message : 'La sauvegarde a échoué');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] flex flex-col"
        aria-describedby="import-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Import de lieux</DialogTitle>
          <DialogDescription id="import-modal-description">
            Importez vos fichiers CSV exportés depuis Google Maps pour enrichir votre base de lieux.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <FileUploadZone
            onFileAccepted={handleFileUpload}
            isLoading={isImporting}
          />

          {isImporting && importProgress.currentStep > 0 && (
            <div className="mt-4">
              <ImportProgress
                currentStep={importProgress.currentStep}
                totalSteps={importProgress.totalSteps}
                label={importProgress.label}
                subLabel={importProgress.subLabel}
                progress={importProgress.progress}
                status={importProgress.status}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mt-4 border-semantic-success text-semantic-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {importPreviews?.length > 0 && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleToggleAll}
                >
                  {isAllSelected ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Tout désélectionner
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      Tout sélectionner
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {selectedRows.length} sur {importPreviews.length} sélectionné(s)
                </p>
              </div>

              <DataPreviewTable
                data={importPreviews}
                selectedRows={selectedRows}
                onRowSelect={(index) => {
                  setSelectedRows(prev => {
                    const indexStr = index.toString();
                    if (prev.includes(indexStr)) {
                      return prev.filter(i => i !== indexStr);
                    }
                    return [...prev, indexStr];
                  });
                }}
              />
            </div>
          )}
        </div>

        {importPreviews?.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!selectedRows.length || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  'Importer les lieux'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}