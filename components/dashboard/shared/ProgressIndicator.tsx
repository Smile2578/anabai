// components/dashboard/shared/ProgressIndicator.tsx
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function ProgressIndicator({
  progress,
  size = 'md',
  showValue = true,
  className
}: ProgressIndicatorProps) {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="space-y-1">
      <div className="flex w-full bg-secondary/20 rounded-full overflow-hidden">
        <div
          className={cn(
            "bg-secondary transition-all duration-500 ease-in-out",
            sizes[size],
            className
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showValue && (
        <p className="text-xs text-muted-foreground text-right">
          {progress}% complété
        </p>
      )}
    </div>
  );
}