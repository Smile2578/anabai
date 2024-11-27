'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PreferencesCard } from "@/components/dashboard/cards/PreferencesCard";
import { PlanningCard } from "@/components/dashboard/cards/PlanningCard";
import { TimelineCard } from "@/components/dashboard/cards/TimelineCard";
import { ReservationsCard } from "@/components/dashboard/cards/ReservationsCard";
import { StatsCard } from "@/components/dashboard/cards/StatsCard";
import { ExpensesChartCard } from "@/components/dashboard/cards/ExpensesChartCard";
import { Calendar, MapPin, Wallet } from "lucide-react";
import { UserPreferences, TripPlanning } from "@/types/dashboard/cards";
import { useSession } from "next-auth/react";

// Types
interface TimelineEvent {
  id: string;
  type: 'hotel' | 'activity' | 'flight' | 'transport' | 'food';
  title: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'ongoing';
  details?: string;
}

interface Reservation {
  id: string;
  type: 'hotel' | 'activity' | 'flight';
  name: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
}

// Mock data
const mockPreferences: UserPreferences = {
  basicInfo: {
    startDate: "2024-05-01",
    endDate: "2024-05-15",
    duration: 15,
    groupSize: 2
  },
  travelStyle: {
    pace: "moderate",
    comfort: "standard",
    flexibility: 70,
    culturalImmersion: 85
  },
  interests: {
    mainInterests: ["Culture", "Gastronomie", "Nature"],
    subcategories: ["temples", "restaurants-traditionnels", "parcs-nationaux"]
  },
  budget: {
    total: 5000,
    dailyLimit: 333,
    priority: "experiences"
  }
};

const mockTrip: TripPlanning = {
  id: '1',
  status: 'in_progress',
  progress: 35,
  nextStep: 'Validation du programme',
  destinations: ['Tokyo', 'Kyoto', 'Osaka']
};

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

const mockExpensesData = [
  { date: '2024-05-01', budget: 1000, actual: 950 },
  { date: '2024-05-02', budget: 2000, actual: 1800 },
  { date: '2024-05-03', budget: 3000, actual: 3200 },
  { date: '2024-05-04', budget: 4000, actual: 3900 }
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre espace personnel AnabAI
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Budget total"
          value="5 000 €"
          description="Budget alloué pour le voyage"
          icon={Wallet}
          trend={{ value: -12, label: "vs. budget initial" }}
        />
        <StatsCard
          title="Durée du séjour"
          value="15 jours"
          description="Du 1 au 15 mai 2024"
          icon={Calendar}
        />
        <StatsCard
          title="Villes à visiter"
          value="4"
          description="Tokyo, Kyoto, Osaka, Nara"
          icon={MapPin}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PreferencesCard 
          preferences={mockPreferences}
          onEdit={() => console.log("Edit preferences")}
        />
        <PlanningCard 
          trip={mockTrip}
          status="in_progress"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpensesChartCard
          data={mockExpensesData}
          totalBudget={5000}
          spentAmount={3200}
          remainingAmount={1800}
        />
        <TimelineCard
          events={mockTimelineEvents}
          currentDate="2024-05-01"
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