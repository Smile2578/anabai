// store/useQuestionnaireStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  QuestionnaireData, 
  QuestionnaireStatus,
  QuestionnaireStep
} from '@/types/questionnaire/questionnaire';
import { toast } from '@/hooks/use-toast';

/**
 * Interface définissant la structure du store du questionnaire.
 * Elle contient à la fois l'état et les actions possibles.
 */
interface QuestionnaireStore {
  // État
  currentStep: number;
  status: QuestionnaireStatus;
  answers: Partial<QuestionnaireData>;
  lastSavedStep: number;
  steps: QuestionnaireStep[];
  isSyncing: boolean;
  currentQuestionnaireId: string | null;
  
  // Actions pour la navigation
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Actions pour la gestion des réponses
  updateAnswers: (stepData: Partial<QuestionnaireData>, step: number) => Promise<void>;
  submitQuestionnaire: () => Promise<void>;
  resetQuestionnaire: () => void;
  setStatus: (status: QuestionnaireStatus) => void;
  initializeFromCache: () => Promise<void>;
  
  // Helpers pour la validation
  isStepCompleted: (step: number) => boolean;
  validateAnswers: () => boolean;
  canNavigateToStep: (targetStep: number) => boolean;
  getSavedAnswersForStep: (step: number) => Partial<QuestionnaireData>;
  setCurrentQuestionnaireId: (id: string) => void;
}

/**
 * Store Zustand pour la gestion du questionnaire
 * Utilise le middleware persist pour sauvegarder l'état dans le localStorage
 */
