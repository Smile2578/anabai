// lib/actions/questionnaire.ts
'use server';

import { auth } from "@/auth";
import { questionnaireSchema } from "@/lib/validations/questionnaire";
import connectDB from "@/lib/db/connection";
import Questionnaire from "@/models/Questionnaire";
import { revalidatePath } from "next/cache";

export async function submitQuestionnaire(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non autorisé");
    }

    // Validation des données
    const validatedData = questionnaireSchema.parse(data);

    // Connexion à la base de données
    await connectDB();

    // Vérification des données requises
    if (!validatedData.basicInfo || !validatedData.travelStyle || 
        !validatedData.interests || !validatedData.budget || 
        !validatedData.constraints) {
      throw new Error("Questionnaire incomplet");
    }

    // Préparation des données
    const questionnaireData = {
      userId: session.user.id,
      ...validatedData,
      status: 'completed',
      updatedAt: new Date(),
    };

    // Recherche d'un questionnaire existant
    const existingQuestionnaire = await Questionnaire.findOne({ 
      userId: session.user.id 
    });

    if (existingQuestionnaire) {
      // Mise à jour
      await Questionnaire.findByIdAndUpdate(
        existingQuestionnaire._id,
        questionnaireData,
        { new: true }
      );
    } else {
      // Création
      await Questionnaire.create({
        ...questionnaireData,
        createdAt: new Date(),
      });
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

    await connectDB();

    const questionnaire = await Questionnaire.findOne({ 
      userId: session.user.id 
    });

    if (!questionnaire) {
      return null;
    }

    return questionnaire;

  } catch (error) {
    console.error("[Questionnaire Action Error]:", error);
    throw new Error("Erreur lors de la récupération du questionnaire");
  }
}

export async function updateQuestionnaireStep(
  step: number, 
  data: unknown
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Non autorisé");
    }

    await connectDB();

    const questionnaire = await Questionnaire.findOne({ 
      userId: session.user.id 
    });

    const updateData = {
      ...questionnaire?.toObject(),
      [`step${step}Completed`]: true,
      currentStep: step + 1,
      ...data,
      updatedAt: new Date(),
    };

    if (questionnaire) {
      await Questionnaire.findByIdAndUpdate(
        questionnaire._id,
        updateData,
        { new: true }
      );
    } else {
      await Questionnaire.create({
        userId: session.user.id,
        currentStep: step + 1,
        [`step${step}Completed`]: true,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath('/questionnaire');
    return { success: true };

  } catch (error) {
    console.error("[Questionnaire Action Error]:", error);
    throw new Error("Erreur lors de la mise à jour de l'étape");
  }
}