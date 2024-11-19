// components/admin/places/import/ImportWizard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from './FileUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { ResultsPreview } from './ResultsPreview';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ImportPreview } from '@/types/import';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type ImportStep = 'upload' | 'processing' | 'preview' | 'saving';

export function ImportWizard({ onComplete, onCancel }: ImportWizardProps) {
  // États
  const [currentStep, setCurrentStep] = React.useState<ImportStep>('upload');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previews, setPreviews] = React.useState<ImportPreview[]>([]);
  const [selectedPreviews, setSelectedPreviews] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState({
    current: 0,
    total: 0,
    label: '',
    status: 'processing' as const
  });

  const { toast } = useToast();

  // Gestion du fichier CSV
  const handleFileAccepted = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentStep('processing');
      
      // Lecture et import
      const formData = new FormData();
      formData.append('file', file);

      const importResponse = await fetch('/api/admin/places/import', {
        method: 'POST',
        body: formData
      });

      if (!importResponse.ok) {
        throw new Error('Erreur lors de l\'import');
      }

      const importData = await importResponse.json();
      setPreviews(importData.previews || []);
      
      // Enrichissement
      setProgress({
        current: 0,
        total: importData.previews.length,
        label: 'Enrichissement des données',
        status: 'processing'
      });

      const enrichResponse = await fetch('/api/admin/places/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: importData.previews })
      });

      if (!enrichResponse.ok) {
        throw new Error('Erreur lors de l\'enrichissement');
      }

      const enrichedData = await enrichResponse.json();
      setPreviews(enrichedData.previews);

      // Validation
      setProgress({
        current: enrichedData.previews.length,
        total: enrichedData.previews.length,
        label: 'Validation des données',
        status: 'processing'
      });

      const validateResponse = await fetch('/api/admin/places/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: enrichedData.previews })
      });

      if (!validateResponse.ok) {
        throw new Error('Erreur lors de la validation');
      }

      const validationData = await validateResponse.json();
      setPreviews(validationData.results);

      // Passage à la prévisualisation
      setCurrentStep('preview');
      setProgress({
        current: validationData.results.length,
        total: validationData.results.length,
        label: 'Import terminé',
        status: 'processing'
      });

    } catch (error) {
      console.error('Import error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      setProgress({
        current: 0,
        total: 0,
        label: 'Erreur',
        status: 'processing'
      });
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarde des lieux sélectionnés
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setCurrentStep('saving');
      
      const selectedData = previews.filter((_, index) => 
        selectedPreviews.includes(index.toString())
      );

      const saveResponse = await fetch('/api/admin/places/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: selectedData })
      });

      if (!saveResponse.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const saveData = await saveResponse.json();
      toast({
        title: "Succès",
        description: `${saveData.savedCount} lieu(x) importé(s) avec succès`
      });

      onComplete();

    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu conditionnel selon l'étape
  const renderStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUpload 
            onFileAccepted={handleFileAccepted}
            isLoading={isLoading}
          />
        );

      case 'processing':
        return (
          <ProcessingStatus
            currentStep={progress.current}
            totalSteps={progress.total}
            label={progress.label}
            progress={progress}
            status={progress.status}
          />
        );

      case 'preview':
      case 'saving':
        return (
          <div className="space-y-6">
            <ResultsPreview
              data={previews}
              selectedRows={selectedPreviews}
              onRowSelect={(index) => {
                setSelectedPreviews(prev => 
                  prev.includes(index.toString())
                    ? prev.filter(i => i !== index.toString())
                    : [...prev, index.toString()]
                );
              }}
            />

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Annuler
              </Button>

              <Button
                onClick={handleSave}
                disabled={!selectedPreviews.length || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  `Importer ${selectedPreviews.length} lieu(x)`
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === 'saving' && progress.status === 'processing' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Les lieux ont été importés avec succès
          </AlertDescription>
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {renderStep()}
      </motion.div>
    </div>
  );
}