// components/dashboard/cards/PreferencesCard.tsx
import { Button } from "@/components/ui/button";
import { PreferencesCardProps } from "@/types/dashboard/cards";
import { DashboardCard } from "../shared/DashboardCard";
import { Calendar, Heart, Scale, Wallet } from "lucide-react";

export function PreferencesCard({ preferences, onEdit }: PreferencesCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getComfortLevel = (comfort?: string) => {
    const levels = {
      budget: '🎒 Économique',
      standard: '🏡 Standard',
      luxury: '✨ Luxe',
    };
    return levels[comfort as keyof typeof levels] || 'Non spécifié';
  };

  return (
    <DashboardCard
      title="Préférences de voyage"
      description="Basé sur vos réponses au questionnaire"
    >
      <div className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-4 w-4" />
            <h4 className="font-medium">Dates et durée</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Période</p>
              <p>Du {formatDate(preferences.basicInfo?.startDate)} au {formatDate(preferences.basicInfo?.endDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Voyageurs</p>
              <p>{preferences.basicInfo?.groupSize} personne(s)</p>
            </div>
          </div>
        </div>

        {/* Style de voyage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="h-4 w-4" />
            <h4 className="font-medium">Style de voyage</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Confort</p>
              <p>{getComfortLevel(preferences.travelStyle?.comfort)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Immersion culturelle</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary/20 rounded-full">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all"
                    style={{ width: `${preferences.travelStyle?.culturalImmersion || 0}%` }}
                  />
                </div>
                <span className="text-xs">
                  {preferences.travelStyle?.culturalImmersion}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Centres d'intérêt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="h-4 w-4" />
            <h4 className="font-medium">Centres d'intérêt</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.interests?.mainInterests?.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Wallet className="h-4 w-4" />
            <h4 className="font-medium">Budget</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Budget total</p>
              <p>{preferences.budget?.total?.toLocaleString('fr-FR')} €</p>
            </div>
            <div>
              <p className="text-muted-foreground">Limite journalière</p>
              <p>{preferences.budget?.dailyLimit?.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onEdit}
          variant="outline"
          className="w-full"
        >
          Modifier mes préférences
        </Button>
      </div>
    </DashboardCard>
  );
}