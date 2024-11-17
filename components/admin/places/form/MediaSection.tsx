// components/admin/places/form/MediaSection.tsx
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { FormComponentProps } from '@/types/form';

export function MediaSection({ form }: FormComponentProps) {
  const images = form.watch('images') || [];

  const toggleCover = (index: number) => {
    const currentImages = form.getValues('images');
    const updatedImages = currentImages.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    form.setValue('images', updatedImages);
  };

  if (images.length === 0) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Images</h3>
          <Card className="bg-muted">
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Les images seront automatiquement récupérées depuis Google Maps lors de l&apos;enrichissement des données.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="group relative">
              <CardContent className="p-2">
                <div className="relative aspect-square overflow-hidden rounded-md">
                  <Image
                    src={image.url}
                    alt={image.caption?.fr || image.caption?.en || ''}
                    fill
                    className="object-cover"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity",
                      image.isCover && "opacity-100 bg-primary text-white hover:bg-primary/90"
                    )}
                    onClick={() => toggleCover(index)}
                  >
                    {image.isCover ? 'Photo principale' : 'Définir comme principale'}
                  </Button>
                </div>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name={`images.${index}.caption.fr`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Légende</FormLabel>
                        <Input 
                          {...field} 
                          className="text-xs" 
                          value={field.value || ''} 
                          placeholder="Ajouter une légende..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}