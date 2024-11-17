// components/admin/places/FilterBar.tsx
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
import { StatusBadge } from './StatusBadge';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: {
    categories: string[];
    status: ('brouillon' | 'publié' | 'archivé')[];
  };
  selectedFilters: {
    categories: string[];
    status: ('brouillon' | 'publié' | 'archivé')[];
  };
  onFilterChange: (type: 'categories' | 'status', value: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = selectedFilters.categories.length > 0 || selectedFilters.status.length > 0;

  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
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

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {selectedFilters.categories.length + selectedFilters.status.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Catégories</DropdownMenuLabel>
            {filters.categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedFilters.categories.includes(category)}
                onCheckedChange={() => onFilterChange('categories', category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Statut</DropdownMenuLabel>
            {filters.status.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedFilters.status.includes(status)}
                onCheckedChange={() => onFilterChange('status', status)}
              >
                <StatusBadge status={status} className="mr-2" />
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
    </motion.div>
  );
}