// app/trip-planner/layout.tsx
import { ReactNode } from 'react';

interface TripPlannerLayoutProps {
  children: ReactNode;
}

export default function TripPlannerLayout({ children }: TripPlannerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}