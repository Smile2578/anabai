// lib/queue/services/questionnaireService.ts
import { upstashRedis } from '../config/redis';
import connectDB from '@/lib/db/connection';
import Questionnaire from '@/models/Questionnaire';
import { QuestionnaireData } from '@/types/questionnaire/questionnaire';

const CACHE_TTL = 3600; // 1 heure
const CACHE_PREFIX = 'questionnaire:';

export async function getQuestionnaireFromCache(userId: string): Promise<QuestionnaireData | null> {
  try {
    const cachedData = await upstashRedis.get(`${CACHE_PREFIX}${userId}`);
    if (!cachedData) return null;
    
    // Gérer le cas où les données sont déjà un objet
    const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    
    // Convertir les dates
    if (parsed.basicInfo?.dateRange) {
      parsed.basicInfo.dateRange = {
        from: new Date(parsed.basicInfo.dateRange.from),
        to: new Date(parsed.basicInfo.dateRange.to)
      };
    }
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
    
    return parsed;
  } catch (error) {
    console.error('[Cache Error]:', error);
    return null;
  }
}

export async function setQuestionnaireCache(userId: string, data: QuestionnaireData): Promise<void> {
  try {
    // Préparer les données pour la sérialisation
    const serializedData = {
      ...data,
      basicInfo: data.basicInfo ? {
        ...data.basicInfo,
        dateRange: data.basicInfo.dateRange ? {
          from: data.basicInfo.dateRange.from.toISOString(),
          to: data.basicInfo.dateRange.to.toISOString()
        } : undefined
      } : undefined,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString()
    };

    await upstashRedis.set(
      `${CACHE_PREFIX}${userId}`,
      serializedData,
      { ex: CACHE_TTL }
    );
  } catch (error) {
    console.error('[Cache Error]:', error);
  }
}

export async function invalidateQuestionnaireCache(userId: string): Promise<void> {
  try {
    await upstashRedis.del(`${CACHE_PREFIX}${userId}`);
  } catch (error) {
    console.error('[Cache Error]:', error);
  }
}

export async function getQuestionnaire(userId: string): Promise<QuestionnaireData | null> {
  try {
    // 1. Essayer d'abord le cache
    const cachedData = await getQuestionnaireFromCache(userId);
    if (cachedData) {
      return cachedData;
    }

    // 2. Si pas dans le cache, chercher dans la BDD
    await connectDB();
    const questionnaire = await Questionnaire.findOne({ userId });
    
    if (questionnaire) {
      // Convertir les dates en objets Date
      const questionnaireData = {
        ...questionnaire.toObject(),
        basicInfo: questionnaire.basicInfo ? {
          ...questionnaire.basicInfo,
          dateRange: {
            from: new Date(questionnaire.basicInfo.dateRange.from),
            to: new Date(questionnaire.basicInfo.dateRange.to)
          }
        } : undefined,
        createdAt: questionnaire.createdAt ? new Date(questionnaire.createdAt) : undefined,
        updatedAt: questionnaire.updatedAt ? new Date(questionnaire.updatedAt) : undefined
      };
      
      // Mettre en cache pour les prochaines requêtes
      await setQuestionnaireCache(userId, questionnaireData);
      return questionnaireData;
    }
    
    return null;
  } catch (error) {
    console.error('[DB Error]:', error);
    return null;
  }
}

export async function saveQuestionnaire(userId: string, data: QuestionnaireData) {
  try {
    // Vérifier que les valeurs de budget sont valides
    const validBudgetPriorities = ['accommodation', 'food', 'activities', 'undecided'];
    const validBudgetTypes = ['low', 'medium', 'high', 'higher', 'undecided'];

    if (!validBudgetPriorities.includes(data.budget.priority)) {
      throw new Error('Invalid budget priority');
    }
    if (!validBudgetTypes.includes(data.constraints.travelBudget)) {
      throw new Error('Invalid travel budget');
    }
    if (!validBudgetTypes.includes(data.constraints.dailyBudget)) {
      throw new Error('Invalid daily budget');
    }

    // Préparer les données pour la sauvegarde
    const questionnaireData = {
      ...data,
      userId,
      updatedAt: new Date(),
      budget: {
        ...data.budget,
        priority: data.budget.priority || 'undecided'
      },
      constraints: {
        ...data.constraints,
        travelBudget: data.constraints.travelBudget || 'undecided',
        dailyBudget: data.constraints.dailyBudget || 'undecided',
        budgetPriority: data.constraints.budgetPriority || 'undecided'
      }
    };

    // Sauvegarder dans la base de données
    const questionnaire = await Questionnaire.findOneAndUpdate(
      { userId },
      questionnaireData,
      { upsert: true, new: true }
    );

    return { success: true, data: questionnaire };
  } catch (error) {
    console.error('[Save Error]:', error);
    return { success: false };
  }
}