// app/admin/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AdminDashboard from '@/components/admin/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard Admin - AnabAI',
  description: "Tableau de bord d'administration AnabAI",
};

const Loading = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-6 w-16" />
        </Card>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <Skeleton className="h-[300px]" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-[300px]" />
      </Card>
    </div>
  </div>
);

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminDashboard />
    </Suspense>
  );
}