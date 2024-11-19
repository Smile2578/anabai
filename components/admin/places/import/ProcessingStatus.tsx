// components/places/import/ProcessingStatus.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  CheckCircle, 
  XCircle,
  FileText,
  Search,
  Database,
  CheckSquare
} from 'lucide-react';
import { ImportStatus } from '@/types/import';

interface ProcessingStatusProps {
  currentStep: number;
  totalSteps: number;
  label: string;
  subLabel?: string;
  progress: {
    current: number;
    total: number;
  };
  status: ImportStatus;
  currentPlace?: {
    name: string;
    stage: 'reading' | 'enriching' | 'validating' | 'completed' | 'error';
    error?: string;
  };
}

const STEPS = [
  {
    icon: FileText,
    label: "Lecture CSV",
    description: "Extraction des données"
  },
  {
    icon: Search,
    label: "Enrichissement",
    description: "Récupération des détails"
  },
  {
    icon: Database,
    label: "Validation",
    description: "Vérification des données"
  },
  {
    icon: CheckSquare,
    label: "Finalisation",
    description: "Préparation de l'import"
  }
];

export function ProcessingStatus({ 
  currentStep, 
  totalSteps, 
  label, 
  subLabel, 
  progress, 
  status, 
  currentPlace 
}: ProcessingStatusProps) {
  const stepProgress = (currentStep / totalSteps) * 100;
  const itemProgress = progress.total > 0 
    ? (progress.current / progress.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Étapes avec icônes */}
      <div className="relative">
        <div className="absolute top-4 w-full">
          <div className="h-0.5 bg-muted-foreground/20">
            <div
              className={cn(
                "h-full transition-all duration-500",
                status === 'success' && "bg-semantic-success",
                status === 'error' && "bg-semantic-error",
                status === 'processing' && "bg-primary"
              )}
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>

        <div className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep - 1;
            const isCompleted = index < currentStep - 1;
            
            return (
              <motion.div
                key={step.label}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isActive || isCompleted ? 1 : 0.8,
                  opacity: isActive || isCompleted ? 1 : 0.5
                }}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full bg-background border-2",
                  isCompleted && "border-semantic-success",
                  isActive && "border-primary",
                  !isActive && !isCompleted && "border-muted-foreground/20"
                )}>
                  <Icon className={cn(
                    "w-4 h-4",
                    isCompleted && "text-semantic-success",
                    isActive && "text-primary",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )} />
                </div>

                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    isCompleted && "text-semantic-success",
                    isActive && "text-primary",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progression détaillée */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${progress.current}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="space-y-4"
        >
          {/* Statut actuel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'processing' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-4 w-4 text-semantic-success" />
              )}
              {status === 'error' && (
                <XCircle className="h-4 w-4 text-semantic-error" />
              )}
              <div>
                <p className="text-sm font-medium">{label}</p>
                {subLabel && (
                  <p className="text-xs text-muted-foreground">{subLabel}</p>
                )}
              </div>
            </div>

            {progress.total > 0 && (
              <Badge variant="outline">
                {progress.current}/{progress.total}
              </Badge>
            )}
          </div>

          {/* Barre de progression */}
          {progress.total > 0 && (
            <Progress 
              value={itemProgress} 
              className={cn(
                status === 'success' && "bg-semantic-success",
                status === 'error' && "bg-semantic-error"
              )}
            />
          )}

          {/* Élément en cours */}
          {currentPlace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-muted/50 rounded-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{currentPlace.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentPlace.stage === 'reading' && "Lecture des données"}
                    {currentPlace.stage === 'enriching' && "Enrichissement en cours"}
                    {currentPlace.stage === 'validating' && "Validation des données"}
                    {currentPlace.stage === 'completed' && "Traitement terminé"}
                    {currentPlace.stage === 'error' && "Erreur de traitement"}
                  </p>
                </div>
                
                <Badge
                  variant={currentPlace.stage === 'error' ? 'destructive' : 'default'}
                >
                  {currentPlace.stage === 'error' ? 'Erreur' : 
                   currentPlace.stage === 'completed' ? 'Terminé' : 
                   'En cours'}
                </Badge>
              </div>

              {currentPlace.error && (
                <p className="mt-2 text-xs text-semantic-error">
                  {currentPlace.error}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}