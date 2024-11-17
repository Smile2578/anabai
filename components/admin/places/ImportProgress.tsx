import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ImportProgressProps {
  currentStep: number;
  totalSteps: number;
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const ImportProgress = ({ currentStep, totalSteps, label, variant = 'default' }: ImportProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="space-y-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Progress 
          value={progress} 
          className={cn(
            "h-3 transition-all",
            variant === 'success' && "bg-semantic-success",
            variant === 'warning' && "bg-semantic-warning",
            variant === 'error' && "bg-semantic-error"
          )}
        />
      </motion.div>
      <p className="text-sm text-muted-foreground text-center">{label}</p>
    </div>
  );
};