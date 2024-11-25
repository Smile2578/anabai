// components/admin/places/PlaceFilters.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Category, Status } from '@/types/common';
import { PLACE_CATEGORIES } from '@/lib/config/categories';

type FilterType = 'categories' | 'status' | 'priceRange';

interface PlaceFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedFilters: {
    categories: Category[];
    status: Status[];
    priceRange: number[];
  };
  onFilterChange: (type: FilterType, value: Category[] | Status[] | number[]) => void;
  onClearFilters: () => void;
}

export function PlaceFilters({
  searchValue,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  onClearFilters
}: PlaceFiltersProps) {
  const hasActiveFilters = 
    selectedFilters.categories.length > 0 || 
    selectedFilters.status.length > 0 ||
    selectedFilters.priceRange.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Barre de recherche */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un lieu..."
          className="pl-10 w-full"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Menu des filtres */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {selectedFilters.categories.length + 
                   selectedFilters.status.length +
                   selectedFilters.priceRange.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Catégories */}
            <DropdownMenuLabel>Catégories</DropdownMenuLabel>
            {(Object.keys(PLACE_CATEGORIES) as Category[]).map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedFilters.categories.includes(category)}
                onCheckedChange={(checked) => {
                  const newCategories = checked 
                    ? [...selectedFilters.categories, category]
                    : selectedFilters.categories.filter(c => c !== category);
                  onFilterChange('categories', newCategories);
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            {/* Statuts */}
            <DropdownMenuLabel>Statut</DropdownMenuLabel>
            {['brouillon', 'publié', 'archivé'].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedFilters.status.includes(status as Status)}
                onCheckedChange={(checked) => {
                  const newStatus = checked
                    ? [...selectedFilters.status, status as Status]
                    : selectedFilters.status.filter(s => s !== status);
                  onFilterChange('status', newStatus);
                }}
              >
                <Badge 
                  variant={
                    status === 'publié' ? 'default' :
                    status === 'archivé' ? 'destructive' :
                    'secondary'
                  }
                  className="mr-2"
                >
                  {status}
                </Badge>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />

            {/* Niveau de prix */}
            <DropdownMenuLabel>Prix</DropdownMenuLabel>
            {[1, 2, 3, 4].map((level) => (
              <DropdownMenuCheckboxItem
                key={level}
                checked={selectedFilters.priceRange.includes(level)}
                onCheckedChange={(checked) => {
                  const newPriceRange = checked
                    ? [...selectedFilters.priceRange, level]
                    : selectedFilters.priceRange.filter(p => p !== level);
                  onFilterChange('priceRange', newPriceRange);
                }}
              >
                {'¥'.repeat(level)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bouton de réinitialisation */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground"
              >
                Réinitialiser
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}