// components/dashboard/cards/TimelineCard.tsx
import { DashboardCard } from "../shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Train, 
  Camera,
  Utensils
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'transport' | 'food';
  title: string;
  time: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  details?: string;
}

interface TimelineCardProps {
  events: TimelineEvent[];
  currentDate: string;
}

export function TimelineCard({ events, currentDate }: TimelineCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Hotel;
      case 'activity':
        return Camera;
      case 'transport':
        return Train;
      case 'food':
        return Utensils;
      default:
        return MapPin;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'ongoing':
        return 'bg-primary/10 text-primary';
      case 'upcoming':
        return 'bg-secondary/10 text-secondary';
      default:
        return '';
    }
  };

  return (
    <DashboardCard
      title="Timeline du voyage"
      description={`Programme du ${new Date(currentDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`}
    >
      <div className="relative space-y-4">
        {/* Ligne verticale */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        {events.map((event, index) => {
          const Icon = getIcon(event.type);
          return (
            <div
              key={event.id}
              className={cn(
                "relative flex items-start gap-4 pl-14",
                index !== events.length - 1 && "pb-4"
              )}
            >
              {/* Point sur la timeline */}
              <div
                className={cn(
                  "absolute left-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background",
                  getStatusColor(event.status)
                )}
              />
              
              <div className="flex flex-col flex-1 gap-2 min-h-[4rem]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{event.title}</h4>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {event.time}
                  </time>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {event.location}
                  </span>
                </div>

                {event.details && (
                  <p className="text-sm text-muted-foreground">
                    {event.details}
                  </p>
                )}

                <Badge 
                  variant="secondary" 
                  className={cn(
                    "w-fit",
                    getStatusColor(event.status)
                  )}
                >
                  {event.status === 'completed' && 'Terminé'}
                  {event.status === 'ongoing' && 'En cours'}
                  {event.status === 'upcoming' && 'À venir'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}