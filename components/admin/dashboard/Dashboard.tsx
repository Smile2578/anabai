// components/admin/dashboard/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from './stats-cards';
import { OverviewChart } from './overview-chart';
import { RecentActivity } from './recent-activity';
import { SystemAlerts } from './system-alerts';
import { PlacesDistribution } from './places-distribution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Types
interface DashboardStats {
  users: number;
  places: number;
  trips: number;
  articles: number;
}

interface ActivityData {
  users: number;
  places: number;
  date: string;
}

interface PlaceTypeData {
  name: string;
  value: number;
  color: string;
}

const defaultStats: DashboardStats = {
  users: 0,
  places: 0,
  trips: 0,
  articles: 0,
};

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [selectedView, setSelectedView] = useState('overview');

  // Simuler le chargement des données
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simule un appel API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setStats({
          users: 1234,
          places: 567,
          trips: 89,
          articles: 34
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Données simulées pour les graphiques
  const activityData: ActivityData[] = [
    { date: 'Lun', users: 120, places: 15 },
    { date: 'Mar', users: 150, places: 20 },
    { date: 'Mer', users: 180, places: 18 },
    { date: 'Jeu', users: 160, places: 22 },
    { date: 'Ven', users: 200, places: 25 },
    { date: 'Sam', users: 250, places: 30 },
    { date: 'Dim', users: 280, places: 28 },
  ];

  const placeTypeData: PlaceTypeData[] = [
    { name: 'Restaurants', value: 35, color: 'hsl(var(--chart-1))' },
    { name: 'Temples', value: 25, color: 'hsl(var(--chart-2))' },
    { name: 'Shopping', value: 20, color: 'hsl(var(--chart-3))' },
    { name: 'Parcs', value: 15, color: 'hsl(var(--chart-4))' },
    { name: 'Musées', value: 5, color: 'hsl(var(--chart-5))' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      <StatsCards stats={stats} />

      <Tabs defaultValue={selectedView} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => setSelectedView('overview')}>
            Vue générale
          </TabsTrigger>
          <TabsTrigger value="activity" onClick={() => setSelectedView('activity')}>
            Activité
          </TabsTrigger>
          <TabsTrigger value="places" onClick={() => setSelectedView('places')}>
            Lieux
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <OverviewChart data={activityData} />
            <PlacesDistribution data={placeTypeData} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RecentActivity />
            <SystemAlerts />
          </div>
        </TabsContent>

        <TabsContent value="places" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PlacesDistribution data={placeTypeData} />
            <RecentActivity type="places" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}