import { useState } from 'react';
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Category, Subcategory, SUBCATEGORIES } from '@/types/common';
import { cn } from '@/lib/utils';

interface CategorySectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

const CategoryIcon = ({ category }: { category: Category }) => {
  const icons: Record<Category, React.ReactNode> = {
    'Restaurant': <span className="text-2xl">🍜</span>,
    'Hôtel': <span className="text-2xl">🏨</span>,
    'Visite': <span className="text-2xl">🗼</span>,
    'Shopping': <span className="text-2xl">🛍️</span>,
    'Café & Bar': <span className="text-2xl">☕</span>
  };

  return icons[category] || null;
};

export const CategorySection = ({ data, onChange, isSubmitting }: CategorySectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(data.category);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<Subcategory>>(
    new Set(data.subcategories)
  );

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    // Réinitialiser les sous-catégories quand on change de catégorie
    setSelectedSubcategories(new Set());
    onChange({
      category,
      subcategories: []
    });
  };

  const handleSubcategoryToggle = (subcategory: Subcategory) => {
    const newSubcategories = new Set(selectedSubcategories);
    if (newSubcategories.has(subcategory)) {
      newSubcategories.delete(subcategory);
    } else {
      newSubcategories.add(subcategory);
    }
    setSelectedSubcategories(newSubcategories);
    onChange({
      subcategories: Array.from(newSubcategories)
    });
  };

  // Obtenir les sous-catégories pour la catégorie sélectionnée
  const availableSubcategories = SUBCATEGORIES[selectedCategory] || [];

  return (
    <Card className="hover-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">
            Catégorisation
          </CardTitle>
          <Badge variant="outline" className="text-lg px-4">
            <CategoryIcon category={selectedCategory} />
          </Badge>
        </div>
        <CardDescription>
          Sélectionnez la catégorie principale et les sous-catégories appropriées
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Catégories principales */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Catégorie principale</Label>
          <RadioGroup
            value={selectedCategory}
            onValueChange={(value: Category) => handleCategoryChange(value)}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            disabled={isSubmitting}
          >
            {Object.keys(SUBCATEGORIES).map((category) => (
              <div key={category} className="relative">
                <RadioGroupItem
                  value={category}
                  id={category}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={category}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-muted cursor-pointer transition-all",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                  )}
                >
                  <CategoryIcon category={category as Category} />
                  <span className="mt-2 text-center font-medium">{category}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Sous-catégories */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Sous-catégories</Label>
          <ScrollArea className="h-[200px] rounded-lg border">
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSubcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryToggle(subcategory)}
                  disabled={isSubmitting}
                  className={cn(
                    "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    "border hover:bg-muted",
                    selectedSubcategories.has(subcategory)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted text-muted-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Résumé */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium mb-2">Sélection actuelle :</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-sm">
              {selectedCategory}
            </Badge>
            {Array.from(selectedSubcategories).map((sub) => (
              <Badge key={sub} variant="secondary" className="text-sm">
                {sub}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};