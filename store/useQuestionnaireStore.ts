// store/useQuestionnaireStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  QuestionnaireData, 
  QuestionnaireStatus 
} from '@/types/questionnaire/questionnaire';

interface QuestionnaireStore {
  currentStep: number;
  status: QuestionnaireStatus;
  answers: Partial<QuestionnaireData>;
  
  // Actions
  setStep: (step: number) => void;
  updateAnswers: (stepData: Partial<QuestionnaireData>) => void;
  submitQuestionnaire: () => Promise<void>;
  resetQuestionnaire: () => void;
  setStatus: (status: QuestionnaireStatus) => void;
  
  // Helpers
  isStepCompleted: (step: number) => boolean;
  validateAnswers: () => boolean;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      status: 'draft',
      answers: {},
      
      setStep: (step) => set({ currentStep: step }),
      
      updateAnswers: (stepData) => set((state) => ({
        answers: { ...state.answers, ...stepData }
      })),
      
      submitQuestionnaire: async () => {
        const store = get();
        if (!store.validateAnswers()) {
          throw new Error('Questionnaire incomplet');
        }

        try {
          set({ status: 'processing' });
          
          // Ici, nous pourrions ajouter l'appel API pour sauvegarder les données
          await fetch('/api/questionnaire/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(store.answers),
          });

          set({ status: 'completed' });
        } catch (error) {
          set({ status: 'error' });
          throw error;
        }
      },

      resetQuestionnaire: () => set({
        currentStep: 1,
        status: 'draft',
        answers: {},
      }),

      setStatus: (status) => set({ status }),
      
      isStepCompleted: (step) => {
        const { answers } = get();
        switch (step) {
          case 1:
            return !!answers.basicInfo?.duration && 
                   !!answers.basicInfo?.groupSize;
          case 2:
            return !!answers.travelStyle?.pace && 
                   !!answers.travelStyle?.comfort;
          case 3:
            return !!answers.interests?.mainInterests?.length &&
                   !!answers.interests?.subcategories?.length;
          case 4:
            return !!answers.budget?.total && 
                   !!answers.budget?.dailyLimit &&
                   !!answers.budget?.priority;
          case 5:
            return get().validateAnswers();
          default:
            return false;
        }
      },

      validateAnswers: () => {
        const { answers } = get();
        
        // Validation des informations de base
        if (!answers.basicInfo?.duration || !answers.basicInfo?.groupSize) {
          return false;
        }

        // Validation du style de voyage
        if (!answers.travelStyle?.pace || !answers.travelStyle?.comfort) {
          return false;
        }

        // Validation des centres d'intérêt
        if (!answers.interests?.mainInterests?.length || 
            !answers.interests?.subcategories?.length) {
          return false;
        }

        // Validation du budget et des contraintes
        if (!answers.budget?.total || 
            !answers.budget?.dailyLimit || 
            !answers.budget?.priority) {
          return false;
        }

        if (answers.constraints === undefined) {
          return false;
        }

        return true;
      },
    }),
    {
      name: 'questionnaire-storage',
      partialize: (state) => ({
        answers: state.answers,
        status: state.status,
      }),
    }
  )
);