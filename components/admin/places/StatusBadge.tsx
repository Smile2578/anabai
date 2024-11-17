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
      variant="outline"
      className={cn(
        "capitalize",
        status === 'publié' && "border-semantic-success text-semantic-success hover:bg-semantic-success/10",
        status === 'brouillon' && "border-semantic-warning text-semantic-warning hover:bg-semantic-warning/10", 
        status === 'archivé' && "border-semantic-error text-semantic-error hover:bg-semantic-error/10",
        className
      )}
    >
      {status}
    </Badge>
  );
};