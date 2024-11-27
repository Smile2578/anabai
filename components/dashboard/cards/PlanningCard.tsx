// components/dashboard/cards/PlanningCard.tsx
import { Button } from "@/components/ui/button";
import { PlanningCardProps } from "@/types/dashboard/cards";
import { DashboardCard } from "../shared/DashboardCard";
import { ProgressIndicator } from "../shared/ProgressIndicator";
import { StepIndicator } from "../shared/StepIndicator";
import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";

const planningSteps = [
  {
    title: "Questionnaire complété",
    status: "completed" as const,
    description: "Vos préférences ont été enregistrées"
  },
  {
    title: "Création de l'itinéraire",
    status: "current" as const,
    description: "En cours de génération par AnabAI"
  },
  {
    title: "Validation du programme",
    status: "upcoming" as const,
    description: "Revue et ajustements de l'itinéraire"
  },
  {
    title: "Réservations",
    status: "upcoming" as const,
    description: "Hébergements et activités principales"
  }
];

export function PlanningCard({ status }: PlanningCardProps) {
  const getProgress = () => {
    const completedSteps = planningSteps.filter(
      step => step.status === 'completed'
    ).length;
    return Math.round((completedSteps / planningSteps.length) * 100);
  };

  return (
    <DashboardCard
      title="Planification du voyage"
      description="État d'avancement de votre itinéraire"
    >
      <div className="space-y-6">
        {status === 'not_started' ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Commencez votre aventure</h3>
              <p className="text-sm text-muted-foreground">
                Laissez AnabAI créer votre itinéraire personnalisé
              </p>
            </div>
            <Link href="/dashboard/planning">
              <Button>
                Créer mon itinéraire
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ProgressIndicator progress={getProgress()} />
            <StepIndicator steps={planningSteps} />
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                Voir les détails
              </Button>
              <Button size="sm">
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
}