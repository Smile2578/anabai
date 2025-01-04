'use client';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ExpenseData {
  date: string;
  budget: number;
  actual: number;
}

interface RechartsWrapperProps {
  data: ExpenseData[];
}

export default function RechartsWrapper({ data }: RechartsWrapperProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM', { locale: fr });
  };

  const formatValue = (value: number) => {
    return `${value.toLocaleString('fr-FR')} €`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          tickFormatter={formatValue}
          tick={{ fontSize: 12 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
          labelFormatter={formatDate}
          formatter={(value: number) => [formatValue(value)]}
        />
        <Area
          type="monotone"
          dataKey="budget"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorBudget)"
          name="Budget prévu"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--secondary))"
          fillOpacity={1}
          fill="url(#colorActual)"
          name="Dépenses réelles"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
} 