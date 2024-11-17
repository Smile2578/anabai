// components/admin/places/PlaceStats.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle, Archive } from 'lucide-react';

interface StatsData {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

interface PlaceStatsProps {
  stats: StatsData;
}

export function PlaceStats({ stats }: PlaceStatsProps) {
  const statItems = [
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
      color: 'text-semantic-success',
      bgColor: 'bg-semantic-success/10',
    },
    {
      label: 'Brouillons',
      value: stats.draft,
      icon: Clock,
      color: 'text-semantic-warning',
      bgColor: 'bg-semantic-warning/10',
    },
    {
      label: 'Archivés',
      value: stats.archived,
      icon: Archive,
      color: 'text-semantic-error',
      bgColor: 'bg-semantic-error/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}