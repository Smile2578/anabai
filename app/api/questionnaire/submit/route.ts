// app/api/questionnaire/submit/route.ts
import { NextResponse } from "next/server";
import { QuestionnaireData, QuestionnaireStatus } from "@/types/questionnaire/questionnaire";
import { questionnaireSchema } from "@/lib/validations/questionnaire";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";

async function validateQuestionnaireData(data: unknown): Promise<{ 
  success: boolean; 
  data?: QuestionnaireData; 
  error?: string;
}> {
  try {
    const validatedData = questionnaireSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: `Validation échouée: ${errorMessage}` };
    }
    return { success: false, error: "Erreur de validation inconnue" };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    let rawData: unknown;
    try {
      rawData = await request.json();
      console.log("[POST] Données reçues:", JSON.stringify(rawData, null, 2));

      // Conversion des données
      if (typeof rawData === 'object' && rawData !== null) {
        const data = rawData as Partial<QuestionnaireData>;
        
        // Créer un nouvel objet pour éviter de modifier l'original
        const processedData = {
          ...data,
          basicInfo: data.basicInfo ? {
            ...data.basicInfo,
            dateRange: data.basicInfo.dateRange ? {
              from: new Date(data.basicInfo.dateRange.from),
              to: new Date(data.basicInfo.dateRange.to)
            } : undefined
          } : undefined,
          travelStyle: data.travelStyle ? {
            ...data.travelStyle,
            preferences: data.travelStyle.preferences?.length ? 
              data.travelStyle.preferences : ['default']
          } : undefined,
          created_at: data.createdAt ? new Date(data.createdAt) : new Date(),
          updated_at: new Date()
        };

        rawData = processedData;
      }
    } catch (error) {
      console.error("[POST] Erreur de parsing JSON:", error);
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    // Validation des données avec Zod
    const validation = await validateQuestionnaireData(rawData);
    if (!validation.success || !validation.data) {
      console.error("[POST] Erreur de validation:", validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Vérification des données requises
    const { data } = validation;
    if (!data.basicInfo?.dateRange?.from || 
        !data.basicInfo?.dateRange?.to || 
        !data.basicInfo?.groupType ||
        !data.travelStyle?.comfort || 
        !data.travelStyle?.pace ||
        typeof data.travelStyle?.flexibility !== 'number' ||
        typeof data.travelStyle?.culturalImmersion !== 'number' ||
        !data.interests?.mainInterests?.length ||
        !data.constraints?.travelBudget ||
        !data.constraints?.dailyBudget ||
        !data.constraints?.language) {
      return NextResponse.json(
        { error: "Données incomplètes ou invalides" },
        { status: 400 }
      );
    }

    // Vérification des dates
    const now = new Date();
    const fromDate = data.basicInfo.dateRange.from;
    const toDate = data.basicInfo.dateRange.to;

    if (fromDate < now) {
      return NextResponse.json(
        { error: "La date de début doit être dans le futur" },
        { status: 400 }
      );
    }

    if (toDate <= fromDate) {
      return NextResponse.json(
        { error: "La date de fin doit être après la date de début" },
        { status: 400 }
      );
    }

    // Enrichissement des données
    const enrichedData = {
      user_id: user.id,
      status: 'completed' as QuestionnaireStatus,
      created_at: new Date(),
      updated_at: new Date(),
      
      // Basic Info
      duration: data.basicInfo.duration,
      date_range_from: data.basicInfo.dateRange.from,
      date_range_to: data.basicInfo.dateRange.to,
      group_size: data.basicInfo.groupSize,
      previous_visit: data.basicInfo.previousVisit,
      visit_count: data.basicInfo.visitCount || null,
      group_type: data.basicInfo.groupType,
      has_children: data.basicInfo.hasChildren,
      children_count: data.basicInfo.childrenCount || null,

      // Travel Style
      pace: data.travelStyle.pace,
      comfort: data.travelStyle.comfort,
      flexibility: data.travelStyle.flexibility,
      cultural_immersion: data.travelStyle.culturalImmersion,
      preferences: data.travelStyle.preferences,

      // Interests
      main_interests: data.interests.mainInterests,
      specific_interests: data.interests.specificInterests || null,
      categories: data.interests.categories,
      must_see_spots: data.interests.mustSeeSpots || null,

      // Budget
      total_budget: Number(data.budget.total),
      daily_limit: Number(data.budget.dailyLimit),
      budget_priority: data.budget.priority,

      // Constraints
      mobility: data.constraints.mobility,
      language: data.constraints.language,
      dietary: data.constraints.dietary || [],
      travel_budget: data.constraints.travelBudget,
      daily_budget: data.constraints.dailyBudget,

      // Metadata (simplifié)
      metadata: {
        categories: data.interests.categories
      }
    };

    // Sauvegarde dans Supabase
    const { data: savedQuestionnaire, error } = await supabase
      .from('questionnaires')
      .insert([enrichedData])
      .select()
      .single();

    if (error) {
      console.error("[POST] Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire enregistré avec succès",
      data: savedQuestionnaire
    });

  } catch (error) {
    console.error("[POST] Erreur inattendue:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("[GET] Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération du questionnaire" },
        { status: 500 }
      );
    }

    if (!questionnaire) {
      return NextResponse.json(
        { message: "Aucun questionnaire trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questionnaire
    });

  } catch (error) {
    console.error("[Questionnaire API Error]:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID du questionnaire manquant" },
        { status: 400 }
      );
    }

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    let rawData: unknown;
    try {
      rawData = await request.json();
      console.log("[PATCH] Données reçues:", JSON.stringify(rawData, null, 2));

      // Conversion des données
      if (typeof rawData === 'object' && rawData !== null) {
        const data = rawData as Partial<QuestionnaireData>;
        
        // Créer un nouvel objet pour éviter de modifier l'original
        const processedData = {
          ...data,
          basicInfo: data.basicInfo ? {
            ...data.basicInfo,
            dateRange: data.basicInfo.dateRange ? {
              from: new Date(data.basicInfo.dateRange.from),
              to: new Date(data.basicInfo.dateRange.to)
            } : undefined
          } : undefined,
          travelStyle: data.travelStyle ? {
            ...data.travelStyle,
            preferences: data.travelStyle.preferences?.length ? 
              data.travelStyle.preferences : ['default']
          } : undefined,
          updated_at: new Date()
        };

        rawData = processedData;
      }
    } catch (error) {
      console.error("[PATCH] Erreur de parsing JSON:", error);
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    const validation = await validateQuestionnaireData(rawData);
    if (!validation.success || !validation.data) {
      console.error("[PATCH] Erreur de validation:", validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { data } = validation;
    const enrichedData = {
      user_id: user.id,
      status: 'completed' as QuestionnaireStatus,
      updated_at: new Date(),
      
      // Basic Info
      duration: data.basicInfo.duration,
      date_range_from: data.basicInfo.dateRange.from,
      date_range_to: data.basicInfo.dateRange.to,
      group_size: data.basicInfo.groupSize,
      previous_visit: data.basicInfo.previousVisit,
      visit_count: data.basicInfo.visitCount || null,
      group_type: data.basicInfo.groupType,
      has_children: data.basicInfo.hasChildren,
      children_count: data.basicInfo.childrenCount || null,

      // Travel Style
      pace: data.travelStyle.pace,
      comfort: data.travelStyle.comfort,
      flexibility: data.travelStyle.flexibility,
      cultural_immersion: data.travelStyle.culturalImmersion,
      preferences: data.travelStyle.preferences,

      // Interests
      main_interests: data.interests.mainInterests,
      specific_interests: data.interests.specificInterests || null,
      categories: data.interests.categories,
      must_see_spots: data.interests.mustSeeSpots || null,

      // Budget
      total_budget: Number(data.budget.total),
      daily_limit: Number(data.budget.dailyLimit),
      budget_priority: data.budget.priority,

      // Constraints
      mobility: data.constraints.mobility,
      language: data.constraints.language,
      dietary: data.constraints.dietary || [],
      travel_budget: data.constraints.travelBudget,
      daily_budget: data.constraints.dailyBudget,

      // Metadata (simplifié)
      metadata: {
        categories: data.interests.categories
      }
    };

    const { data: updatedQuestionnaire, error } = await supabase
      .from('questionnaires')
      .update(enrichedData)
      .eq('id', id)
      .eq('user_id', user.id)  // Sécurité supplémentaire
      .select()
      .single();

    if (error) {
      console.error("[PATCH] Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire mis à jour avec succès",
      data: updatedQuestionnaire
    });

  } catch (error) {
    console.error("[PATCH] Erreur inattendue:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
