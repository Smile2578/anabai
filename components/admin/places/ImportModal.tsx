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
import { ImportStatus } from '@/types/import';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

interface CurrentPlace {
  name: string;
  stage: 'reading' | 'enriching' | 'validating' | 'completed' | 'error';
  error?: string;
}

interface ImportState {
  isImporting: boolean;
  isSaving: boolean;
  currentStep: number;
  progress: {
    current: number;
    total: number;
  };
  status: ImportStatus;
  currentPlace?: CurrentPlace;
  error: string | null;
  success: string | null;
  previews: ImportPreview[];
  selectedRows: string[];
}

const initialState: ImportState = {
  isImporting: false,
  isSaving: false,
  currentStep: 0,
  progress: {
    current: 0,
    total: 0,
  },
  status: 'processing',
  error: null,
  success: null,
  previews: [],
  selectedRows: [],
};

const IMPORT_STEPS = {
  IDLE: 0,
  READING: 1,
  ENRICHING: 2,
  VALIDATING: 3,
  FINALIZING: 4,
};

export function ImportModal({ open, onClose, onRefresh }: ImportModalProps) {
  const [state, setState] = React.useState<ImportState>(initialState);

  const isAllSelected = React.useMemo(() => {
    if (!state.previews?.length) return false;
    return state.selectedRows.length === state.previews.length;
  }, [state.previews?.length, state.selectedRows.length]);

  const resetState = () => setState(initialState);

  const updateState = (updates: Partial<ImportState>) => {
    setState(current => ({ ...current, ...updates }));
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      updateState({ selectedRows: [] });
    } else {
      updateState({
        selectedRows: state.previews?.map((_, index) => index.toString()) ?? []
      });
    }
  };

  const getStepLabel = (step: number, stats?: { valid: number; invalid: number; duplicates: number }) => {
    switch (step) {
      case IMPORT_STEPS.READING:
        return {
          label: 'Lecture du fichier CSV',
          subLabel: 'Analyse du contenu'
        };
      case IMPORT_STEPS.ENRICHING:
        return {
          label: 'Enrichissement des données',
          subLabel: `Enrichissement de ${state.progress.total} lieux`
        };
      case IMPORT_STEPS.VALIDATING:
        return {
          label: 'Validation des données',
          subLabel: `Vérification de ${state.progress.total} lieux`
        };
      case IMPORT_STEPS.FINALIZING:
        return stats ? {
          label: 'Import terminé',
          subLabel: `${stats.valid} lieux valides, ${stats.invalid} invalides, ${stats.duplicates} doublons`
        } : {
          label: 'Finalisation',
          subLabel: 'Préparation des données'
        };
      default:
        return {
          label: '',
          subLabel: ''
        };
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      resetState();
      updateState({ 
        isImporting: true,
        currentStep: IMPORT_STEPS.READING,
        currentPlace: {
          name: file.name,
          stage: 'reading'
        }
      });
      
      // Étape 1: Lecture du fichier CSV
      const formData = new FormData();
      formData.append('file', file);
      
      const importResponse = await fetch('/api/admin/places/import', {
        method: 'POST',
        body: formData
      });

      if (!importResponse.ok) {
        throw new Error((await importResponse.json()).message || 'Erreur lors de l\'import du fichier');
      }

      const importData = await importResponse.json();
      const totalPlaces = Array.isArray(importData?.previews) ? importData.previews.length : 0;
      
      if (totalPlaces === 0) {
        throw new Error('Aucun lieu trouvé dans le fichier');
      }

      updateState({
        previews: importData.previews,
        currentStep: IMPORT_STEPS.ENRICHING,
        progress: { current: 0, total: totalPlaces },
        currentPlace: {
          name: importData.previews[0]?.name || 'Inconnu',
          stage: 'enriching'
        }
      });

      // Étape 2: Enrichissement des données
      const enrichResponse = await fetch('/api/admin/places/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: importData.previews })
      });

      if (!enrichResponse.ok) {
        throw new Error((await enrichResponse.json()).message || 'Erreur lors de l\'enrichissement');
      }

      const enrichedData = await enrichResponse.json();
      updateState({
        previews: enrichedData.previews || importData.previews,
        currentStep: IMPORT_STEPS.VALIDATING,
        currentPlace: {
          name: enrichedData.previews[0]?.name || 'Inconnu',
          stage: 'validating'
        }
      });

      // Étape 3: Validation des données
      const validateResponse = await fetch('/api/admin/places/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: enrichedData.previews })
      });

      if (!validateResponse.ok) {
        throw new Error((await validateResponse.json()).message || 'Erreur lors de la validation');
      }

      const validationData = await validateResponse.json();
      const currentPreviews = validationData.results || enrichedData.previews;
      
      const stats = {
        valid: currentPreviews.filter((p: ImportPreview) => !p.validationErrors?.length).length,
        invalid: currentPreviews.filter((p: ImportPreview) => (p.validationErrors?.length ?? 0) > 0).length,
        duplicates: currentPreviews.filter((p: ImportPreview) => 'existingPlace' in p).length
      };

      updateState({
        previews: currentPreviews,
        currentStep: IMPORT_STEPS.FINALIZING,
        progress: { current: totalPlaces, total: totalPlaces },
        status: stats.invalid === 0 && stats.duplicates === 0 ? 'success' : 'error',
        currentPlace: {
          name: 'Import terminé',
          stage: 'completed'
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      updateState({
        status: 'error',
        error: error instanceof Error ? error.message : 'L\'import a échoué',
        currentPlace: {
          name: 'Erreur',
          stage: 'error',
          error: error instanceof Error ? error.message : 'Une erreur est survenue'
        }
      });
    } finally {
      updateState({ isImporting: false });
    }
  };

  const handleSave = async () => {
    try {
      updateState({ error: null, isSaving: true });

      const selectedPreviews = state.previews?.filter((_, index) => 
        state.selectedRows.includes(index.toString())
      );

      if (!selectedPreviews?.length) {
        throw new Error('Veuillez sélectionner au moins un lieu à importer');
      }

      const saveResponse = await fetch('/api/admin/places/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: selectedPreviews })
      });

      if (!saveResponse.ok) {
        throw new Error((await saveResponse.json()).message || 'Erreur lors de la sauvegarde');
      }

      const saveData = await saveResponse.json();
      updateState({
        success: `${saveData.savedCount} lieu(x) importé(s) avec succès`,
        currentPlace: {
          name: 'Sauvegarde terminée',
          stage: 'completed'
        }
      });
      
      onRefresh();
      
      setTimeout(() => {
        resetState();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      updateState({
        error: error instanceof Error ? error.message : 'La sauvegarde a échoué',
        currentPlace: {
          name: 'Erreur de sauvegarde',
          stage: 'error',
          error: error instanceof Error ? error.message : 'Une erreur est survenue'
        }
      });
    } finally {
      updateState({ isSaving: false });
    }
  };

  const stepLabels = getStepLabel(state.currentStep);

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
            isLoading={state.isImporting}
          />

          {state.isImporting && state.currentStep > 0 && (
            <div className="mt-4">
              <ImportProgress
                currentStep={state.currentStep}
                totalSteps={4}
                label={stepLabels.label}
                subLabel={stepLabels.subLabel}
                progress={state.progress}
                status={state.status}
                currentPlace={state.currentPlace}
              />
            </div>
          )}

          {state.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.success && (
            <Alert variant="default" className="mt-4 border-semantic-success text-semantic-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          {state.previews?.length > 0 && (
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
                  {state.selectedRows.length} sur {state.previews.length} sélectionné(s)
                </p>
              </div>

              <DataPreviewTable
                data={state.previews}
                selectedRows={state.selectedRows}
                onRowSelect={(index) => {
                  updateState({
                    selectedRows: state.selectedRows.includes(index.toString())
                      ? state.selectedRows.filter(i => i !== index.toString())
                      : [...state.selectedRows, index.toString()]
                  });
                }}
              />
            </div>
          )}
        </div>

        {state.previews?.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={state.isSaving}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={!state.selectedRows.length || state.isSaving}
              >
                {state.isSaving ? (
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