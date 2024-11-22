// components/admin/places/form/OpeningHoursSection.tsx
import { useState } from 'react';
import { Place } from '@/types/places/main';
import { OpeningHours, OpeningPeriod } from '@/types/places/base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr, ja } from 'date-fns/locale';

interface OpeningHoursSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

type CalendarDate = Date | undefined;

const DAYS_OF_WEEK = [
  { value: 0, fr: 'Dimanche', ja: '日曜日' },
  { value: 1, fr: 'Lundi', ja: '月曜日' },
  { value: 2, fr: 'Mardi', ja: '火曜日' },
  { value: 3, fr: 'Mercredi', ja: '水曜日' },
  { value: 4, fr: 'Jeudi', ja: '木曜日' },
  { value: 5, fr: 'Vendredi', ja: '金曜日' },
  { value: 6, fr: 'Samedi', ja: '土曜日' }
];

export const OpeningHoursSection = ({ data, onChange, isSubmitting }: OpeningHoursSectionProps) => {
  const [showHolidayDates, setShowHolidayDates] = useState(false);

  const openingHours = data.openingHours || {
    periods: [],
    weekdayTexts: { fr: '', ja: '' },
    holidayDates: [],
    specialHours: []
  };

  const handlePeriodChange = (index: number, field: keyof OpeningPeriod, value: string | number) => {
    const newPeriods = [...openingHours.periods];
    newPeriods[index] = {
      ...newPeriods[index],
      [field]: value
    };

    updateOpeningHours({ periods: newPeriods });
  };

  const addPeriod = () => {
    const newPeriods = [...openingHours.periods, { day: 0, open: '09:00', close: '18:00' }];
    updateOpeningHours({ periods: newPeriods });
  };

  const removePeriod = (index: number) => {
    const newPeriods = openingHours.periods.filter((_, i) => i !== index);
    updateOpeningHours({ periods: newPeriods });
  };

  const handleWeekdayTextChange = (lang: 'fr' | 'ja', value: string) => {
    updateOpeningHours({
      weekdayTexts: {
        ...openingHours.weekdayTexts,
        [lang]: value
      }
    });
  };

  const handleHolidayDateChange = (dates: CalendarDate[] | undefined) => {
    if (!dates) return;
    // Filtrer les dates undefined et convertir en Date[]
    const validDates = dates.filter((date): date is Date => date !== undefined);
    updateOpeningHours({ holidayDates: validDates });
  };
  const updateOpeningHours = (updates: Partial<OpeningHours>) => {
    onChange({
      openingHours: {
        ...openingHours,
        ...updates
      }
    });
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Horaires d&apos;ouverture
          </CardTitle>
        </div>
        <CardDescription>
          Définissez les horaires d&apos;ouverture habituels et les exceptions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Périodes d'ouverture */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Horaires réguliers</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addPeriod}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une période
            </Button>
          </div>

          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {openingHours.periods.map((period, index) => (
                <div key={index} className="flex items-center gap-4 p-2 rounded-lg border bg-card">
                  <select
                    value={period.day}
                    onChange={(e) => handlePeriodChange(index, 'day', parseInt(e.target.value))}
                    className="w-40 rounded-md border border-input bg-background px-3 py-2"
                    disabled={isSubmitting}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.fr}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="time"
                    value={period.open}
                    onChange={(e) => handlePeriodChange(index, 'open', e.target.value)}
                    className="w-32"
                    disabled={isSubmitting}
                  />

                  <span className="text-muted-foreground">à</span>

                  <Input
                    type="time"
                    value={period.close}
                    onChange={(e) => handlePeriodChange(index, 'close', e.target.value)}
                    className="w-32"
                    disabled={isSubmitting}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePeriod(index)}
                    disabled={isSubmitting}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Description textuelle */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Description des horaires</Label>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Français</Label>
              <Input
                value={openingHours.weekdayTexts.fr}
                onChange={(e) => handleWeekdayTextChange('fr', e.target.value)}
                placeholder="Ex: Du lundi au vendredi de 9h à 18h"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Japonais</Label>
              <Input
                value={openingHours.weekdayTexts.ja || ''}
                onChange={(e) => handleWeekdayTextChange('ja', e.target.value)}
                placeholder="例：月曜日から金曜日まで午前9時から午後6時まで"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Jours fériés */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Jours fériés</Label>
            <Switch
              checked={showHolidayDates}
              onCheckedChange={setShowHolidayDates}
              disabled={isSubmitting}
            />
          </div>

          {showHolidayDates && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {openingHours.holidayDates?.length
                    ? `${openingHours.holidayDates.length} jour(s) férié(s) sélectionné(s)`
                    : "Sélectionner les jours fériés"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={openingHours.holidayDates}
                  onSelect={handleHolidayDateChange}
                  disabled={isSubmitting}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Liste des jours fériés sélectionnés */}
        {showHolidayDates && openingHours.holidayDates && openingHours.holidayDates.length > 0 && (
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-2">
              {openingHours.holidayDates.map((date, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{format(date, 'dd MMMM yyyy', { locale: fr })}</span>
                  <span className="text-muted-foreground">
                    {format(date, 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};