// components/admin/places/form/GeneralSection.tsx

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormComponentProps } from '@/types/form';
import { CATEGORIES } from '@/lib/constants';

export function GeneralSection({ form }: FormComponentProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Informations générales</h3>

        <div className="grid gap-4">
          {/* Nom en français */}
          <FormField
            control={form.control}
            name="name.fr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom en français *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nom du lieu en français"
                    value={field.value || ''} 
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nom en japonais (en lecture seule, rempli par l'enrichissement) */}
          <FormField
            control={form.control}
            name="name.ja"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom en japonais</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ''} 
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Le nom en japonais sera automatiquement rempli lors de l&apos;enrichissement
                </p>
              </FormItem>
            )}
          />

          {/* Catégorie */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sous-catégories (en lecture seule, remplies par l'enrichissement) */}
          <FormField
            control={form.control}
            name="subcategories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sous-catégories</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {field.value?.map((subcat, index) => (
                    <div 
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                      {subcat}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Les sous-catégories seront automatiquement remplies lors de l&apos;enrichissement
                </p>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}