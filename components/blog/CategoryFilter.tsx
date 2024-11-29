'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Gastronomie' },
  { id: 'transport', label: 'Transports' },
  { id: 'accommodation', label: 'Hébergement' },
  { id: 'tips', label: 'Conseils pratiques' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'events', label: 'Événements' }
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number]['id'];

interface CategoryFilterProps {
  onCategoryChange: (category: BlogCategory) => void;
  className?: string;
  initialCategory?: BlogCategory;
}

export function CategoryFilter({ 
  onCategoryChange, 
  className,
  initialCategory = 'all'
}: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>(initialCategory);

  const handleCategoryClick = (categoryId: BlogCategory) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId);
  };

  return (
    <div className={cn("w-full overflow-x-auto scrollbar-hide", className)}>
      <div className="flex gap-2 min-w-max px-4 md:px-0">
        {BLOG_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id as BlogCategory)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-colors",
              "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selectedCategory === category.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {selectedCategory === category.id && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 