export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      status: 'draft',
      answers: {},
      lastSavedStep: 0,
      steps: [],
      isSyncing: false,
      currentQuestionnaireId: null,
      
      setCurrentStep: (step) => {
        console.log('🚀 setCurrentStep appelé avec step:', step);
        if (get().canNavigateToStep(step)) {
          set({ currentStep: step });
          console.log('✅ Navigation effectuée vers step:', step);
        } else {
          console.log('❌ Navigation impossible vers step:', step);
          toast({
            title: "Navigation impossible",
            description: "Veuillez d'abord compléter les étapes précédentes",
            variant: "destructive",
          });
        }
      },

      goToNextStep: () => {
        const { currentStep, canNavigateToStep } = get();
        const nextStep = currentStep + 1;
        if (canNavigateToStep(nextStep)) {
          set({ currentStep: nextStep });
        }
      },

      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      updateAnswers: async (stepData, step) => {
        const { currentStep, answers } = get();
        
        // Mise à jour locale uniquement
        const updatedAnswers = { ...answers, ...stepData };
        const updatedSteps = [...get().steps];
        const stepIndex = updatedSteps.findIndex(s => s.step === step);
        
        if (stepIndex >= 0) {
          updatedSteps[stepIndex] = { step, isCompleted: true, data: stepData };
        } else {
          updatedSteps.push({ step, isCompleted: true, data: stepData });
        }

        set({
          answers: updatedAnswers,
          lastSavedStep: currentStep,
          steps: updatedSteps
        });
      },
      
      submitQuestionnaire: async () => {
        const store = get();
        if (!store.validateAnswers()) {
          toast({
            title: "Questionnaire incomplet",
            description: "Veuillez remplir toutes les étapes requises",
            variant: "destructive",
          });
          throw new Error('Questionnaire incomplet');
        }

        try {
          set({ status: 'processing' });
          
          // Préparer les données avec les dates converties
          const processedData = {
            ...store.answers,
            basicInfo: store.answers.basicInfo ? {
              ...store.answers.basicInfo,
              dateRange: store.answers.basicInfo.dateRange ? {
                from: new Date(store.answers.basicInfo.dateRange.from),
                to: new Date(store.answers.basicInfo.dateRange.to)
              } : undefined
            } : undefined,
            budget: {
              total: store.answers.constraints?.travelBudget === 'low' ? 1000 : 
                     store.answers.constraints?.travelBudget === 'medium' ? 2000 :
                     store.answers.constraints?.travelBudget === 'high' ? 3000 : 4000,
              dailyLimit: store.answers.constraints?.dailyBudget === 'low' ? 100 :
                         store.answers.constraints?.dailyBudget === 'medium' ? 200 :
                         store.answers.constraints?.dailyBudget === 'high' ? 300 : 400,
              priority: store.answers.constraints?.budgetPriority || 'undecided'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'completed' as const
          };

          console.log("Données traitées:", processedData);

          // Vérifier si un questionnaire existe déjà
          const response = await fetch('/api/questionnaire/current', {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            credentials: 'include',
          });

          if (!response.ok) {
            console.error("Erreur lors de la vérification du questionnaire existant:", await response.text());
            throw new Error('Erreur lors de la vérification du questionnaire existant');
          }

          const result = await response.json();
          console.log("Résultat de la vérification:", result);

          const method = result.data ? 'PATCH' : 'POST';
          const endpoint = result.data ? `/api/questionnaire/submit?id=${result.data.id}` : '/api/questionnaire/submit';

          console.log(`Envoi des données via ${method} à ${endpoint}`);

          const submitResponse = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(processedData),
          });

          if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error(`Erreur ${submitResponse.status} lors de la soumission:`, errorText);
            throw new Error(errorText || 'Erreur lors de la soumission');
          }

          const submitResult = await submitResponse.json();
          console.log("Résultat de la soumission:", submitResult);

          set({ status: 'completed' });
          toast({
            title: "Questionnaire soumis",
            description: submitResult.message || "Vos réponses ont été enregistrées avec succès",
          });
        } catch (error) {
          console.error("Erreur lors de la soumission:", error);
          set({ status: 'error' });
          toast({
            title: "Erreur",
            description: error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission",
            variant: "destructive",
          });
          throw error;
        }
      },

      resetQuestionnaire: () => set({
        currentStep: 1,
        status: 'draft',
        answers: {},
        lastSavedStep: 0,
        steps: [],
        isSyncing: false,
      }),

      setStatus: (status) => set({ status }),
      
      initializeFromCache: async () => {
        console.log('🔄 Initialisation depuis le cache...');
        try {
          set({ isSyncing: true });
          const response = await fetch('/api/questionnaire/current');
          console.log('📥 Réponse initiale:', response.status);
          
          if (response.ok) {
            const { success, data } = await response.json();
            console.log('📦 Données reçues:', { success, data });
            
            if (success && data) {
              // Reconstruction des étapes
              const steps: QuestionnaireStep[] = [];
              if (data.basicInfo) steps.push({ step: 1, isCompleted: true, data: { basicInfo: data.basicInfo } });
              if (data.travelStyle) steps.push({ step: 2, isCompleted: true, data: { travelStyle: data.travelStyle } });
              if (data.interests) steps.push({ step: 3, isCompleted: true, data: { interests: data.interests } });
              if (data.constraints) steps.push({ step: 4, isCompleted: true, data: { constraints: data.constraints } });
              
              console.log('📝 Étapes reconstruites:', steps);

              set({ 
                answers: data,
                status: data.status || 'draft',
                lastSavedStep: Math.max(...steps.map(s => s.step), 0),
                steps,
              });
              console.log('✅ State mis à jour avec succès');
            }
          }
        } catch (error) {
          console.error('❌ Erreur d\'initialisation:', error);
          toast({
            title: "Erreur de synchronisation",
            description: "Impossible de récupérer vos réponses précédentes",
            variant: "destructive",
          });
        } finally {
          set({ isSyncing: false });
        }
      },
      
      isStepCompleted: (step) => {
        const { steps } = get();
        return steps.some(s => s.step === step && s.isCompleted);
      },

      validateAnswers: () => {
        const { answers } = get();
        
        if (!answers.basicInfo?.dateRange?.from || 
            !answers.basicInfo?.dateRange?.to || 
            !answers.basicInfo?.groupType) {
          return false;
        }

        if (!answers.travelStyle?.comfort || 
            typeof answers.travelStyle?.flexibility !== 'number' ||
            typeof answers.travelStyle?.culturalImmersion !== 'number') {
          return false;
        }

        if (!answers.interests?.mainInterests?.length) {
          return false;
        }

        if (answers.constraints?.mobility === undefined || 
            !answers.constraints?.language ||
            !answers.constraints?.travelBudget ||
            !answers.constraints?.dailyBudget) {
          return false;
        }

        return true;
      },

      canNavigateToStep: (targetStep: number) => {
        const store = get();
        if (targetStep < 1 || targetStep > 5) return false;
        if (targetStep === 1) return true;
        
        // On peut toujours revenir en arrière
        if (targetStep <= store.lastSavedStep) return true;
        
        // Pour avancer, il faut avoir complété les étapes précédentes
        for (let step = 1; step < targetStep; step++) {
          if (!store.isStepCompleted(step)) return false;
        }
        
        return true;
      },

      getSavedAnswersForStep: (step: number) => {
        const { steps } = get();
        const savedStep = steps.find(s => s.step === step);
        return savedStep?.data || {};
      },

      setCurrentQuestionnaireId: (id) => set({ currentQuestionnaireId: id }),
    }),
    {
      name: 'questionnaire-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        status: state.status,
        lastSavedStep: state.lastSavedStep,
        steps: state.steps,
      }),
    }
  )
);