'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { columns } from './columns';
import { useBlogPosts } from '@/hooks/blog/useBlogPosts';

export default function BlogPostsPage() {
  const router = useRouter();
  const { data: posts, isLoading } = useBlogPosts();
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Articles du Blog</h1>
        <Button onClick={() => router.push('/admin/blog/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Article
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={posts || []}
        loading={isLoading}
        onSelectedRowsChange={setSelectedPosts}
      />
    </div>
  );
} 