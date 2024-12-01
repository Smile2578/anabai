'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, MemoryStick, Network, Clock } from 'lucide-react';

interface RedisInfo {
  memory: {
    used: number;
    peak: number;
    fragmentation: number;
  };
  clients: {
    connected: number;
    blocked: number;
    maxClients: number;
  };
  stats: {
    totalConnections: number;
    totalCommands: number;
    opsPerSecond: number;
    hitRate: number;
  };
  server: {
    version: string;
    uptime: number;
  };
}

export function RedisStats() {
  const [info, setInfo] = useState<RedisInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch('/api/admin/monitoring/redis');
        const data = await response.json();
        console.log('Données Redis reçues:', data);
        
        if (data && data.memory && data.clients && data.stats && data.server) {
          setInfo(data);
        } else {
          throw new Error('Format de données incorrect');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des informations Redis:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les informations Redis',
          variant: 'destructive',
        });
        setInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 5000);
    return () => clearInterval(interval);
  }, [toast]);

  if (isLoading || !info || !info.memory || !info.clients || !info.stats || !info.server) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Statistiques Redis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mémoire */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium">Mémoire</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilisée</span>
              <span>{info?.memory ? formatBytes(info.memory.used) : '0 B'}</span>
            </div>
            <Progress 
              value={info?.memory ? (info.memory.used / info.memory.peak) * 100 : 0} 
              className="h-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pic</span>
              <span>{formatBytes(info.memory.peak)}</span>
            </div>
          </div>
        </Card>

        {/* Clients */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-green-500" />
            <h4 className="font-medium">Clients</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connectés</span>
              <span>{info.clients.connected}</span>
            </div>
            <Progress 
              value={(info.clients.connected / info.clients.maxClients) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bloqués</span>
              <span>{info.clients.blocked}</span>
            </div>
          </div>
        </Card>

        {/* Performances */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-500" />
            <h4 className="font-medium">Performances</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Opérations/sec</span>
              <span>{info.stats.opsPerSecond}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taux de succès cache</span>
              <span>{(info.stats.hitRate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={info.stats.hitRate * 100} className="h-2" />
          </div>
        </Card>

        {/* Serveur */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h4 className="font-medium">Serveur</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span>{info.server.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span>{formatUptime(info.server.uptime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connexions totales</span>
              <span>{info.stats.totalConnections}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 