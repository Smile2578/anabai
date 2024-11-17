// components/admin/places/ImportModal.tsx
import React from 'react';
import { X, AlertCircle, CheckCircle, Loader2, CheckSquare, Square } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUploadZone } from './FileUploadZone';
import { ImportProgress } from './ImportProgress';
import { DataPreviewTable } from './DataPreviewTable';
import { ImportPreview } from '@/types/place';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function ImportModal({ open, onClose, onRefresh }: ImportModalProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState({
    current: 0,
    total: 0,
    label: ''
  });
  const [importPreviews, setImportPreviews] = React.useState<ImportPreview[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Nouvelle fonction pour vérifier si tous les éléments sont sélectionnés
  const isAllSelected = React.useMemo(() => {
    return importPreviews.length > 0 && selectedRows.length === importPreviews.length;
  }, [importPreviews.length, selectedRows.length]);

  // Fonction pour la sélection/désélection de tous les éléments
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(importPreviews.map((_, index) => index.toString()));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setIsImporting(true);
      setImportProgress({ current: 0, total: 1, label: 'Analyse du fichier...' });

      const formData = new FormData();
      formData.append('file', file);

      // Import et analyse
      const importResponse = await fetch('/api/admin/places/import', {
        method: 'POST',
        body: formData
      });

      if (!importResponse.ok) throw new Error('Erreur lors de l\'import');

      const importData = await importResponse.json();
      setImportPreviews(importData.previews);
      setImportProgress({ current: 1, total: 2, label: 'Validation des données...' });

      // Validation
      const validateResponse = await fetch('/api/admin/places/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: importData.previews })
      });

      if (!validateResponse.ok) throw new Error('Erreur lors de la validation');

      const validationData = await validateResponse.json();
      setImportPreviews(validationData.results);
      setImportProgress({ current: 2, total: 2, label: 'Validation terminée' });

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setError('L\'import a échoué');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);

      const selectedPreviews = importPreviews.filter((_, index) => 
        selectedRows.includes(index.toString())
      );

      if (selectedPreviews.length === 0) {
        setError('Veuillez sélectionner au moins un lieu à importer');
        return;
      }

      const saveResponse = await fetch('/api/admin/places/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: selectedPreviews })
      });

      if (!saveResponse.ok) throw new Error('Erreur lors de la sauvegarde');

      const saveData = await saveResponse.json();
      setSuccess(`${saveData.savedCount} lieu(x) importé(s) avec succès`);
      
      onRefresh();
      
      setTimeout(() => {
        setSuccess(null);
        setImportPreviews([]);
        setSelectedRows([]);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('La sauvegarde a échoué');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import de lieux</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <FileUploadZone
            onFileAccepted={handleFileUpload}
            isLoading={isImporting}
          />

          {isImporting && (
            <div className="mt-4">
              <ImportProgress
                currentStep={importProgress.current}
                totalSteps={importProgress.total}
                label={importProgress.label}
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

          {importPreviews.length > 0 && (
            <div className="mt-4 space-y-4">
              {/* Bouton de sélection multiple */}
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

        {importPreviews.length > 0 && (
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
                disabled={selectedRows.length === 0 || isSaving}
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