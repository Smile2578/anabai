// app/api/questionnaire/submit/route.ts
import { auth } from "@/auth";
import connectDB  from "@/lib/db/connection";
import Questionnaire from "@/models/Questionnaire";
import { NextResponse } from "next/server";
import { QuestionnaireData } from "@/types/questionnaire/questionnaire";

export async function POST(request: Request) {
  try {
    // Vérification de l'authentification
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupération et validation des données
    const data = await request.json() as QuestionnaireData;
    
    // Validation basique des données requises
    if (!data.basicInfo || !data.travelStyle || !data.interests || !data.budget) {
      return NextResponse.json(
        { error: "Données incomplètes" },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    await connectDB();

    // Création ou mise à jour du questionnaire
    const questionnaireData = {
      userId: session.user.id,
      ...data,
      status: 'completed',
      updatedAt: new Date(),
    };

    // Recherche d'un questionnaire existant pour cet utilisateur
    const existingQuestionnaire = await Questionnaire.findOne({ 
      userId: session.user.id 
    });

    if (existingQuestionnaire) {
      // Mise à jour du questionnaire existant
      await Questionnaire.findByIdAndUpdate(
        existingQuestionnaire._id,
        questionnaireData,
        { new: true }
      );
    } else {
      // Création d'un nouveau questionnaire
      await Questionnaire.create({
        ...questionnaireData,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Questionnaire enregistré avec succès"
    });

  } catch (error) {
    console.error("[Questionnaire API Error]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// GET pour récupérer le questionnaire existant
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    await connectDB();

    const questionnaire = await Questionnaire.findOne({ 
      userId: session.user.id 
    });

    if (!questionnaire) {
      return NextResponse.json(
        { message: "Aucun questionnaire trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(questionnaire);

  } catch (error) {
    console.error("[Questionnaire API Error]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}