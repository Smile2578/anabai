// components/admin/places/form/DetailsSection.tsx
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OpeningHoursEditor from './OpeningHoursEditor';
import { FormComponentProps } from '@/types/form';

export function DetailsSection({ form }: FormComponentProps) {
  // Validation des données reçues de l'API Maps

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Description</h3>
        <div className="grid gap-4">
          {(['fr', 'ja', 'en'] as const).map((lang) => (
            <FormField
              key={lang}
              control={form.control} 
              name={`description.${lang}` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description ({lang === 'fr' ? 'Français' : lang === 'ja' ? 'Japonais' : 'Anglais'})
                    {lang === 'fr' && ' *'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      value={field.value || ''}
                      className="min-h-[100px]"
                      required={lang === 'fr'}
                      maxLength={2000}
                      onBlur={() => {
                        field.onBlur();
                        form.trigger(`description.${lang}`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Tarifs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricing.priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau de prix</FormLabel>
                <Select 
                  onValueChange={value => field.onChange(parseInt(value))} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un niveau de prix" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">€ - Économique</SelectItem>
                    <SelectItem value="2">€€ - Modéré</SelectItem>
                    <SelectItem value="3">€€€ - Cher</SelectItem>
                    <SelectItem value="4">€€€€ - Très cher</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricing.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue="JPY"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une devise" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="JPY">JPY - Yen japonais</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Horaires d&apos;ouverture</h3>
        <OpeningHoursEditor 
          value={form.watch('openingHours') || {
            periods: [],
            weekdayText: {
              ja: [],
              en: [], 
              fr: []
            }
          }}
          onChange={(value) => {
            form.setValue('openingHours', value, { shouldValidate: true });
          }}
        />
      </div>

      <Separator />

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ''} 
                    pattern="^(\+|[0-9])[0-9\s-]*$"
                    maxLength={20}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="url" 
                    value={field.value || ''} 
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact.bookingUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de réservation</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="url" 
                    value={field.value || ''} 
                    maxLength={500}
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