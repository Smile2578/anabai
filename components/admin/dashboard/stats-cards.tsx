// components/admin/dashboard/stats-cards.tsx
import { motion } from "framer-motion";
import { Users, MapPin, Briefcase, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    users: number;
    places: number;
    trips: number;
    articles: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      title: "Utilisateurs",
      value: stats.users,
      icon: Users,
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Lieux",
      value: stats.places,
      icon: MapPin,
      color: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      title: "Voyages",
      value: stats.trips,
      icon: Briefcase,
      color: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      title: "Articles",
      value: stats.articles,
      icon: FileText,
      color: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${item.color}`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <h3 className="text-2xl font-bold">
                    {item.value.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}