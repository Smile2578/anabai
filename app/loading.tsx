// app/loading.tsx
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div 
          className={cn(
            "h-32 w-32 rounded-full border-4",
            "border-primary border-t-transparent",
            "animate-spin"
          )}
          role="status"
          aria-label="Chargement"
        />
        <span className="text-lg font-semibold text-muted-foreground">
          Chargement...
        </span>
      </div>
    </div>
  );
}