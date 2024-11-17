// components/admin/places/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'brouillon' | 'publié' | 'archivé';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge 
      className={cn(
        "capitalize",
        status === 'publié' && "bg-semantic-success",
        status === 'brouillon' && "bg-semantic-warning",
        status === 'archivé' && "bg-semantic-error",
        className
      )}
    >
      {status}
    </Badge>
  );
};