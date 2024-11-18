// components/admin/places/form/LocationSection.tsx

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from 'lucide-react';
import { FormComponentProps } from '@/types/form';
import { toast } from '@/hooks/use-toast';

export function LocationSection({ form }: FormComponentProps) {
  const [isEnriching, setIsEnriching] = React.useState(false);

  const handleEnrichLocation = async () => {
    try {
      setIsEnriching(true);
      const address = form.getValues('location.address.fr');
      
      if (!address) {
        toast({
          title: "Erreur",
          description: "Veuillez d'abord saisir l'adresse en français",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/admin/places/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) throw new Error('Erreur enrichissement');

      const data = await response.json();

      // Mise à jour des champs avec les données enrichies
      form.setValue('location.address.ja', data.address.ja);
      form.setValue('location.coordinates', data.coordinates);
      form.setValue('location.address.prefecture', data.prefecture);
      form.setValue('location.address.city', data.city);
      form.setValue('location.accessInfo.nearestStation', data.nearestStation);
      form.setValue('location.accessInfo.walkingTime', data.walkingTime);

      toast({
        title: "Succès",
        description: "Les informations de localisation ont été enrichies"
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: `Impossible d'enrichir les informations de localisation: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Localisation</h3>

        <div className="grid gap-4">
          {/* Adresse en français */}
          <FormField
            control={form.control}
            name="location.address.fr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse en français *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="Entrez l'adresse en français"
                      className="flex-1"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleEnrichLocation}
                    disabled={isEnriching || !field.value}
                  >
                    {isEnriching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    Enrichir
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Adresse en japonais (lecture seule) */}
          <FormField
            control={form.control}
            name="location.address.ja"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse en japonais</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Informations d'accès */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location.accessInfo.nearestStation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station la plus proche</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location.accessInfo.walkingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps de marche (min)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      readOnly
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}