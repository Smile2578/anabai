"use client";
import React, { useCallback } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FormComponentProps } from '@/types/form';
import { toast } from '@/hooks/use-toast';

import dynamic from 'next/dynamic';

// Import dynamique de la carte pour éviter les problèmes de SSR
const MapPicker = dynamic(() => import('@/components/admin/places/form/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse" />
});

export function LocationSection({ form }: FormComponentProps) {

  const handleCoordinatesChange = useCallback(async (lat: number, lng: number) => {
    try {
      // Validation des coordonnées du Japon
      if (lat < 20 || lat > 46 || lng < 122 || lng > 154) {
        toast({
          title: "Erreur",
          description: "Les coordonnées doivent être situées au Japon",
          variant: "destructive"
        });
        return;
      }

      form.setValue('location.coordinates', [lat, lng], { shouldValidate: true });

      // Récupération des informations d'adresse
      const response = await fetch('/api/places/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) throw new Error('Erreur lors de la géolocalisation');

      const data = await response.json();

      // Mise à jour des adresses
      form.setValue('location.address', {
        fr: data.address.fr,
        ja: data.address.ja,
        en: data.address.en,
        prefecture: data.address.prefecture,
        city: data.address.city,
        postalCode: data.address.postalCode
      }, { shouldValidate: true });

      // Mise à jour des informations d'accès
      if (data.accessInfo) {
        form.setValue('location.accessInfo', {
          nearestStation: data.accessInfo.nearestStation,
          walkingTime: data.accessInfo.walkingTime,
          transportOptions: data.accessInfo.transportOptions
        }, { shouldValidate: true });
      }

    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations de localisation",
        variant: "destructive"
      });
    }
  }, [form]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Localisation</h3>

        <div className="h-[400px] relative">
          <MapPicker
            value={form.getValues('location.coordinates')}
            onChange={(coords) => handleCoordinatesChange(coords[0], coords[1])}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['fr', 'ja', 'en'] as const).map((lang) => (
            <FormField
              key={lang}
              control={form.control}
              name={`location.address.${lang}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Adresse ({lang === 'fr' ? 'Français' : lang === 'ja' ? 'Japonais' : 'Anglais'})
                    {lang === 'fr' && ' *'}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <FormField
            control={form.control}
            name="location.accessInfo.nearestStation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Station la plus proche</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.accessInfo.walkingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temps de marche (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min={0}
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}