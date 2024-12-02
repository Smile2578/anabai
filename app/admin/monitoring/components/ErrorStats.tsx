'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, XCircle, AlertOctagon, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ErrorStats {
  totalErrors: number;
  errorRate: number;
  errorsByQueue: Record<string, number>;
  errorsByType: Record<string, number>;
  recentErrors: Array<{
    id: string;
    queueName: string;
    error: string;
    timestamp: string;
  }>;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export function ErrorStats() {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/monitoring/errors');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching error stats:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les statistiques d\'erreurs',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [toast]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Statistiques d&apos;erreurs</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total des erreurs */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <h4 className="font-medium">Total des erreurs</h4>
          </div>
          <div className="text-2xl font-bold">{stats.totalErrors}</div>
          <div className="text-sm text-muted-foreground">
            Taux d&apos;erreur: {(stats.errorRate * 100).toFixed(2)}%
          </div>
        </Card>

        {/* Tendances */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium">Tendances</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aujourd&apos;hui</span>
              <span>{stats.trends?.daily ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cette semaine</span>
              <span>{stats.trends?.weekly ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ce mois</span>
              <span>{stats.trends?.monthly ?? 0}</span>
            </div>
          </div>
        </Card>

        {/* Distribution par queue */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium">Distribution</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(stats.errorsByQueue ?? {}).map(([queue, count]) => (
              <div key={queue} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{queue}</span>
                  <span>{count}</span>
                </div>
                <Progress 
                  value={(count / (stats.totalErrors || 1)) * 100} 
                  className="h-1"
                />
              </div>
            ))}
            {(!stats.errorsByQueue || Object.keys(stats.errorsByQueue).length === 0) && (
              <div className="text-center text-muted-foreground">
                Aucune erreur par queue
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Erreurs récentes */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h4 className="font-medium">Erreurs récentes</h4>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Erreur</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(stats.recentErrors ?? []).map((error) => (
                <TableRow key={error.id}>
                  <TableCell className="capitalize">{error.queueName}</TableCell>
                  <TableCell className="font-mono text-sm text-red-500">
                    {error.error}
                  </TableCell>
                  <TableCell>
                    {format(new Date(error.timestamp), 'Pp', { locale: fr })}
                  </TableCell>
                </TableRow>
              ))}
              {(!stats.recentErrors || stats.recentErrors.length === 0) && (
                <TableRow>
                  <TableCell 
                    colSpan={3} 
                    className="text-center text-muted-foreground"
                  >
                    Aucune erreur récente
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 