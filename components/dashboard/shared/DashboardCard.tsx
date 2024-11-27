// components/dashboard/shared/DashboardCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCardProps } from "@/types/dashboard/cards";
import { cn } from "@/lib/utils";

export function DashboardCard({
  title,
  description,
  className,
  children
}: DashboardCardProps) {
  return (
    <Card className={cn("hover:border-primary/50 transition-colors duration-300", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}