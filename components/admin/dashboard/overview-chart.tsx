// components/admin/dashboard/overview-chart.tsx
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  interface ActivityData {
    date: string;
    users: number;
    places: number;
  }
  
  interface OverviewChartProps {
    data: ActivityData[];
  }
  
  export function OverviewChart({ data }: OverviewChartProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité du Site</CardTitle>
          <CardDescription>Aperçu de l&apos;activité sur les 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-sm"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  name="Utilisateurs"
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  name="Lieux"
                  type="monotone"
                  dataKey="places"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }