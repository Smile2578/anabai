// app/api/questionnaire/current/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("[Questionnaire API Error]:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération du questionnaire" },
        { status: 500 }
      );
    }

    if (!questionnaire) {
      return NextResponse.json({
        success: false,
        message: "Aucun questionnaire trouvé"
      });
    }

    return NextResponse.json({
      success: true,
      data: questionnaire
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
      user_id: session.user.id,
      basicInfo: data.basicInfo ? {
        ...data.basicInfo,
        dateRange: data.basicInfo.dateRange ? {
          from: new Date(data.basicInfo.dateRange.from),
          to: new Date(data.basicInfo.dateRange.to)
        } : undefined
      } : undefined,
      created_at: data.createdAt ? new Date(data.createdAt) : new Date(),
      updated_at: new Date()
    };

    const supabase = await createClient();

    const { data: savedQuestionnaire, error } = await supabase
      .from('questionnaires')
      .insert([processedData])
      .select()
      .single();

    if (error) {
      console.error("[Questionnaire API Error]:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde du questionnaire" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: savedQuestionnaire
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