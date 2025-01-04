import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">
        Chargement du tableau de bord...
      </p>
    </div>
  );
}
