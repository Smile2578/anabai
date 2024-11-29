'use client';

import { useSearch } from '@/hooks/blog/useSearch';
import { PostCard } from './PostCard';
import { SearchAndFilter } from './SearchAndFilter';
import { Pagination } from './Pagination';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

interface BlogSearchProps {
  initialTags: string[];
}

export function BlogSearch({ initialTags }: BlogSearchProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    posts,
    loading,
    error,
    pagination,
    search,
    setPage,
  } = useSearch();

  // Effectuer la recherche lorsque les tags ou la requête changent
  useEffect(() => {
    search(searchQuery);
  }, [search, searchQuery, selectedTags]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => [...prev, tag]);
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className="space-y-8">
      <SearchAndFilter
        tags={initialTags}
        selectedTags={selectedTags}
        onSearch={handleSearch}
        onTagSelect={handleTagSelect}
        onTagRemove={handleTagRemove}
      />

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            onClick={() => setPage(1)}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">Aucun article trouvé</p>
              </div>
            )}
          </div>

          {posts.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
} 