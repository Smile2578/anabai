// app/admin/users/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import UsersManagement from '@/components/admin/users/UsersManagement';
import { UsersTableSkeleton } from '@/components/admin/users/users-table-skeleton';

export const metadata: Metadata = {
  title: 'Gestion des Utilisateurs - AnabAI Admin',
  description: 'Gérez les utilisateurs de la plateforme AnabAI',
};

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <UsersManagement />
    </Suspense>
  );
}