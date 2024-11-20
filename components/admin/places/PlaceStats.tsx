// components/admin/places/PlaceStats.tsx
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  Archive,
  Users,
  Star,
  Image
} from 'lucide-react';

interface StatsData {
  total: number;
  published: number;
  draft: number;
  archived: number;
  withImages: number;
  withoutImages: number;
  totalRatings: number;
  averageRating: number;
  byCategory: Record<string, number>;
  byPrefecture: Record<string, number>;
}

interface PlaceStatsProps {
  stats: StatsData;
}

const getSortedTopEntry = (data: Record<string, number>): string => {
  if (!data || Object.keys(data).length === 0) return 'Aucun';
  
  const sorted = Object.entries(data).sort(([,a], [,b]) => b - a);
  return sorted[0]?.[0] || 'Aucun';
};

const getPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export function PlaceStats({ stats }: PlaceStatsProps) {
  const mainStats = [
    {
      label: 'Total des lieux',
      value: stats.total,
      icon: MapPin,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Publiés',
      value: stats.published,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Brouillons',
      value: stats.draft,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Archivés',
      value: stats.archived,
      icon: Archive,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    }
  ];

  const additionalStats = [
    {
      label: 'Photos',
      value: `${stats.withImages} / ${stats.total}`,
      subtext: getPercentage(stats.withImages, stats.total),
      icon: Image,
    },
    {
      label: 'Avis',
      value: stats.totalRatings.toString(),
      subtext: stats.totalRatings > 0 
        ? `${stats.averageRating.toFixed(1)} / 5`
        : 'Aucun avis',
      icon: Star,
    },
    {
      label: 'Catégories',
      value: Object.keys(stats.byCategory || {}).length.toString(),
      subtext: `Plus populaire : ${getSortedTopEntry(stats.byCategory)}`,
      icon: MapPin,
    },
    {
      label: 'Préfectures',
      value: Object.keys(stats.byPrefecture || {}).length.toString(),
      subtext: `Plus de lieux : ${getSortedTopEntry(stats.byPrefecture)}`,
      icon: Users,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Statistiques additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {additionalStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 4) * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.subtext}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}