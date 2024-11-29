'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchAndFilterProps {
  tags: string[];
  selectedTags: string[];
  onSearch: (query: string) => void;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  className?: string;
}

export function SearchAndFilter({
  tags,
  selectedTags,
  onSearch,
  onTagSelect,
  onTagRemove,
  className,
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Rechercher</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Filtrer par tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'secondary'}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected ? 'hover:bg-primary/80' : 'hover:bg-secondary/80'
                )}
                onClick={() => isSelected ? onTagRemove(tag) : onTagSelect(tag)}
              >
                {tag}
                {isSelected && (
                  <span className="ml-1" onClick={(e) => {
                    e.stopPropagation();
                    onTagRemove(tag);
                  }}>
                    ×
                  </span>
                )}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
} 