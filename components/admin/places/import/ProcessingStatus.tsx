//components/admin/places/import/ProcessingStatus.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  FileText,
  Search,
} from 'lucide-react';

interface ProcessingStatusProps {
  label: string;
  status: 'processing' | 'success' | 'error';
}

const STEPS = [
  {
    icon: FileText,
    label: "Lecture CSV",
    description: "Extraction des données"
  },
  {
    icon: Search,
    label: "Recherche",
    description: "Identification des lieux"
  }
];

export function ProcessingStatus({ 
  label,
  status 
}: ProcessingStatusProps) {
  return (
    <div className="space-y-6">
      {/* Étapes avec icônes */}
      <div className="relative">
        <div className="relative flex justify-around max-w-md mx-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = (status === 'processing' && index === 1) || index === 0;
            const isCompleted = status === 'success' || (status === 'processing' && index === 0);
            
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
                  isActive && !isCompleted && "border-primary",
                  !isActive && !isCompleted && "border-muted-foreground/20"
                )}>
                  {status === 'processing' && isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Icon className={cn(
                      "w-4 h-4",
                      isCompleted && "text-semantic-success",
                      isActive && !isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )} />
                  )}
                </div>

                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    isCompleted && "text-semantic-success",
                    isActive && !isCompleted && "text-primary",
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
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm font-medium">{label}</p>
        </div>

        <Progress 
          value={status === 'success' ? 100 : status === 'processing' ? 75 : 0}
          className="max-w-md mx-auto" 
        />
      </motion.div>
    </div>
  );
}