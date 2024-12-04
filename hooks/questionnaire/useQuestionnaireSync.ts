// hooks/questionnaire/useQuestionnaireSync.ts
'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuestionnaireStore } from '@/store/useQuestionnaireStore';
import { useToast } from '@/hooks/use-toast';
import { QuestionnaireData } from '@/types/questionnaire/questionnaire';

export function useQuestionnaireSync() {
  const { data: session } = useSession();
  const { 
    initializeFromCache, 
    status, 
    currentStep,
    updateAnswers,
    isSyncing 
  } = useQuestionnaireStore();
  const { toast } = useToast();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Fonction de synchronisation
  const syncQuestionnaire = useCallback(async () => {
    if (!session?.user?.id || status !== 'draft' || isSyncing) return;

    try {
      // Tentative de récupération depuis l'API
      const response = await fetch('/api/questionnaire/current');
      if (response.ok) {
        const data = await response.json() as QuestionnaireData;
        if (data) {
          // Comparaison des timestamps pour éviter les conflits
          const serverTimestamp = new Date(data.updatedAt || 0);
          const localTimestamp = lastSyncTime || new Date(0);

          if (serverTimestamp > localTimestamp) {
            await initializeFromCache();
            setLastSyncTime(serverTimestamp);
          }
        }
      }
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser vos réponses",
        variant: "destructive",
      });
    }
  }, [session?.user?.id, status, isSyncing, initializeFromCache, lastSyncTime, toast]);

  // Synchronisation initiale
  useEffect(() => {
    if (session?.user?.id && status === 'draft') {
      syncQuestionnaire();
    }
  }, [session?.user?.id, status, syncQuestionnaire]);

  // Synchronisation périodique
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;

    if (session?.user?.id && status === 'draft') {
      syncInterval = setInterval(syncQuestionnaire, 60000); // Toutes les minutes
    }

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [session?.user?.id, status, syncQuestionnaire]);

  // Synchronisation avant navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status === 'draft' && !isSyncing) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status, isSyncing]);

  // Fonction de sauvegarde manuelle
  const saveProgress = useCallback(async (stepData: Partial<QuestionnaireData>) => {
    if (!session?.user?.id) return;

    try {
      await updateAnswers(stepData, currentStep);
      setLastSyncTime(new Date());
      toast({
        title: "Progrès sauvegardé",
        description: "Vos réponses ont été enregistrées avec succès",
      });
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder vos réponses",
        variant: "destructive",
      });
    }
  }, [session?.user?.id, currentStep, updateAnswers, toast]);

  return {
    syncQuestionnaire,
    saveProgress,
    lastSyncTime,
    isSyncing,
  };
}