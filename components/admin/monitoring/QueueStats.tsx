import { QueueMetrics } from '@/types/queue';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface QueueStatsProps {
  queueName: string;
  metrics: QueueMetrics;
  isLoading: boolean;
}

export function QueueStats({ queueName, metrics, isLoading }: QueueStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const totalJobs = metrics.waiting + metrics.active + metrics.completed + metrics.failed;
  const successRate = totalJobs > 0 ? (metrics.completed / totalJobs) * 100 : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold capitalize">{queueName}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <div className="text-sm">
            <p className="text-muted-foreground">Actifs</p>
            <p className="font-medium">{metrics.active}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" />
          <div className="text-sm">
            <p className="text-muted-foreground">En attente</p>
            <p className="font-medium">{metrics.waiting}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <div className="text-sm">
            <p className="text-muted-foreground">Complétés</p>
            <p className="font-medium">{metrics.completed}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <div className="text-sm">
            <p className="text-muted-foreground">Échoués</p>
            <p className="font-medium">{metrics.failed}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taux de succès</span>
          <span className="font-medium">{successRate.toFixed(1)}%</span>
        </div>
        <Progress value={successRate} className="h-2" />
      </div>

      <div className="text-sm">
        <p className="text-muted-foreground">Latence moyenne</p>
        <p className="font-medium">{metrics.latency.toFixed(2)}ms</p>
      </div>
    </div>
  );
} 