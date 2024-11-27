'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface ExpenseData {
  date: string;
  budget: number;
  actual: number;
}

interface RechartsWrapperProps {
  data: ExpenseData[];
}

export default function RechartsWrapper({ data }: RechartsWrapperProps) {
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}€`}
        />
        <Tooltip 
          formatter={(value) => [`${value}€`]}
          labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        />
        <Area
          type="monotone"
          dataKey="budget"
          stroke="#4A3AFF"
          fill="#4A3AFF20"
          name="Budget prévu"
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#FF3A8C"
          fill="#FF3A8C20"
          name="Dépenses réelles"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
} 