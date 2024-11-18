// components/admin/places/ImportProgress.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2 } from 'lucide-react';
import { ImportStatus } from '@/types/import';

interface ImportProgressProps {
  currentStep: number;
  totalSteps: number;
  label: string;
  subLabel?: string;
  progress: {
    current: number;
    total: number;
  };
  status: ImportStatus;
}

export const ImportProgress = ({
  currentStep,
  totalSteps,
  label,
  subLabel,
  progress,
  status = 'processing'
}: ImportProgressProps) => {
  const stepProgress = (currentStep / totalSteps) * 100;
  const itemProgress = progress.total > 0 
    ? (progress.current / progress.total) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Étapes principales */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">
            Étape {currentStep} sur {totalSteps}
          </p>
          <span className="text-sm text-muted-foreground">
            {Math.round(stepProgress)}%
          </span>
        </div>
        <Progress 
          value={stepProgress} 
          className={cn(
            "h-2 transition-all",
            status === 'success' && "bg-semantic-success",
            status === 'error' && "bg-semantic-error"
          )}
        />
      </motion.div>

      {/* Progression détaillée */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${progress.current}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'processing' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              <p className="text-sm font-medium">{label}</p>
            </div>
            {progress.total > 0 && (
              <span className="text-sm text-muted-foreground">
                {progress.current}/{progress.total}
              </span>
            )}
          </div>
          
          {subLabel && (
            <p className="text-sm text-muted-foreground">{subLabel}</p>
          )}

          {progress.total > 0 && (
            <Progress 
              value={itemProgress} 
              className="h-1"
            />
          )}

          {/* Indicateurs visuels d'étape */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center gap-2",
                  index < currentStep ? "text-semantic-success" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                  index < currentStep ? "border-semantic-success" : "border-muted",
                  index === currentStep - 1 && "bg-semantic-success text-white"
                )}>
                  {index + 1}
                </div>
                <span className="text-xs whitespace-nowrap">
                  {index === 0 && "Analyse"}
                  {index === 1 && "Enrichissement"}
                  {index === 2 && "Validation"}
                  {index === 3 && "Résumé"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};