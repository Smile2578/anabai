// app/api/questionnaire/current/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getQuestionnaire, setQuestionnaireCache } from "@/lib/queue/services/questionnaireService";

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
    if (questionnaire) {
      return NextResponse.json({
        success: true,
        data: questionnaire
      });
    }

    return NextResponse.json({
      success: false,
      message: "Aucun questionnaire trouvé"
    });

  } catch (error) {
    console.error("[Questionnaire API Error]:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
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

    const data = await request.json();
    
    // Convertir les dates
    const processedData = {
      ...data,
      basicInfo: data.basicInfo ? {
        ...data.basicInfo,
        dateRange: data.basicInfo.dateRange ? {
          from: new Date(data.basicInfo.dateRange.from),
          to: new Date(data.basicInfo.dateRange.to)
        } : undefined
      } : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date()
    };

    await setQuestionnaireCache(session.user.id, processedData);

    return NextResponse.json({ 
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error("[Questionnaire API Error]:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}