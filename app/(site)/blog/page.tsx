// app/blog/page.tsx

'use client';

import { BlogHero } from '@/components/blog/BlogHero';
import { BlogFeatured } from '@/components/blog/BlogFeatured';
import { BlogRecent } from '@/components/blog/BlogRecent';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { useBlogPage } from '@/hooks/blog/useBlogPage';
import { Loader2 } from 'lucide-react';

export default function BlogPage() {
  const {
    featuredPosts,
    recentPosts,
    categories,
    isLoading,
    error,
    selectedCategoryId,
    setSelectedCategoryId
  } = useBlogPage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Une erreur est survenue lors du chargement des articles.</p>
      </div>
    );
  }

  const mainFeaturedPost = featuredPosts[0];
  const otherFeaturedPosts = featuredPosts.slice(1);

  const filteredFeaturedPosts = selectedCategoryId
    ? otherFeaturedPosts.filter(post => post.category_id === selectedCategoryId)
    : otherFeaturedPosts;

  const filteredRecentPosts = selectedCategoryId
    ? recentPosts.filter(post => post.category_id === selectedCategoryId)
    : recentPosts;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section avec l'article principal mis en avant */}
      {mainFeaturedPost && <BlogHero post={mainFeaturedPost} />}

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-8 space-y-12">
            {/* Articles mis en avant */}
            {filteredFeaturedPosts.length > 0 && (
              <BlogFeatured posts={filteredFeaturedPosts} />
            )}

            {/* Articles récents */}
            <BlogRecent posts={filteredRecentPosts} />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <BlogSidebar 
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}  