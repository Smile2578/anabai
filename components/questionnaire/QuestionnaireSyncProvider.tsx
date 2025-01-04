// components/questionnaire/QuestionnaireSyncProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { QuestionnaireService } from '@/lib/services/questionnaire/questionnaireService';
import { QuestionnaireData } from '@/types/questionnaire/questionnaire';
import { useQuestionnaireStore } from '@/store/useQuestionnaireStore';

type QuestionnaireSyncContextType = {
  isLoading: boolean;
  error: Error | null;
  questionnaire: QuestionnaireData | null;
  refreshQuestionnaire: () => Promise<void>;
};

const QuestionnaireSyncContext = createContext<QuestionnaireSyncContextType>({
  isLoading: false,
  error: null,
  questionnaire: null,
  refreshQuestionnaire: async () => {},
});

export const useQuestionnaireSync = () => {
  const context = useContext(QuestionnaireSyncContext);
  if (!context) {
    throw new Error('useQuestionnaireSync doit être utilisé dans un QuestionnaireSyncProvider');
  }
  return context;
};

export function QuestionnaireSyncProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const { updateAnswers } = useQuestionnaireStore();

  const refreshQuestionnaire = useCallback(async () => {
    try {
      const questionnaireService = new QuestionnaireService(supabase);
      setError(null);
      setIsLoading(true);
      const questionnaire = await questionnaireService.getLatestQuestionnaire();
      setQuestionnaire(questionnaire);
      if (questionnaire) {
        await updateAnswers(questionnaire, 1);
      }
    } catch (err) {
      console.error('❌ [QuestionnaireSyncProvider] Erreur:', err);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, updateAnswers]);

  useEffect(() => {
    refreshQuestionnaire();
  }, [refreshQuestionnaire]);

  return (
    <QuestionnaireSyncContext.Provider
      value={{
        isLoading,
        error,
        questionnaire,
        refreshQuestionnaire,
      }}
    >
      {children}
    </QuestionnaireSyncContext.Provider>
  );
}