// components/questionnaire/QuestionnaireProgress.tsx
'use client';

import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const steps = [
  { number: 1, title: "Informations de base" },
  { number: 2, title: "Style de voyage" },
  { number: 3, title: "Centres d'intérêt" },
  { number: 4, title: "Budget et Contraintes" },
  { number: 5, title: "Validation" },
];

export function QuestionnaireProgress() {
  const { currentStep, isStepCompleted } = useQuestionnaireStore();

  return (
    <nav className="w-full" aria-label="Progression du questionnaire">
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                "transition-colors duration-300",
                currentStep === step.number
                  ? "border-primary bg-primary text-white"
                  : isStepCompleted(step.number)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted bg-muted text-muted-foreground"
              )}
            >
              <span>{step.number}</span>
            </div>
            <span className="text-sm mt-2 text-secondary">{step.title}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
          }}
        />
      </div>
    </nav>
  );
}