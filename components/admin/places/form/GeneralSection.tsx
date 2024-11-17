import React, { useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';
import { FormComponentProps } from '@/types/form';
import { CATEGORIES } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';


export function GeneralSection({ form }: FormComponentProps) {


  const handleGoogleMapsEnrichment = useCallback(async () => {
    try {
      // Validation des coordonnées
      const coordinates = form.getValues('location.coordinates');
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        toast({
          title: "Erreur",
          description: "Les coordonnées sont invalides ou manquantes",
          variant: "destructive"
        });
        return;
      }

      // Vérification que les coordonnées sont des nombres valides
      const [lat, lng] = coordinates;
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast({
          title: "Erreur",
          description: "Les coordonnées géographiques sont invalides",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/places/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajout d'un token CSRF si nécessaire
          // 'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({
          coordinates,
          locale: 'fr' // Locale par défaut
        }),
        credentials: 'include' // Pour gérer les cookies de session
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'enrichissement des données');
      }

      const data = await response.json();

      // Validation des données reçues
      if (!data || typeof data !== 'object') {
        throw new Error('Format de données invalide');
      }
      // Mise à jour du formulaire avec gestion des valeurs nulles/undefined
      {
        // Mise à jour des noms avec validation
        ['fr', 'en', 'ja'].forEach(lang => {
          const value = data.name?.[lang] || '';
          if (typeof value === 'string') {
            form.setValue(`name.${lang}` as 'name.fr' | 'name.en' | 'name.ja', value, { shouldValidate: true });
          }
        });

        // Mise à jour de la catégorie si valide
        if (data.category && CATEGORIES.includes(data.category)) {
          form.setValue('category', data.category, { shouldValidate: true });
        }

        // Mise à jour des sous-catégories avec validation
        if (Array.isArray(data.subcategories)) {
          const validSubcategories = data.subcategories.filter(
            (sub: string | unknown[]): sub is string => typeof sub === 'string' && sub.length > 0
          );
          form.setValue('subcategories', validSubcategories, { shouldValidate: true });
        }

        // Mise à jour des métadonnées
        const currentMetadata = form.getValues('metadata') || {};
        form.setValue('metadata', {
          ...currentMetadata,
          source: 'Google Maps'
        }, { shouldValidate: true });

      toast({
        title: "Succès",
        description: "Les données ont été enrichies avec succès",
      });
      }

    } catch (error) {
      console.error('Erreur lors de l\'enrichissement:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enrichissement",
        variant: "destructive"
      });
    }
  }, [form]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Informations générales</h3>

        <div className="grid gap-4">
          {(['fr', 'ja', 'en'] as const).map((lang) => (
            <FormField
              key={lang}
              control={form.control}
              name={`name.${lang}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom ({lang === 'fr' ? 'Français' : lang === 'ja' ? 'Japonais' : 'Anglais'})
                    {lang === 'fr' && ' *'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      maxLength={100}
                      aria-required={lang === 'fr'}
                      onBlur={() => {
                        field.onBlur();
                        form.trigger(`name.${lang}`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                required
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subcategories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sous-catégories</FormLabel>
              <div className="text-sm text-muted-foreground">
                Les sous-catégories seront automatiquement extraites depuis Google Maps
              </div>
              {Array.isArray(field.value) && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((subcat, index) => (
                    <div key={index} className="bg-secondary px-2 py-1 rounded-md text-sm">
                      {subcat}
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="button" 
          variant="outline"
          className="w-fit"
          onClick={handleGoogleMapsEnrichment}
          disabled={!form.getValues('location.coordinates')}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Enrichir depuis Google Maps
        </Button>
      </div>
    </div>
  );
}
