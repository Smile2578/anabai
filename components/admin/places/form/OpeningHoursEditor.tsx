// components/admin/places/form/OpeningHoursEditor.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, MinusCircle } from 'lucide-react';

interface OpeningHours {
  periods: Array<{
    day: number;
    open: string;
    close: string;
  }>;
  weekdayText: {
    ja: string[];
    fr: string[];
  };
}

interface OpeningHoursEditorProps {
  value: OpeningHours;
  onChange: (value: OpeningHours) => void;
  isReadOnly?: boolean;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function OpeningHoursEditor({ value, onChange, isReadOnly = false }: OpeningHoursEditorProps) {
  const handleAddPeriod = (day: number) => {
    if (isReadOnly) return;
    
    const newPeriods = [
      ...value.periods,
      { day, open: '09:00', close: '18:00' }
    ];
    onChange({ ...value, periods: newPeriods });
  };

  const handleRemovePeriod = (index: number) => {
    if (isReadOnly) return;
    
    const newPeriods = value.periods.filter((_, i) => i !== index);
    onChange({ ...value, periods: newPeriods });
  };

  const handleUpdatePeriod = (index: number, field: 'open' | 'close', time: string) => {
    if (isReadOnly) return;
    
    const newPeriods = value.periods.map((period, i) => 
      i === index ? { ...period, [field]: time } : period
    );
    onChange({ ...value, periods: newPeriods });
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day, dayIndex) => {
        const dayPeriods = value.periods.filter(p => p.day === dayIndex);

        return (
          <div key={day} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{day}</span>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddPeriod(dayIndex)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter une période
                </Button>
              )}
            </div>

            {dayPeriods.map((period, periodIndex) => (
              <div key={periodIndex} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={period.open}
                  onChange={e => handleUpdatePeriod(periodIndex, 'open', e.target.value)}
                  disabled={isReadOnly}
                  className={isReadOnly ? 'bg-muted' : ''}
                />
                <span>-</span>
                <Input
                  type="time"
                  value={period.close}
                  onChange={e => handleUpdatePeriod(periodIndex, 'close', e.target.value)}
                  disabled={isReadOnly}
                  className={isReadOnly ? 'bg-muted' : ''}
                />
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePeriod(periodIndex)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}