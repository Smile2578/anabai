// app/admin/page.tsx
import { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard Admin - AnabAI',
  description: "Tableau de bord d'administration AnabAI",
};

export default function AdminPage() {
  return (
    <div>
      <AdminDashboard />
    </div>
  );
}