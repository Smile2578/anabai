// components/admin/places/form/MetadataSection.tsx
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Tag } from 'lucide-react';
import { Status } from '@/types/common';
import { AuthorsSection } from './AuthorsSection';
import { usePlaceAuthors } from '@/hooks/usePlaceAuthors';

interface MetadataSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon', description: 'Non visible sur le site' },
  { value: 'publié', label: 'Publié', description: 'Visible sur le site' },
  { value: 'archivé', label: 'Archivé', description: 'Masqué et archivé' },
] as const;

export const MetadataSection = ({ data, onChange, isSubmitting }: MetadataSectionProps) => {
  const metadata = data.metadata;
  const { updateAuthors, isUpdating } = usePlaceAuthors();

  const handleMetadataChange = (updates: Partial<Place['metadata']>) => {
    onChange({
      metadata: {
        ...metadata,
        ...updates
      }
    });
  };

  const handleTagAdd = (tag: string) => {
    if (!tag.trim()) return;
    const currentTags = metadata.tags || [];
    if (!currentTags.includes(tag)) {
      handleMetadataChange({ tags: [...currentTags, tag] });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = (metadata.tags || []).filter(tag => tag !== tagToRemove);
    handleMetadataChange({ tags: newTags });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      handleTagAdd(input.value);
      input.value = '';
    }
  };

  const handleAuthorsChange = async (authors: Place['metadata']['authors']) => {
    try {
       updateAuthors({
        placeId: data._id,
        authors: authors || []
      });
      
      // Mise à jour locale
      handleMetadataChange({ authors });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des auteurs:', error);
    }
  };

  // Désactiver les contrôles si le formulaire est en cours de soumission ou si les auteurs sont en cours de mise à jour
  const isDisabled = isSubmitting || isUpdating;

  return (
    <Card className="hover-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Métadonnées
        </CardTitle>
        <CardDescription>
          Informations techniques et de gestion
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statut */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Statut de publication</Label>
          <RadioGroup
            value={metadata.status}
            onValueChange={(value: Status) => handleMetadataChange({ status: value })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            disabled={isDisabled}
          >
            {STATUS_OPTIONS.map((status) => (
              <div key={status.value} className="relative">
                <RadioGroupItem
                  value={status.value}
                  id={`status-${status.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`status-${status.value}`}
                  className="flex flex-col space-y-1 rounded-lg border-2 border-muted p-4 hover:bg-muted cursor-pointer
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10
                    peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                >
                  <span className="font-medium">{status.label}</span>
                  <span className="text-sm text-muted-foreground">{status.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Source et ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Source</Label>
            <Input
              value={metadata.source}
              onChange={(e) => handleMetadataChange({ source: e.target.value })}
              placeholder="Ex: Google Places"
              disabled={isDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Place ID</Label>
            <Input
              value={metadata.placeId || ''}
              onChange={(e) => handleMetadataChange({ placeId: e.target.value })}
              placeholder="ID unique du lieu"
              disabled={isDisabled}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags
          </Label>
          <div className="space-y-4">
            <Input
              placeholder="Ajouter un tag (Entrée pour valider)"
              onKeyPress={handleTagKeyPress}
              disabled={isDisabled}
            />
            <ScrollArea className="h-[100px]">
              <div className="flex flex-wrap gap-2">
                {metadata.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => !isDisabled && handleTagRemove(tag)}
                  >
                    {tag}
                    {!isDisabled && <span className="ml-2">×</span>}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Auteurs */}
        <AuthorsSection
          placeId={data._id}
          authors={metadata.authors || []}
          onAuthorsChange={handleAuthorsChange}
          disabled={isDisabled}
        />

        {/* Informations de vérification */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">Informations de vérification :</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Dernière mise à jour : {metadata.lastVerified ? new Date(metadata.lastVerified).toLocaleDateString() : 'Jamais'}</p>
            <p>Vérifié par : {metadata.verifiedBy || 'Non vérifié'}</p>
            <p>Dernier enrichissement : {metadata.lastEnriched ? new Date(metadata.lastEnriched).toLocaleDateString() : 'Jamais'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};