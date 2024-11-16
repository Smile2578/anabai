// components/admin/dashboard/recent-activity.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, User, FileText } from "lucide-react";

interface RecentActivityProps {
  type?: 'all' | 'places' | 'users';
}

export function RecentActivity({ type = 'all' }: RecentActivityProps) {
  const activities = [
    {
      id: 1,
      type: 'place',
      title: "Nouveau lieu ajouté",
      description: "Restaurant Sakura - Tokyo",
      time: "Il y a 2 heures",
      icon: MapPin,
    },
    {
      id: 2,
      type: 'user',
      title: "Nouvel utilisateur",
      description: "Marie Dupont",
      time: "Il y a 3 heures",
      icon: User,
    },
    {
      id: 3,
      type: 'article',
      title: "Article publié",
      description: "Guide des meilleurs restos de Kyoto",
      time: "Il y a 5 heures",
      icon: FileText,
    },
    // Ajoutez plus d'activités ici
  ].filter(activity => type === 'all' || activity.type === type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
        <CardDescription>Dernières actions effectuées sur la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <activity.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
