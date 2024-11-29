// components/admin/places/form/PricingSection.tsx
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Banknote } from 'lucide-react';
import { PRICE_LEVELS } from '@/lib/config/price-levels';

interface PricingSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

export const PricingSection = ({ data, onChange, isSubmitting }: PricingSectionProps) => {
  const pricing = data.pricing || {
    level: 2,
    currency: 'JPY',
    details: { fr: '', ja: '' }
  };

  const handlePriceLevelChange = (value: string) => {
    const level = parseInt(value) as 1 | 2 | 3 | 4;
    const priceInfo = PRICE_LEVELS.find(p => p.value === level);
    
    onChange({
      pricing: {
        ...pricing,
        level,
        details: {
          fr: priceInfo?.description || '',
          ja: priceInfo?.ja.description || ''
        }
      }
    });
  };

  const handleDetailsChange = (lang: 'fr' | 'ja', value: string) => {
    onChange({
      pricing: {
        ...pricing,
        details: {
          ...pricing.details,
          [lang]: value
        }
      }
    });
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Banknote className="w-6 h-6" />
            Tarification
          </CardTitle>
          <Badge variant="outline" className="text-lg px-4">
            {PRICE_LEVELS.find(level => level.value === pricing.level)?.icon}
          </Badge>
        </div>
        <CardDescription>
          Définissez le niveau de prix et les détails tarifaires
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Niveau de prix */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Niveau de prix</Label>
          <RadioGroup
            value={pricing.level?.toString()}
            onValueChange={handlePriceLevelChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            disabled={isSubmitting}
          >
            {PRICE_LEVELS.map((level) => (
              <div key={level.value} className="relative">
                <RadioGroupItem
                  value={level.value.toString()}
                  id={`price-${level.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`price-${level.value}`}
                  className="flex flex-col space-y-2 rounded-lg border-2 border-muted p-4 hover:bg-muted cursor-pointer
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10
                    peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{level.label}</span>
                    <span className="text-xl font-bold text-primary">{level.icon}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{level.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>  

        <Separator />

        {/* Détails des prix */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Détails des prix</Label>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description (Français)</Label>
              <Input
                value={pricing.details.fr}
                onChange={(e) => handleDetailsChange('fr', e.target.value)}
                placeholder="Ex: Menu déjeuner à partir de ¥1,000, menu du soir à partir de ¥3,000"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Japonais)</Label>
              <Input
                value={pricing.details.ja || ''}
                onChange={(e) => handleDetailsChange('ja', e.target.value)}
                placeholder="例：ランチメニュー1,000円から、ディナーメニュー3,000円から"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">Résumé de la tarification :</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Niveau : {PRICE_LEVELS.find(level => level.value === pricing.level)?.label}</p>
            <p>Fourchette : {PRICE_LEVELS.find(level => level.value === pricing.level)?.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};