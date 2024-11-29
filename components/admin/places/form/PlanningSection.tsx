// components/admin/places/form/PlanningSection.tsx
import { Place } from '@/types/places/main';
import { PlanningInfo } from '@/types/places/base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CalendarDays, AlertCircle } from 'lucide-react';

interface PlanningSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

const TIMING_OPTIONS = [
  { value: 'morning', label: 'Matin', description: '6h - 12h' },
  { value: 'afternoon', label: 'Après-midi', description: '12h - 18h' },
  { value: 'evening', label: 'Soirée', description: '18h - 22h' },
  { value: 'night', label: 'Nuit', description: '22h - 6h' },
  { value: 'any', label: 'Peu importe', description: 'Pas de préférence' },
] as const;

const SEASONS = [
  { value: 'spring', label: 'Printemps', ja: '春' },
  { value: 'summer', label: 'Été', ja: '夏' },
  { value: 'autumn', label: 'Automne', ja: '秋' },
  { value: 'winter', label: 'Hiver', ja: '冬' },
] as const;

const DAYS = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
] as const;

export const PlanningSection = ({ data, onChange, isSubmitting }: PlanningSectionProps) => {
  const planningInfo = data.planningInfo || {};

  const updatePlanningInfo = (updates: Partial<PlanningInfo>) => {
    onChange({
      planningInfo: {
        ...planningInfo,
        ...updates
      }
    });
  };

  const handleDurationChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value);
    
    // Si l'une des valeurs est undefined, ne pas mettre à jour
    const currentDuration = planningInfo.recommendedDuration || { min: 0, max: 0 };
    const newDuration = {
      ...currentDuration,
      [field]: numValue ?? 0 // Utiliser 0 comme valeur par défaut
    };
  
    // Ne mettre à jour que si les deux valeurs sont définies
    if (newDuration.min !== undefined && newDuration.max !== undefined) {
      updatePlanningInfo({
        recommendedDuration: newDuration
      });
    }
  };

  const handlePeakHoursChange = (index: number, field: 'day' | 'start' | 'end', value: string) => {
    const peakHours = [...(planningInfo.peakHours || [])];
    peakHours[index] = {
      ...peakHours[index],
      [field]: field === 'day' ? parseInt(value) : value
    };
    updatePlanningInfo({ peakHours });
  };

  const addPeakHours = () => {
    const peakHours = [...(planningInfo.peakHours || [])];
    peakHours.push({ day: 0, start: '09:00', end: '18:00' });
    updatePlanningInfo({ peakHours });
  };

  const removePeakHours = (index: number) => {
    const peakHours = planningInfo.peakHours?.filter((_, i) => i !== index);
    updatePlanningInfo({ peakHours });
  };

  const toggleSeason = (season: 'spring' | 'summer' | 'autumn' | 'winter') => {
    const seasonality = [...(planningInfo.seasonality || [])];
    const existingIndex = seasonality.findIndex(s => s.season === season);
    
    if (existingIndex >= 0) {
      seasonality.splice(existingIndex, 1);
    } else {
      seasonality.push({
        season,
        recommended: true,
        details: { fr: '' }
      });
    }
    
    updatePlanningInfo({ seasonality });
  };

  const updateSeasonDetails = (season: string, lang: 'fr' | 'ja', value: string) => {
    const seasonality = [...(planningInfo.seasonality || [])];
    const seasonIndex = seasonality.findIndex(s => s.season === season);
    
    if (seasonIndex >= 0) {
      seasonality[seasonIndex] = {
        ...seasonality[seasonIndex],
        details: {
          ...seasonality[seasonIndex].details,
          [lang]: value
        }
      };
      updatePlanningInfo({ seasonality });
    }
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <CalendarDays className="w-6 h-6" />
          Planification
        </CardTitle>
        <CardDescription>
          Informations pour aider à la planification de la visite
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Durée recommandée */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Durée recommandée
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label>Minimum (minutes)</Label>
              <Input
                type="number"
                value={planningInfo.recommendedDuration?.min || ''}
                onChange={(e) => handleDurationChange('min', e.target.value)}
                placeholder="Ex: 30"
                min="0"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Maximum (minutes)</Label>
              <Input
                type="number"
                value={planningInfo.recommendedDuration?.max || ''}
                onChange={(e) => handleDurationChange('max', e.target.value)}
                placeholder="Ex: 120"
                min="0"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Meilleur moment */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Meilleur moment de visite</Label>
          <RadioGroup
            value={planningInfo.bestTiming || 'any'}
            onValueChange={(value) => updatePlanningInfo({ bestTiming: value as PlanningInfo['bestTiming'] })}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            disabled={isSubmitting}
          >
            {TIMING_OPTIONS.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`timing-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`timing-${option.value}`}
                  className="flex flex-col space-y-1 rounded-lg border-2 border-muted p-4 hover:bg-muted cursor-pointer
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10
                    peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Heures d'affluence */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Heures d&apos;affluence</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addPeakHours}
              disabled={isSubmitting}
            >
              Ajouter une période
            </Button>
          </div>

          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-4">
              {planningInfo.peakHours?.map((peak, index) => (
                <div key={index} className="flex items-center gap-4 p-2 rounded-lg border bg-card">
                  <select
                    value={peak.day}
                    onChange={(e) => handlePeakHoursChange(index, 'day', e.target.value)}
                    className="w-40 rounded-md border border-input bg-background px-3 py-2"
                    disabled={isSubmitting}
                  >
                    {DAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="time"
                    value={peak.start}
                    onChange={(e) => handlePeakHoursChange(index, 'start', e.target.value)}
                    className="w-32"
                    disabled={isSubmitting}
                  />

                  <span className="text-muted-foreground">à</span>

                  <Input
                    type="time"
                    value={peak.end}
                    onChange={(e) => handlePeakHoursChange(index, 'end', e.target.value)}
                    className="w-32"
                    disabled={isSubmitting}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePeakHours(index)}
                    disabled={isSubmitting}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Saisonnalité */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Saisonnalité</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SEASONS.map((season) => {
              const isSelected = planningInfo.seasonality?.some(s => s.season === season.value);
              return (
                <div key={season.value} className="space-y-4">
                  <div
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-colors
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-muted hover:bg-muted'}
                    `}
                    onClick={() => toggleSeason(season.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{season.label}</span>
                      <span className="text-lg">{season.ja}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="space-y-2">
                      <Input
                        value={planningInfo.seasonality?.find(s => s.season === season.value)?.details.fr || ''}
                        onChange={(e) => updateSeasonDetails(season.value, 'fr', e.target.value)}
                        placeholder="Détails en français"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conseils et avertissements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tips */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Conseils de visite</Label>
            <div className="space-y-2">
              <Input
                value={planningInfo.tips?.fr || ''}
                onChange={(e) => updatePlanningInfo({ tips: { ...planningInfo.tips, fr: e.target.value } })}
                placeholder="Conseils en français"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Avertissements
            </Label>
            <div className="space-y-2">
              <Input
                value={planningInfo.warnings?.fr || ''}
                onChange={(e) => updatePlanningInfo({ warnings: { ...planningInfo.warnings, fr: e.target.value } })}
                placeholder="Avertissements en français"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};