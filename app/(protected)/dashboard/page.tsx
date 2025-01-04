'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PreferencesCard } from "@/components/dashboard/cards/PreferencesCard";
import { PlanningCard } from "@/components/dashboard/cards/PlanningCard";
import { TimelineCard } from "@/components/dashboard/cards/TimelineCard";
import { ReservationsCard } from "@/components/dashboard/cards/ReservationsCard";
import { StatsCard } from "@/components/dashboard/cards/StatsCard";
import { ExpensesChartCard } from "@/components/dashboard/cards/ExpensesChartCard";
import { Calendar, Users, Wallet } from "lucide-react";
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { DashboardService } from '@/lib/services/dashboard/dashboardService';
import { DashboardStats, TimelineEvent, Reservation, ExpenseData, TripPlanning } from '@/types/dashboard/stats';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Créer le client Supabase et le service une seule fois
const supabase = createClient();
const dashboardService = new DashboardService(supabase);

// Mock data temporaire pour les fonctionnalités non encore implémentées
const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'flight',
    title: 'Vol Paris - Tokyo',
    time: '10:30',
    location: 'Aéroport Charles de Gaulle',
    status: 'upcoming',
    details: 'Terminal 2E, Vol JL416'
  },
  {
    id: '2',
    type: 'transport',
    title: 'Narita Express',
    time: '14:00',
    location: 'Aéroport de Narita',
    status: 'upcoming'
  }
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    type: 'hotel',
    name: 'Hotel Granvia Kyoto',
    date: '2024-05-01',
    status: 'confirmed',
    price: 250
  },
  {
    id: '2',
    type: 'activity',
    name: 'Visite guidée de Fushimi Inari',
    date: '2024-05-03',
    status: 'pending',
    price: 45
  }
];

const mockExpensesData: ExpenseData[] = [
  { date: '2024-05-01', budget: 1000, actual: 950 },
  { date: '2024-05-02', budget: 2000, actual: 1800 },
  { date: '2024-05-03', budget: 3000, actual: 3200 },
  { date: '2024-05-04', budget: 4000, actual: 3900 }
];

const translateGroupType = (type: string): string => {
  const translations: Record<string, string> = {
    'solo': '🧑 Solo',
    'couple': '💑 Couple',
    'family': '👨‍👩‍👧‍👦 Famille',
    'friends': '👥 Amis',
    'business': '💼 Professionnel'
  };
  return translations[type] || type;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trip, setTrip] = useState<TripPlanning | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/auth/signin');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        const stats = await dashboardService.getDashboardStats();
        if (stats) {
          setStats(stats);
          // Créer un trip basé sur les stats
          setTrip({
            id: '1',
            status: 'in_progress',
            progress: 35,
            nextStep: 'Validation du programme',
            destinations: ['Tokyo', 'Kyoto', 'Osaka'] // À remplacer par les vraies destinations
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }

    loadDashboardData();
  }, [user]);

  const formatDateRange = (start: Date, end: Date) => {
    return `${format(start, 'd MMMM', { locale: fr })} - ${format(end, 'd MMMM yyyy', { locale: fr })}`;
  };

  if (loading || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Votre voyage au Japon</h1>
        <p className="text-muted-foreground">
          {formatDateRange(stats.duration.startDate, stats.duration.endDate)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Budget voyage"
          value={`${stats.budget.total.toLocaleString()} €`}
          description={stats.budget.dailyLimit ? `Environ ${stats.budget.dailyLimit.toLocaleString()} € par jour` : "Budget total prévu"}
          icon={Wallet}
          trend={stats.budget.spent ? {
            value: ((stats.budget.spent - stats.budget.total) / stats.budget.total) * 100,
            label: "vs. budget initial"
          } : undefined}
        />
        <StatsCard
          title="Durée"
          value={`${stats.duration.days} jours`}
          description={`${format(stats.duration.startDate, 'PP', { locale: fr })}`}
          icon={Calendar}
        />
        <StatsCard
          title="Voyageurs"
          value={translateGroupType(stats.preferences.groupType)}
          description={`${stats.preferences.groupSize} ${stats.preferences.groupSize > 1 ? 'personnes' : 'personne'}`}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PreferencesCard 
          preferences={{
            travelStyle: {
              pace: stats.preferences.pace,
              comfort: stats.preferences.comfort,
              flexibility: 70,
              culturalImmersion: 85
            },
            interests: {
              mainInterests: stats.preferences.interests,
              subcategories: []
            }
          }}
          onEdit={() => router.push('/questionnaire')}
        />
        {trip && (
          <PlanningCard 
            trip={trip}
            status={trip.status}
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpensesChartCard
          data={mockExpensesData}
          totalBudget={stats.budget.total}
          spentAmount={stats.budget.spent || 0}
          remainingAmount={stats.budget.remaining || stats.budget.total}
        />
        <TimelineCard
          events={mockTimelineEvents}
          currentDate={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <ReservationsCard 
          reservations={mockReservations}
        />
      </div>
    </div>
  );
}