// components/questionnaire/QuestionnaireProgress.tsx

'use client';

import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { cn } from "@/lib/utils";
import { 
  User, 
  Map, 
  Heart, 
  Settings, 
  CheckCircle 
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const steps = [
  { number: 1, title: "Informations de base", icon: User },
  { number: 2, title: "Style de voyage", icon: Map },
  { number: 3, title: "Centres d'intérêt", icon: Heart },
  { number: 4, title: "Budget et Contraintes", icon: Settings },
  { number: 5, title: "Validation", icon: CheckCircle },
];

export function QuestionnaireProgress() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentStepNumber, setCurrentStepNumber] = useState(1);
  const { isStepCompleted } = useQuestionnaireStore();

  useEffect(() => {
    setMounted(true);
    // Extraire le numéro d'étape de l'URL
    const stepNumber = parseInt(pathname.split('/').pop() || '1');
    setCurrentStepNumber(stepNumber);
  }, [pathname]);

  if (!mounted) {
    return null; // Évite l'erreur d'hydratation
  }

  return (
    <nav className="w-full" aria-label="Progression du questionnaire">
      <div className="flex justify-between items-center">
        <AnimatePresence>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2",
                    "transition-all duration-300 ease-in-out",
                    currentStepNumber === step.number
                      ? "border-primary bg-primary text-white scale-110"
                      : isStepCompleted(step.number)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted text-muted-foreground"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className={cn(
                  "text-sm mt-2 transition-colors duration-300",
                  currentStepNumber === step.number
                    ? "text-primary font-medium"
                    : "text-secondary"
                )}>
                  {step.title}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentStepNumber - 1) / (steps.length - 1)) * 100}%` 
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </nav>
  );
}