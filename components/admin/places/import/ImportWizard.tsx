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

export function ImportWizard({ onComplete, onCancel }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = React.useState<'upload' | 'processing' | 'enriching' | 'preview' | 'saving'>('upload');
  const [previews, setPreviews] = React.useState<ImportPreview[]>([]);
  const [selectedPreviews, setSelectedPreviews] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState({
    label: '',
    subLabel: '',
    status: 'processing' as const
  });

  const { toast } = useToast();

  const handleFileAccepted = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentStep('processing');
      setProgress({
        label: 'Import et recherche des lieux',
        subLabel: 'Analyse du fichier CSV...',
        status: 'processing'
      });
      
      // Import initial
      const formData = new FormData();
      formData.append('file', file);

      const importResponse = await fetch('/api/admin/places/import', {
        method: 'POST',
        body: formData
      });

      if (!importResponse.ok) {
        const errorData = await importResponse.json();
        throw new Error(errorData.error || 'Erreur lors de l\'import');
      }

      const importData = await importResponse.json();
      
      // Enrichissement
      setCurrentStep('enriching');
      setProgress({
        label: 'Enrichissement des données',
        subLabel: 'Récupération des informations détaillées...',
        status: 'processing'
      });

      const enrichResponse = await fetch('/api/admin/places/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: importData.previews })
      });

      if (!enrichResponse.ok) {
        const errorData = await enrichResponse.json();
        throw new Error(errorData.error || 'Erreur lors de l\'enrichissement');
      }

      const enrichData = await enrichResponse.json();
      setPreviews(enrichData.results);
      setCurrentStep('preview');
      
      toast({
        title: "Import terminé",
        description: `${enrichData.stats.success} lieu(x) trouvé(s) sur ${enrichData.stats.total} entrée(s)`
      });

    } catch (error) {
      console.error('Import/Enrich error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: "destructive"
      });
      setCurrentStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setCurrentStep('saving');
      setProgress({
        label: 'Sauvegarde en cours',
        subLabel: 'Enregistrement des lieux...',
        status: 'processing'
      });
      
      const selectedData = previews.filter((_, index) => 
        selectedPreviews.includes(index.toString())
      );

      const saveResponse = await fetch('/api/admin/places/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previews: selectedData })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
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
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

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
      case 'enriching':
        return (
          <ProcessingStatus
            label={progress.label}
            subLabel={progress.subLabel}
            status={progress.status}
            currentStep={currentStep}
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
              onSelectAll={(selected) => {
                setSelectedPreviews(selected ? 
                  previews.map((_, i) => i.toString()) : 
                  []
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

      {currentStep === 'saving' && !error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Les lieux sont en cours d&apos;importation...
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