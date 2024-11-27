// app/questionnaire/loading.tsx
import { Loader } from "lucide-react";

export default function QuestionnaireLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">
        Chargement du questionnaire...
      </p>
    </div>
  );
}