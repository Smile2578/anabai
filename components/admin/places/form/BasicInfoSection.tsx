// components/admin/places/form/BasicInfoSection.tsx
import { useState } from 'react';
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface BasicInfoSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

export const BasicInfoSection = ({ data, onChange, isSubmitting }: BasicInfoSectionProps) => {
  const [showOriginalData, setShowOriginalData] = useState(false);

  const handleNameChange = (lang: 'fr' | 'ja' | 'en', value: string) => {
    onChange({
      name: {
        ...data.name,
        [lang]: value
      }
    });
  };

  const handleGemStatusChange = (checked: boolean) => {
    onChange({ isGem: checked });
  };

  return (
    <Card className="hover-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">
            Informations de base
          </CardTitle>
          {data.isGem && (
            <Badge className="bg-accent text-accent-foreground">
              Pépite
            </Badge>
          )}
        </div>
        <CardDescription>
          Informations principales du lieu
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Nom multilingue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="name-fr" className="text-lg font-semibold">
              Nom du lieu
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <InfoCircledIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Le nom doit être renseigné en français, les autres langues sont optionnelles
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                id="name-fr"
                value={data.name.fr}
                onChange={(e) => handleNameChange('fr', e.target.value)}
                className="pl-12"
                placeholder="Nom en français"
                required
                disabled={isSubmitting}
              />
              <Badge 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                variant="outline"
              >
                FR
              </Badge>
            </div>

            <div className="relative">
              <Input
                id="name-ja"
                value={data.name.ja || ''}
                onChange={(e) => handleNameChange('ja', e.target.value)}
                className="pl-12"
                placeholder="名前"
                disabled={isSubmitting}
              />
              <Badge 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                variant="outline"
              >
                JA
              </Badge>
            </div>
          </div>
        </div>

        {/* Données d'origine */}
        {data.originalData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                Données d&apos;origine
              </Label>
              <Switch
                checked={showOriginalData}
                onCheckedChange={setShowOriginalData}
              />
            </div>

            {showOriginalData && (
              <Card className="bg-muted">
                <CardContent className="pt-6 space-y-4">
                  {data.originalData.title && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Titre original</Label>
                      <p className="mt-1">{data.originalData.title}</p>
                    </div>
                  )}
                  {data.originalData.note && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Note</Label>
                      <p className="mt-1">{data.originalData.note}</p>
                    </div>
                  )}
                  {data.originalData.url && (
                    <div>
                      <Label className="text-sm text-muted-foreground">URL</Label>
                      <a 
                        href={data.originalData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-primary hover:underline"
                      >
                        {data.originalData.url}
                      </a>
                    </div>
                  )}
                  {data.originalData.comment && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Commentaire</Label>
                      <p className="mt-1">{data.originalData.comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Statut Gem */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-0.5">
            <Label className="text-base">Lieu exceptionnel</Label>
            <p className="text-sm text-muted-foreground">
              Marquer ce lieu comme un &quot;Gem&quot; le mettra en avant dans l&apos;application
            </p>
          </div>
          <Switch
            checked={data.isGem}
            onCheckedChange={handleGemStatusChange}
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
    </Card>
  );
};