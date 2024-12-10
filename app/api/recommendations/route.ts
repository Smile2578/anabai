// app/api/recommendations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { RecommendationService } from "@/lib/services/recommendations/recommendation.service";
import { z } from "zod";
import type { Place } from "@/types/places/main";
import type { IUser } from "@/models/User";
import { TemplateTypeSchema } from "@/models/recommendation.model";
import User from "@/models/User";
import { PlaceService } from "@/lib/services/places/PlaceService";
import { Types } from "mongoose";

const recommendationService = new RecommendationService();
const placeService = new PlaceService();

const GetRecommendationSchema = z.object({
  placeId: z.string(),
  creatorId: z.string().optional(),
});

const GenerateTemplateSchema = z.object({
  type: TemplateTypeSchema,
  placeIds: z.array(z.string()),
  creatorIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    if (type === "single") {
      const { placeId, creatorId } = GetRecommendationSchema.parse(body);

      // Récupérer les données nécessaires
      const place = await placeService.getPlace(placeId);
      const creator = creatorId ? await User.findById(new Types.ObjectId(creatorId)).lean() : undefined;

      if (!place) {
        return NextResponse.json({ error: "Lieu non trouvé" }, { status: 404 });
      }

      // Vérifier si le créateur est un auteur du lieu
      if (creator && !place.metadata?.authors?.some(author => author.id === creator._id.toString())) {
        return NextResponse.json(
          { error: "Le créateur n'est pas un auteur de ce lieu" },
          { status: 400 }
        );
      }

      const recommendation = await recommendationService.getRecommendationForPlace(
        place,
        {
          ...session.user,
          _id: new Types.ObjectId(session.user.id)
        } as unknown as IUser & { _id: Types.ObjectId },
        creator as unknown as IUser & { _id: Types.ObjectId }
      );

      return NextResponse.json(recommendation);
    } else if (type === "template") {
      const { type: templateType, placeIds, creatorIds } = GenerateTemplateSchema.parse(body);

      // Récupérer les données nécessaires
      const places = await Promise.all(
        placeIds.map((id: string) => placeService.getPlace(id))
      );
      const creators = creatorIds
        ? await Promise.all(
            creatorIds.map((id: string) => 
              User.findById(new Types.ObjectId(id)).lean()
            )
          )
        : undefined;

      if (places.some((p: Place | null) => !p)) {
        return NextResponse.json(
          { error: "Un ou plusieurs lieux non trouvés" },
          { status: 404 }
        );
      }

      // Vérifier que les créateurs sont des auteurs des lieux
      if (creators) {
        const allCreatorsAreAuthors = places.every(place => 
          creators.every(creator => 
            place?.metadata?.authors?.some(author => author.id === creator?._id.toString())
          )
        );

        if (!allCreatorsAreAuthors) {
          return NextResponse.json(
            { error: "Certains créateurs ne sont pas auteurs des lieux sélectionnés" },
            { status: 400 }
          );
        }
      }

      let template;
      switch (templateType) {
        case "SIGNATURE":
          if (!creators?.[0]) {
            return NextResponse.json(
              { error: "Créateur requis pour un template signature" },
              { status: 400 }
            );
          }
          template = await recommendationService.generateSignatureTemplate(
            {
              ...session.user,
              _id: new Types.ObjectId(session.user.id)
            } as unknown as IUser & { _id: Types.ObjectId },
            places.filter((p: Place | null): p is Place => !!p),
            creators[0] as unknown as IUser & { _id: Types.ObjectId }
          );
          break;

        case "FUSION":
          if (!creators || creators.length < 2) {
            return NextResponse.json(
              { error: "Au moins deux créateurs requis pour un template fusion" },
              { status: 400 }
            );
          }
          template = await recommendationService.generateFusionTemplate(
            {
              ...session.user,
              _id: new Types.ObjectId(session.user.id)
            } as unknown as IUser & { _id: Types.ObjectId },
            places.filter((p: Place | null): p is Place => !!p),
            creators as unknown as (IUser & { _id: Types.ObjectId })[]
          );
          break;

        case "AI_OPTIMIZED":
          template = await recommendationService.generateAITemplate(
            {
              ...session.user,
              _id: new Types.ObjectId(session.user.id)
            } as unknown as IUser & { _id: Types.ObjectId },
            places.filter((p: Place | null): p is Place => !!p)
          );
          break;
      }

      return NextResponse.json(template);
    }

    return NextResponse.json(
      { error: "Type de requête invalide" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors de la génération des recommandations:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");
    const creatorId = searchParams.get("creatorId");

    if (!placeId) {
      return NextResponse.json(
        { error: "ID du lieu requis" },
        { status: 400 }
      );
    }

    const place = await placeService.getPlace(placeId);
    const creator = creatorId ? await User.findById(new Types.ObjectId(creatorId)).lean() : undefined;

    if (!place) {
      return NextResponse.json({ error: "Lieu non trouvé" }, { status: 404 });
    }

    // Vérifier si le créateur est un auteur du lieu
    if (creator && !place.metadata?.authors?.some(author => author.id === creator._id.toString())) {
      return NextResponse.json(
        { error: "Le créateur n'est pas un auteur de ce lieu" },
        { status: 400 }
      );
    }

    const recommendation = await recommendationService.getRecommendationForPlace(
      place,
      {
        ...session.user,
        _id: new Types.ObjectId(session.user.id)
      } as unknown as IUser & { _id: Types.ObjectId },
      creator as unknown as IUser & { _id: Types.ObjectId }
    );

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la recommandation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 