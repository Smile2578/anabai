// components/dashboard/cards/StatsCard.tsx
import { Card } from "@/components/ui/card";
import { StatsCardProps } from "@/types/dashboard/cards";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
}: StatsCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg",
            "bg-primary/10"
          )}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              trend.value > 0 ? "text-green-500" : "text-red-500"
            )}>
              {trend.value > 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            {value}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}