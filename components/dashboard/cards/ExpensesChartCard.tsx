// components/dashboard/cards/ExpensesChartCard.tsx
'use client';

import { DashboardCard } from "../shared/DashboardCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';
import type { ExpenseData } from './RechartsWrapper';

const RechartsComponent = dynamic<{ data: ExpenseData[] }>(() => import('./RechartsWrapper'), { 
  ssr: false 
});

interface ExpensesChartCardProps {
  data: ExpenseData[];
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
}

export function ExpensesChartCard({
  data,
  totalBudget,
  spentAmount,
  remainingAmount
}: ExpensesChartCardProps) {
  return (
    <DashboardCard
      title="Suivi des dépenses"
      description="Analyse de vos dépenses par rapport au budget prévu"
    >
      <div className="space-y-6">
        {/* Résumé des dépenses */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Budget total</p>
            <p className="text-2xl font-bold text-primary">
              {totalBudget.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Dépensé</p>
            <p className="text-2xl font-bold text-secondary">
              {spentAmount.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Restant</p>
            <p className="text-2xl font-bold">
              {remainingAmount.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center justify-between">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute la période</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Exporter
          </Button>
        </div>

        {/* Graphique */}
        <div className="h-[300px] w-full">
          <RechartsComponent data={data} />
        </div>
      </div>
    </DashboardCard>
  );
}