// app/questionnaire/error.tsx
'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function QuestionnaireError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Une erreur est survenue</AlertTitle>
        <AlertDescription>
          {error.message || "Une erreur inattendue s'est produite lors du chargement du questionnaire."}
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Retour au tableau de bord
        </Button>
        <Button onClick={() => reset()}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}