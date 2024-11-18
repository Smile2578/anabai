// components/admin/places/form/DetailsSection.tsx

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FormComponentProps } from '@/types/form';

export function DetailsSection({ form }: FormComponentProps) {
  return (
    <div className="grid gap-6">
      {/* Horaires d'ouverture */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Horaires d&apos;ouverture</h3>
        <div className="bg-muted p-4 rounded-md">
          {form.watch('openingHours.weekdayText.fr').map((text, index) => (
            <p key={index} className="text-sm">{text}</p>
          ))}
        </div>
      </div>

      <Separator />

      {/* Prix et budget */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Prix</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricing.budget.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget minimum</FormLabel>
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

          <FormField
            control={form.control}
            name="pricing.budget.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget maximum</FormLabel>
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

      <Separator />

      {/* Contact */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Contact</h3>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="contact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
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
            name="contact.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
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
            name="contact.bookingUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de réservation</FormLabel>
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
        </div>
      </div>
    </div>
  );
}