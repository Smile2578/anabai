// components/questionnaire/QuestionnaireSyncProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQuestionnaireStore } from '@/store/useQuestionnaireStore';
import { toast } from 'sonner';
import type { 
  QuestionnaireApiResponse, 
  QuestionnaireProviderData 
} from '@/types/api/questionnaire';
import type {
  BudgetPriority,
  BudgetType,
  Language,
  TravelStyle
} from '@/types/questionnaire/questionnaire';

export const QuestionnaireSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useQuestionnaireStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const response = await fetch('/api/questionnaire');
        const result = await response.json() as QuestionnaireApiResponse;

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors du chargement du questionnaire');
        }

        if (result.data) {
          const data: QuestionnaireProviderData = {
            basicInfo: {
              duration: result.data.duration || 0,
              dateRange: {
                from: new Date(result.data.date_range_from),
                to: new Date(result.data.date_range_to)
              },
              groupSize: result.data.group_size,
              previousVisit: result.data.previous_visit,
              visitCount: result.data.visit_count ?? undefined,
              groupType: result.data.group_type as QuestionnaireProviderData['basicInfo']['groupType'],
              travelType: result.data.travel_type,
              hasChildren: result.data.has_children,
              childrenCount: result.data.children_count ?? undefined
            },
            travelStyle: {
              pace: result.data.pace as TravelStyle['pace'],
              comfort: result.data.comfort as TravelStyle['comfort'],
              flexibility: result.data.flexibility,
              culturalImmersion: result.data.cultural_immersion,
              preferences: result.data.preferences || []
            },
            interests: {
              mainInterests: result.data.main_interests || [],
              specificInterests: result.data.specific_interests || [],
              categories: result.data.categories || [],
              mustSeeSpots: result.data.must_see_spots || []
            },
            budget: {
              total: result.data.total_budget,
              dailyLimit: result.data.daily_limit,
              priority: result.data.budget_priority as BudgetPriority
            },
            constraints: {
              mobility: result.data.mobility,
              language: result.data.language as Language,
              dietary: result.data.dietary || [],
              travelBudget: result.data.travel_budget as BudgetType,
              dailyBudget: result.data.daily_budget as BudgetType,
              budgetPriority: result.data.budget_priority as BudgetPriority
            }
          };

          await store.updateAnswers(data, 1);
        }
      } catch (error) {
        console.error('❌ [QuestionnaireSyncProvider] Erreur:', error);
        toast.error('Erreur lors du chargement du questionnaire');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionnaire();
  }, [store]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return <>{children}</>;
};