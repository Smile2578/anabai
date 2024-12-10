// hooks/recommendations/useRecommendations.ts

import { useState } from "react";
import { Template, RecommendationScore, TemplateType } from "@/models/recommendation.model";
import type { Place } from "@/types/places/main";
import type { IUser } from "@/models/User";
import mongoose from "mongoose";

interface UseRecommendationsProps {
  onError?: (error: Error) => void;
}

interface GenerateTemplateParams {
  type: TemplateType;
  placeIds: string[];
  creatorIds?: string[];
}

export function useRecommendations({ onError }: UseRecommendationsProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getRecommendation = async (
    placeId: string,
    creatorId?: string
  ): Promise<RecommendationScore | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ placeId });
      if (creatorId) params.append("creatorId", creatorId);

      const response = await fetch(`/api/recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Une erreur est survenue");
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateTemplate = async ({
    type,
    placeIds,
    creatorIds,
  }: GenerateTemplateParams): Promise<Template | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "template",
          templateType: type,
          placeIds,
          creatorIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Une erreur est survenue");
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateSignatureTemplate = async (
    places: Place[],
    creator: IUser & { _id: mongoose.Types.ObjectId }
  ): Promise<Template | null> => {
    return generateTemplate({
      type: "SIGNATURE",
      placeIds: places.map(p => p._id),
      creatorIds: [creator._id.toString()],
    });
  };

  const generateFusionTemplate = async (
    places: Place[],
    creators: (IUser & { _id: mongoose.Types.ObjectId })[]
  ): Promise<Template | null> => {
    return generateTemplate({
      type: "FUSION",
      placeIds: places.map(p => p._id),
      creatorIds: creators.map(c => c._id.toString()),
    });
  };

  const generateAITemplate = async (
    places: Place[]
  ): Promise<Template | null> => {
    return generateTemplate({
      type: "AI_OPTIMIZED",
      placeIds: places.map(p => p._id),
    });
  };

  return {
    getRecommendation,
    generateSignatureTemplate,
    generateFusionTemplate,
    generateAITemplate,
    isLoading,
    error,
  };
} 