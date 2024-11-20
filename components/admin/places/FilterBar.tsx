// components/admin/places/FilterBar.tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import { Category, Status } from '@/types/common';
  import { PLACE_CATEGORIES } from '@/lib/config/categories';
  
  interface FilterBarProps {
    category?: Category;
    status?: Status;
    onCategoryChange: (value: Category) => void;
    onStatusChange: (value: Status) => void;
  }
  
  export function FilterBar({
    category,
    status,
    onCategoryChange,
    onStatusChange,
  }: FilterBarProps) {
    return (
      <div className="flex gap-4">
        <Select
          value={category}
          onValueChange={(value: Category) => onCategoryChange(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(PLACE_CATEGORIES).map((cat) => (
              <SelectItem key={cat} value={cat as Category}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Select
          value={status}
          onValueChange={(value: Status) => onStatusChange(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="publié">Publié</SelectItem>
            <SelectItem value="archivé">Archivé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  