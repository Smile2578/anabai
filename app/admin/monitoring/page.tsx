'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueueMetrics } from '@/types/queue';
import { QueueStats } from './components/QueueStats';
import { QueueJobs } from './components/QueueJobs';
import { RedisStats } from './components/RedisStats';
import { ErrorStats } from './components/ErrorStats';
import { useToast } from '@/hooks/use-toast';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<Record<string, QueueMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/monitoring/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error('Erreur lors du chargement des métriques:', err); 
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les métriques',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Rafraîchissement toutes les 5 secondes

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Monitoring</h1>

      <Tabs defaultValue="queues">
        <TabsList>
          <TabsTrigger value="queues">Files d&apos;attente</TabsTrigger>
          <TabsTrigger value="redis">Redis</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
        </TabsList>

        <TabsContent value="queues" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics).map(([queueName, queueMetrics]) => (
              <Card key={queueName} className="p-4">
                <QueueStats
                  queueName={queueName}
                  metrics={queueMetrics}
                  isLoading={isLoading}
                />
              </Card>
            ))}
          </div>
          <Card className="p-4">
            <QueueJobs />
          </Card>
        </TabsContent>

        <TabsContent value="redis">
          <Card className="p-4">
            <RedisStats />
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card className="p-4">
            <ErrorStats />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 