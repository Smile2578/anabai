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
        console.log('🔄 updateAnswers appelé avec:', { step, stepData });
        const { currentStep, answers } = get();
        
        // Mise à jour locale
        const updatedAnswers = { ...answers, ...stepData };
        const updatedSteps = [...get().steps];
        const stepIndex = updatedSteps.findIndex(s => s.step === step);
        
        console.log('État actuel:', {
          currentStep,
          answers,
          steps: get().steps
        });

        if (stepIndex >= 0) {
          updatedSteps[stepIndex] = {
            step,
            isCompleted: true,
            data: stepData
          };
        } else {
          updatedSteps.push({
            step,
            isCompleted: true,
            data: stepData
          });
        }

        console.log('Mise à jour du state avec:', {
          updatedAnswers,
          updatedSteps
        });

        set({
          answers: updatedAnswers,
          lastSavedStep: currentStep,
          steps: updatedSteps,
          isSyncing: true
        });

        try {
          // Préparer les données avec les dates converties
          const processedData = {
            ...updatedAnswers,
            basicInfo: updatedAnswers.basicInfo ? {
              ...updatedAnswers.basicInfo,
              dateRange: updatedAnswers.basicInfo.dateRange ? {
                from: new Date(updatedAnswers.basicInfo.dateRange.from),
                to: new Date(updatedAnswers.basicInfo.dateRange.to)
              } : undefined
            } : undefined,
            createdAt: updatedAnswers.createdAt ? new Date(updatedAnswers.createdAt) : new Date(),
            updatedAt: new Date()
          };

          console.log('📤 Envoi des données à l\'API:', processedData);

          const response = await fetch('/api/questionnaire/current', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(processedData),
          });

          const responseData = await response.json();
          console.log('📥 Réponse de l\'API:', responseData);

          if (!response.ok) {
            throw new Error(responseData.error || 'Erreur lors de la sauvegarde');
          }

          if (responseData.success && responseData.data) {
            console.log('✅ Mise à jour du state avec les données de l\'API');
            set({
              answers: responseData.data,
              isSyncing: false
            });
          } else {
            throw new Error('Données invalides retournées par l\'API');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la sauvegarde:', error);
          set({ isSyncing: false });
          toast({
            title: "Erreur de sauvegarde",
            description: error instanceof Error ? error.message : "Impossible de sauvegarder vos réponses",
            variant: "destructive",
          });
        }
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
          
          // Calculer le budget total en fonction des contraintes
          const budget = {
            total: store.answers?.constraints?.travelBudget === 'higher' ? 4000 :
                   store.answers?.constraints?.travelBudget === 'high' ? 2500 :
                   store.answers?.constraints?.travelBudget === 'medium' ? 1500 : 1000,
            dailyLimit: store.answers?.constraints?.dailyBudget === 'higher' ? 400 :
                        store.answers?.constraints?.dailyBudget === 'high' ? 300 :
                        store.answers?.constraints?.dailyBudget === 'medium' ? 200 : 100,
            priority: store.answers?.constraints?.budgetPriority || 'undecided'
          };

          // Préparer les données avec les dates converties et les préférences par défaut
          const dataToSubmit = {
            ...store.answers,
            budget,
            status: 'completed' as const
          };

          const response = await fetch('/api/questionnaire/submit', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Erreur lors de la soumission');
          }

          set({ status: 'completed' });
          toast({
            title: "Questionnaire soumis",
            description: result.message || "Vos réponses ont été enregistrées avec succès",
          });
        } catch (error) {
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