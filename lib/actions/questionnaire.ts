// lib/actions/questionnaire.ts
'use server';

import { auth } from "@/auth";
import { questionnaireSchema } from "@/lib/validations/questionnaire";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { QuestionnaireData, QuestionnaireStatus, Database } from "@/types/questionnaire/questionnaire";

type StepData = Partial<QuestionnaireData> & {
  currentStep?: number;
  [key: string]: unknown;
};

export async function submitQuestionnaire(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non autorisé");
    }

    // Validation des données
    const validatedData = questionnaireSchema.parse(data);

    // Vérification des données requises
    if (!validatedData.basicInfo || !validatedData.travelStyle || 
        !validatedData.interests || !validatedData.budget || 
        !validatedData.constraints) {
      throw new Error("Questionnaire incomplet");
    }

    // Préparation des données
    const questionnaireData: QuestionnaireData = {
      ...validatedData,
      status: 'completed',
      updatedAt: new Date(),
      userId: session.user.id
    };

    const supabase = await createClient();

    // Récupérer le dernier questionnaire
    const { data: existingQuestionnaire, error: fetchError } = await supabase
      .from('questionnaires')
      .select()
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingQuestionnaire?.id) {
      // Mise à jour
      const { error: updateError } = await supabase
        .from('questionnaires')
        .update({
          ...convertToDbFormat(questionnaireData),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingQuestionnaire.id);

      if (updateError) throw updateError;
    } else {
      // Création
      const { error: insertError } = await supabase
        .from('questionnaires')
        .insert([{
          ...convertToDbFormat(questionnaireData),
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;
    }

    revalidatePath('/questionnaire');
    return { success: true };

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Questionnaire Action Error]:", error);
      throw new Error(error.message);
    }
    throw new Error("Erreur lors de la soumission");
  }
}

export async function getQuestionnaire() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non autorisé");
    }

    const supabase = await createClient();
    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select()
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return questionnaire ? convertFromDbFormat(questionnaire) : null;

  } catch (error) {
    console.error("[Questionnaire Action Error]:", error);
    throw new Error("Erreur lors de la récupération du questionnaire");
  }
}

export async function updateQuestionnaireStep(
  step: number, 
  data: StepData
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non autorisé");
    }

    const supabase = await createClient();

    // Récupérer le questionnaire existant
    const { data: existingQuestionnaire, error: fetchError } = await supabase
      .from('questionnaires')
      .select()
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const updateData: Partial<QuestionnaireData> = {
      ...existingQuestionnaire ? convertFromDbFormat(existingQuestionnaire) : {},
      ...data,
      updatedAt: new Date(),
    };

    if (existingQuestionnaire?.id) {
      const { error: updateError } = await supabase
        .from('questionnaires')
        .update(convertToDbFormat(updateData))
        .eq('id', existingQuestionnaire.id);

      if (updateError) throw updateError;
    } else {
      const newQuestionnaireData: QuestionnaireData = {
        basicInfo: {
          duration: 0,
          dateRange: { from: new Date(), to: new Date() },
          groupSize: 0,
          previousVisit: false,
          groupType: 'solo',
          travelType: '',
          hasChildren: false,
        },
        travelStyle: {
          pace: 'moderate',
          comfort: 'standard',
          flexibility: 0,
          culturalImmersion: 0,
          preferences: [],
        },
        interests: {
          mainInterests: [],
          categories: [],
        },
        budget: {
          total: 0,
          dailyLimit: 0,
          priority: 'undecided',
        },
        constraints: {
          mobility: false,
          language: 'none',
          dietary: [],
          travelBudget: 'undecided',
          dailyBudget: 'undecided',
          budgetPriority: 'undecided',
        },
        ...data,
        status: 'draft',
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { error: insertError } = await supabase
        .from('questionnaires')
        .insert([convertToDbFormat(newQuestionnaireData)]);

      if (insertError) throw insertError;
    }

    revalidatePath('/questionnaire');
    return { success: true };

  } catch (error) {
    console.error("[Questionnaire Action Error]:", error);
    throw new Error("Erreur lors de la mise à jour de l'étape");
  }
}

