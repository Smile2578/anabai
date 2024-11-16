// components/admin/dashboard/places-distribution.tsx
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
  } from "recharts";
  import { Props as LegendProps } from 'recharts/types/component/Legend';
  
  interface PlaceTypeData {
    name: string;
    value: number;
    color: string;
  }
  
  interface PlacesDistributionProps {
    data: PlaceTypeData[];
  }
  
  
  export function PlacesDistribution({ data }: PlacesDistributionProps) {
    const CustomTooltip = ({
      active,
      payload,
    }: {
      active?: boolean;
      payload?: Array<{
        payload: PlaceTypeData;
      }>;
    }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-background border rounded-lg shadow-lg p-3">
            <p className="font-medium">{data.name}</p>
            <p className="text-muted-foreground">
              {data.value} lieux ({((data.value / totalPlaces) * 100).toFixed(1)}%)
            </p>
          </div>
        );
      }
      return null;
    };
  
    const totalPlaces = data.reduce((sum, item) => sum + item.value, 0);
  
    const renderLegend = (props: LegendProps) => {
      const { payload } = props;
      if (!payload) return null;
      
      return (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {payload.map((entry, index: number) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || '#000' }}
              />
              <span className="text-sm">
                {entry.value} ({((data[index].value / totalPlaces) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      );
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribution des Lieux</CardTitle>
          <CardDescription>Répartition par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="stroke-background hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={(props) => renderLegend(props as LegendProps)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }