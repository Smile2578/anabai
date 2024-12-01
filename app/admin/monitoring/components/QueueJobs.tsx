'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Play, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Job {
  id: string;
  queueName: string;
  status: 'active' | 'waiting' | 'completed' | 'failed';
  data: Record<string, unknown>;
  progress: number;
  attemptsMade: number;
  timestamp: string;
  failedReason?: string;
}

export function QueueJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/monitoring/jobs');
      const data = await response.json();
      console.log('Réponse API:', data);
      
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setJobs([]);
        toast({
          title: 'Attention',
          description: 'Format de données incorrect',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les jobs',
        variant: 'destructive',
      });
      console.error('Erreur lors du chargement des jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleRetry = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/monitoring/jobs/${jobId}/retry`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Job relancé avec succès',
        });
        fetchJobs();
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de relancer le job',
        variant: 'destructive',
      });
      console.error('Erreur lors de la relance du job:', err);
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/monitoring/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Job supprimé avec succès',
        });
        fetchJobs();
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le job',
        variant: 'destructive',
      });
      console.error('Erreur lors de la suppression du job:', err);
    }
  };

  const getStatusBadge = (status: Job['status']) => {
    const variants = {
      active: 'bg-blue-500',
      waiting: 'bg-yellow-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
    };

    const labels = {
      active: 'Actif',
      waiting: 'En attente',
      completed: 'Complété',
      failed: 'Échoué',
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Jobs récents</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchJobs}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Tentatives</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono">{job.id}</TableCell>
                <TableCell className="capitalize">{job.queueName}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>{job.attemptsMade}</TableCell>
                <TableCell>
                  {format(new Date(job.timestamp), 'Pp', { locale: fr })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {job.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRetry(job.id)}
                        title="Réessayer"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(job.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun job récent
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 