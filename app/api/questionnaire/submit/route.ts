// app/api/questionnaire/submit/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { QuestionnaireData, QuestionnaireStatus } from "@/types/questionnaire/questionnaire";
import { saveQuestionnaire, getQuestionnaire } from "@/lib/queue/services/questionnaireService";
import { questionnaireSchema } from "@/lib/validations/questionnaire";
import { ZodError } from "zod";

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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
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
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: new Date()
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
    const enrichedData: QuestionnaireData = {
      ...data,
      status: 'completed' as QuestionnaireStatus,
      updatedAt: new Date(),
    };

    // Sauvegarde des données
    const result = await saveQuestionnaire(session.user.id, enrichedData);
    if (!result.success) {
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire enregistré avec succès",
      data: result.data
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const questionnaire = await getQuestionnaire(session.user.id);
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    let rawData: unknown;
    try {
      rawData = await request.json();

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
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
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

    const enrichedData: QuestionnaireData = {
      ...validation.data,
      status: validation.data.status || 'completed' as QuestionnaireStatus,
      updatedAt: new Date(),
    };

    const result = await saveQuestionnaire(session.user.id, enrichedData);
    if (!result.success) {
      console.error("[PATCH] Échec de la sauvegarde");
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire mis à jour avec succès",
      data: result.data
    });

  } catch (error) {
    console.error("[PATCH] Erreur inattendue:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
