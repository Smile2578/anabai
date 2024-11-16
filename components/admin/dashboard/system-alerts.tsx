// components/admin/dashboard/system-alerts.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export function SystemAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'error',
      title: "Mise à jour requise",
      description: "Les informations du lieu \"Tokyo Tower\" nécessitent une mise à jour",
      time: "Il y a 1 jour",
      icon: AlertTriangle,
      severity: "high",
    },
    {
      id: 2,
      type: 'warning',
      title: "Performance dégradée",
      description: "Temps de réponse élevé sur certaines pages",
      time: "Il y a 3 heures",
      icon: AlertCircle,
      severity: "medium",
    },
    {
      id: 3,
      type: 'info',
      title: "Maintenance prévue",
      description: "Une maintenance est prévue demain à 3h du matin",
      time: "Il y a 5 heures",
      icon: Info,
      severity: "low",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes Système</CardTitle>
        <CardDescription>Notifications importantes nécessitant votre attention</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-4">
                <div className={`p-2 rounded-full bg-${alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'orange-500' : 'blue-500'}/10`}>
                  <alert.icon className={`w-4 h-4 text-${alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'orange-500' : 'blue-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant={getSeverityColor(alert.severity) as "destructive" | "secondary" | "default" | "outline"}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}