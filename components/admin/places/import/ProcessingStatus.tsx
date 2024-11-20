// components/admin/places/import/ProcessingStatus.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  FileText,
  Search,
  Database,
} from 'lucide-react';

interface ProcessingStatusProps {
  label: string;
  subLabel?: string;
  status: 'processing' | 'success' | 'error';
  currentStep: 'upload' | 'processing' | 'enriching' | 'preview' | 'saving';
}

const STEPS = [
  {
    icon: FileText,
    label: "Lecture CSV",
    description: "Extraction des données",
    step: 'upload'
  },
  {
    icon: Search,
    label: "Recherche",
    description: "Identification des lieux",
    step: 'processing'
  },
  {
    icon: Database,
    label: "Enrichissement",
    description: "Récupération des détails",
    step: 'enriching'
  }
];

export function ProcessingStatus({ 
  label,
  subLabel,
  status,
  currentStep 
}: ProcessingStatusProps) {
  const getStepState = (stepName: string) => {
    const stepIndex = STEPS.findIndex(s => s.step === stepName);
    const currentIndex = STEPS.findIndex(s => s.step === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Étapes avec icônes */}
      <div className="relative">
        <div className="relative flex justify-around max-w-md mx-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const stepState = getStepState(step.step);
            const isActive = stepState === 'active';
            const isCompleted = stepState === 'completed';
            
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
                  isCompleted && "border-success text-success",
                  isActive && "border-primary text-primary",
                  !isActive && !isCompleted && "border-muted-foreground/20"
                )}>
                  {isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    isCompleted && "text-success",
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm font-medium">{label}</p>
          </div>
          {subLabel && (
            <p className="text-xs text-muted-foreground">{subLabel}</p>
          )}
        </div>

        <Progress 
          value={
            status === 'success' ? 100 : 
            currentStep === 'enriching' ? 66 :
            currentStep === 'processing' ? 33 : 0
          }
          className="max-w-md mx-auto" 
        />
      </motion.div>
    </div>
  );
}