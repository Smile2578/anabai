// components/dashboard/cards/ReservationsCard.tsx
import { Button } from "@/components/ui/button";
import { DashboardCard } from "../shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hotel, Map, Plane } from "lucide-react";

interface Reservation {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  name: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  price?: number;
}

interface ReservationsCardProps {
  reservations: Reservation[];
}

export function ReservationsCard({ reservations }: ReservationsCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Hotel;
      case 'activity':
        return Map;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return '';
    }
  };

  return (
    <DashboardCard
      title="Réservations"
      description="Suivi de vos réservations"
    >
      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Aucune réservation pour le moment
            </p>
            <Button className="mt-4" variant="outline">
              Commencer les réservations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const Icon = getIcon(reservation.type);
              return (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{reservation.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reservation.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {reservation.price && (
                      <p className="text-sm font-medium">
                        {reservation.price.toLocaleString('fr-FR')} €
                      </p>
                    )}
                    <Badge
                      variant="secondary"
                      className={getStatusColor(reservation.status)}
                    >
                      {reservation.status === 'confirmed' && 'Confirmé'}
                      {reservation.status === 'pending' && 'En attente'}
                      {reservation.status === 'cancelled' && 'Annulé'}
                    </Badge>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
              <Button size="sm">
                Nouvelle réservation
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}