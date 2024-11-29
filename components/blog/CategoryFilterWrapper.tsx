'use client';

import { CategoryFilter, type BlogCategory } from './CategoryFilter';
import { useRouter, useSearchParams } from 'next/navigation';

export function CategoryFilterWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as BlogCategory) || 'all';

  const handleCategoryChange = (category: BlogCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }

    // Reset page when changing category
    params.delete('page');

    router.push(`/blog?${params.toString()}`);
  };

  return (
    <CategoryFilter 
      onCategoryChange={handleCategoryChange}
      initialCategory={initialCategory}
    />
  );
} 