// components/admin/places/form/PreviewSection.tsx

import React from 'react';
import Image from 'next/image';
import { FormComponentProps } from '@/types/form';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';

export function PreviewSection({ form }: FormComponentProps) {
  const formData = form.watch();
  const coverImage = formData.images.find(img => img.isCover) || formData.images[0];

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6">
            {/* Image de couverture */}
            {coverImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={coverImage.url}
                  alt={formData.name.fr}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Informations principales */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{formData.name.fr}</h2>
                {formData.name.ja && (
                  <p className="text-lg text-muted-foreground">{formData.name.ja}</p>
                )}
              </div>

              {/* Catégorie et sous-catégories */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{formData.category}</Badge>
                {formData.subcategories.map((subcat, index) => (
                  <Badge key={index} variant="outline">{subcat}</Badge>
                ))}
              </div>

              {/* Note Google */}
              {formData.ratings?.googleRating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {formData.ratings.googleRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({formData.ratings.googleReviewsCount} avis)
                  </span>
                </div>
              )}

              {/* Adresse */}
              <div className="space-y-1">
                <p className="font-medium">Adresse</p>
                <p>{formData.location.address.fr}</p>
                <p className="text-muted-foreground">{formData.location.address.ja}</p>
              </div>

              {/* Accès */}
              {formData.location.accessInfo.nearestStation && (
                <div className="space-y-1">
                  <p className="font-medium">Accès</p>
                  <p>
                    {formData.location.accessInfo.nearestStation} 
                    {formData.location.accessInfo.walkingTime && 
                      ` (${formData.location.accessInfo.walkingTime} min à pied)`
                    }
                  </p>
                </div>
              )}

              {/* Budget */}
              {formData.pricing?.budget && (
                <div className="space-y-1">
                  <p className="font-medium">Budget</p>
                  <p>
                    {formData.pricing.budget.min.toLocaleString()} - 
                    {formData.pricing.budget.max.toLocaleString()} ¥
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}