function convertToDbFormat(data: Partial<QuestionnaireData>): Database['public']['Tables']['questionnaires']['Insert'] {
  const dbData: Database['public']['Tables']['questionnaires']['Insert'] = {
    status: data.status || 'draft',
    user_id: data.userId || '',
    duration: 0,
    date_range_from: new Date().toISOString(),
    date_range_to: new Date().toISOString(),
    group_size: 0,
    previous_visit: false,
    visit_count: null,
    group_type: 'solo',
    travel_type: '',
    has_children: false,
    children_count: null,
    pace: 'moderate',
    comfort: 'standard',
    flexibility: 0,
    cultural_immersion: 0,
    preferences: [],
    main_interests: [],
    specific_interests: null,
    categories: [],
    must_see_spots: null,
    total_budget: 0,
    daily_limit: 0,
    budget_priority: 'undecided',
    mobility: false,
    language: 'none',
    dietary: [],
    travel_budget: 'undecided',
    daily_budget: 'undecided',
    metadata: null
  };

  if (data.basicInfo) {
    dbData.duration = data.basicInfo.duration;
    dbData.date_range_from = data.basicInfo.dateRange.from.toISOString();
    dbData.date_range_to = data.basicInfo.dateRange.to.toISOString();
    dbData.group_size = data.basicInfo.groupSize;
    dbData.previous_visit = data.basicInfo.previousVisit;
    dbData.visit_count = data.basicInfo.visitCount || null;
    dbData.group_type = data.basicInfo.groupType;
    dbData.travel_type = data.basicInfo.travelType;
    dbData.has_children = data.basicInfo.hasChildren;
    dbData.children_count = data.basicInfo.childrenCount || null;
  }

  if (data.travelStyle) {
    dbData.pace = data.travelStyle.pace;
    dbData.comfort = data.travelStyle.comfort;
    dbData.flexibility = data.travelStyle.flexibility;
    dbData.cultural_immersion = data.travelStyle.culturalImmersion;
    dbData.preferences = data.travelStyle.preferences;
  }

  if (data.interests) {
    dbData.main_interests = data.interests.mainInterests;
    dbData.specific_interests = data.interests.specificInterests || null;
    dbData.categories = data.interests.categories;
    dbData.must_see_spots = data.interests.mustSeeSpots || null;
  }

  if (data.budget) {
    dbData.total_budget = data.budget.total;
    dbData.daily_limit = data.budget.dailyLimit;
    dbData.budget_priority = data.budget.priority;
  }

  if (data.constraints) {
    dbData.mobility = data.constraints.mobility;
    dbData.language = data.constraints.language;
    dbData.dietary = data.constraints.dietary;
    dbData.travel_budget = data.constraints.travelBudget;
    dbData.daily_budget = data.constraints.dailyBudget;
  }

  if (data.metadata) {
    dbData.metadata = data.metadata;
  }

  return dbData;
}

function convertFromDbFormat(dbData: Database['public']['Tables']['questionnaires']['Row']): QuestionnaireData {
  return {
    id: dbData.id,
    basicInfo: {
      duration: dbData.duration,
      dateRange: {
        from: new Date(dbData.date_range_from),
        to: new Date(dbData.date_range_to)
      },
      groupSize: dbData.group_size,
      previousVisit: dbData.previous_visit,
      visitCount: dbData.visit_count || undefined,
      groupType: dbData.group_type as QuestionnaireData['basicInfo']['groupType'],
      travelType: dbData.travel_type,
      hasChildren: dbData.has_children,
      childrenCount: dbData.children_count || undefined
    },
    travelStyle: {
      pace: dbData.pace as QuestionnaireData['travelStyle']['pace'],
      comfort: dbData.comfort as QuestionnaireData['travelStyle']['comfort'],
      flexibility: dbData.flexibility,
      culturalImmersion: dbData.cultural_immersion,
      preferences: dbData.preferences
    },
    interests: {
      mainInterests: dbData.main_interests,
      specificInterests: dbData.specific_interests || undefined,
      categories: dbData.categories,
      mustSeeSpots: dbData.must_see_spots || undefined
    },
    budget: {
      total: dbData.total_budget,
      dailyLimit: dbData.daily_limit,
      priority: dbData.budget_priority
    },
    constraints: {
      mobility: dbData.mobility,
      language: dbData.language as QuestionnaireData['constraints']['language'],
      dietary: dbData.dietary,
      travelBudget: dbData.travel_budget,
      dailyBudget: dbData.daily_budget,
      budgetPriority: dbData.budget_priority
    },
    status: dbData.status as QuestionnaireStatus,
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
    userId: dbData.user_id,
    metadata: dbData.metadata || undefined
  };
}