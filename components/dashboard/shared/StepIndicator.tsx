// components/dashboard/shared/StepIndicator.tsx
import { Check, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: {
    title: string;
    status: 'completed' | 'current' | 'upcoming' | 'blocked';
    description?: string;
  }[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />;
      case 'current':
        return <Clock className="h-4 w-4 text-white" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              {
                'bg-primary': step.status === 'completed',
                'bg-secondary': step.status === 'current',
                'bg-muted': step.status === 'upcoming',
                'bg-destructive': step.status === 'blocked',
              }
            )}
          >
            {getStepIcon(step.status)}
          </div>
          <div className="space-y-1">
            <p className="font-medium leading-none">{step.title}</p>
            {step.description && (
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}