// components/admin/places/form/OpeningHoursEditor.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle } from 'lucide-react';

interface OpeningHoursEditorProps {
  value: {
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
    weekdayText: {
      ja: string[];
      en: string[];
      fr: string[];
    };
  };
  onChange: (value: {
    periods: Array<{
      day: number;
      open: string;
      close: string;
    }>;
    weekdayText: {
      ja: string[];
      en: string[];
      fr: string[];
    };
  }) => void;
}

const DAYS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi',
  'Vendredi', 'Samedi', 'Dimanche'
];

export default function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const addPeriod = (day: number) => {
    const newPeriods = [...(value.periods || []), {
      day,
      open: '09:00',
      close: '18:00'
    }];
    onChange({ ...value, periods: newPeriods });
  };

  const removePeriod = (index: number) => {
    const newPeriods = value.periods.filter((_, i) => i !== index);
    onChange({ ...value, periods: newPeriods });
  };

  const updatePeriod = (index: number, field: 'open' | 'close', timeValue: string) => {
    const newPeriods = value.periods.map((period, i) => 
      i === index ? { ...period, [field]: timeValue } : period
    );
    onChange({ ...value, periods: newPeriods });
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day, dayIndex) => {
        const dayPeriods = value.periods?.filter(p => p.day === dayIndex) || [];

        return (
          <div key={day} className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{day}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addPeriod(dayIndex)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter une période
              </Button>
            </div>

            {dayPeriods.map((period, periodIndex) => (
              <div key={periodIndex} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={period.open}
                  onChange={e => updatePeriod(periodIndex, 'open', e.target.value)}
                  className="w-32"
                />
                <span>-</span>
                <Input
                  type="time"
                  value={period.close}
                  onChange={e => updatePeriod(periodIndex, 'close', e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePeriod(periodIndex)}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}