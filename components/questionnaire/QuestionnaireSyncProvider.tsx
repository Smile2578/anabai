// components/questionnaire/QuestionnaireSyncProvider.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuestionnaireStore } from '@/store/useQuestionnaireStore';
import { useToast } from '@/hooks/use-toast';

interface QuestionnaireSyncProviderProps {
  children: React.ReactNode;
}

export function QuestionnaireSyncProvider({ 
  children 
}: QuestionnaireSyncProviderProps): JSX.Element {
  const { data: session } = useSession();
  const { 
    initializeFromCache, 
    status, 
    isSyncing,
    answers,
    currentStep
  } = useQuestionnaireStore();
  const { toast } = useToast();

  // Initialisation des données du questionnaire au chargement
  useEffect(() => {
    async function syncQuestionnaire() {
      if (session?.user?.id) {
        try {
          console.log('Tentative de synchronisation...');
          const response = await fetch('/api/questionnaire/current');
          const { success, data } = await response.json();
          
          if (success && data) {
            console.log('Données récupérées:', data);
            await initializeFromCache();
            toast({
              title: "Synchronisation réussie",
              description: "Vos réponses précédentes ont été restaurées",
            });
          }
        } catch (error) {
          console.error('Erreur de synchronisation initiale:', error);
          toast({
            title: "Erreur de synchronisation",
            description: "Impossible de récupérer vos réponses précédentes. Veuillez rafraîchir la page.",
            variant: "destructive",
          });
        }
      }
    }

    syncQuestionnaire();
  }, [session?.user?.id, initializeFromCache, toast]);

  // Sauvegarde automatique des réponses toutes les 30 secondes
  useEffect(() => {
    let syncInterval: NodeJS.Timeout;

    if (session?.user?.id && status === 'draft' && !isSyncing && Object.keys(answers).length > 0) {
      syncInterval = setInterval(async () => {
        try {
          // Préparer les données avec les dates converties
          const processedData = {
            ...answers,
            basicInfo: answers.basicInfo ? {
              ...answers.basicInfo,
              dateRange: answers.basicInfo.dateRange ? {
                from: new Date(answers.basicInfo.dateRange.from),
                to: new Date(answers.basicInfo.dateRange.to)
              } : undefined
            } : undefined,
            createdAt: answers.createdAt ? new Date(answers.createdAt) : new Date(),
            updatedAt: new Date()
          };

          const response = await fetch('/api/questionnaire/current', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(processedData),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la sauvegarde automatique');
          }

          const { data } = await response.json();
          console.log('Sauvegarde automatique réussie:', data);
        } catch (error) {
          console.error('Erreur de sauvegarde automatique:', error);
          toast({
            title: "Erreur de sauvegarde",
            description: "Impossible de sauvegarder automatiquement vos réponses. Vos données seront conservées localement.",
            variant: "destructive",
          });
        }
      }, 30000);
    }

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [session?.user?.id, status, isSyncing, answers, toast, currentStep]);

  return <>{children}</>;
}