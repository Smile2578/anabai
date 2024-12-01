// components/admin/places/PlaceFilters.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Category, Status, SUBCATEGORIES } from "@/types/common";

// Interface des props du composant
interface PlaceFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedFilters: {
    categories: Category[];
    status: Status[];
    priceRange: number[];
  };
  onFilterChange: (
    type: 'categories' | 'status' | 'priceRange',
    value: Category[] | Status[] | number[]
  ) => void;
  onClearFilters: () => void;
}

// Options de statut prédéfinies
const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'publié', label: 'Publié' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'archivé', label: 'Archivé' }
];

// Options de catégories générées à partir des SUBCATEGORIES
const CATEGORY_OPTIONS: { value: Category; label: string }[] = Object.keys(SUBCATEGORIES).map(
  category => ({
    value: category as Category,
    label: category
  })
);

export function PlaceFilters({
  searchValue,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  onClearFilters
}: PlaceFiltersProps) {
  // Vérification de la présence de filtres actifs
  const hasActiveFilters = Boolean(
    searchValue ||
    selectedFilters.categories.length > 0 ||
    selectedFilters.status.length > 0 ||
    selectedFilters.priceRange.length > 0
  );

  // Gestion du changement de statut
  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      onFilterChange('status', []);
      return;
    }
    onFilterChange('status', [value as Status]);
  };

  // Gestion du changement de catégorie
  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      onFilterChange('categories', []);
      return;
    }

    const category = value as Category;
    const currentCategories = [...selectedFilters.categories];
    const categoryIndex = currentCategories.indexOf(category);
    
    if (categoryIndex === -1) {
      // Ajouter la catégorie si elle n'existe pas
      currentCategories.push(category);
    } else {
      // Retirer la catégorie si elle existe déjà
      currentCategories.splice(categoryIndex, 1);
    }
    
    onFilterChange('categories', currentCategories);
  };

  // Suppression d'un filtre individuel
  const handleRemoveFilter = (type: 'category' | 'status', value: string) => {
    if (type === 'category') {
      const newCategories = selectedFilters.categories.filter(cat => cat !== value);
      onFilterChange('categories', newCategories);
    } else if (type === 'status') {
      onFilterChange('status', []);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de filtres principale */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {/* Champ de recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un lieu..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Sélecteurs de filtres */}
        <div className="flex gap-4">
          {/* Sélecteur de statut */}
          <Select
            value={selectedFilters.status[0] || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sélecteur de catégories */}
          <Select
            value={selectedFilters.categories.length === 0 ? 'all' : selectedFilters.categories[0]}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégories">
                {selectedFilters.categories.length === 0 
                  ? "Toutes les catégories" 
                  : `${selectedFilters.categories.length} sélectionnée(s)`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem 
                  key={category.value} 
                  value={category.value}
                  className={selectedFilters.categories.includes(category.value) ? "bg-primary/10" : ""}
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bouton de réinitialisation */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              className="h-10 w-10"
              title="Réinitialiser les filtres"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Affichage des filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {/* Affichage des catégories sélectionnées */}
          {selectedFilters.categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              {category}
              <button
                onClick={() => handleRemoveFilter('category', category)}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Affichage du statut sélectionné */}
          {selectedFilters.status.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              {STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
              <button
                onClick={() => handleRemoveFilter('status', status)}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Affichage de la recherche active si présente */}
          {searchValue && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              Recherche: {searchValue}
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}