// lib/services/recommendations/recommendation.service.ts

import type { Place } from "@/types/places/main";
import type { IUser } from "@/models/User";
import {
  RecommendationEngine,
  TemplateType,
  Template,
  RecommendationScore,
  BaseScore,
  ContextualModifiers,
} from "@/models/recommendation.model";
import type { UserExpertise, UserPreference } from "@/models/User";

export class RecommendationService {
  private engine: RecommendationEngine;

  constructor() {
    this.engine = new RecommendationEngine();
  }

  private async calculatePlaceQuality(place: Place): Promise<number> {
    // Calcul basé sur les notes, la popularité, etc.
    const ratings = place.rating?.google || { rating: 0, reviewCount: 0 };
    const averageRating = ratings.rating || 0;

    const popularity = place.metadata?.visitCount || 0;
    const popularityScore = Math.min(popularity / 1000, 1); // Normalisation

    return (averageRating * 0.7 + popularityScore * 0.3) * 100;
  }

  private async calculateCreatorInfluence(creator: IUser | undefined): Promise<number> {
    if (!creator) return 0;

    // Calcul basé sur l'expertise du créateur
    const expertise = (creator.metadata?.expertise || []) as UserExpertise[];
    const totalScore = expertise.reduce((acc: number, exp: UserExpertise) => acc + exp.level, 0);
    const averageExpertise = expertise.length > 0 ? totalScore / expertise.length : 0;

    return averageExpertise * 100;
  }

  private async calculateUserRelevance(
    place: Place,
    user: IUser
  ): Promise<number> {
    // Calcul basé sur les préférences utilisateur
    const userPreferences = (user.metadata?.preferences || []) as UserPreference[];
    const placeCategories = [place.category, ...(place.subcategories || [])];

    const matchingCategories = placeCategories.filter(cat =>
      userPreferences.some(pref => pref.category === cat)
    );

    return (matchingCategories.length / placeCategories.length) * 100;
  }

  private async calculateAccessibility(place: Place): Promise<number> {
    // Calcul basé sur l'accessibilité du lieu
    const hasPublicTransport = place.location.access?.transportOptions?.includes('public') || false;
    const hasParking = place.location.access?.transportOptions?.includes('parking') || false;
    const isWheelchairAccessible = place.practicalInfo?.accessibility?.wheelchair || false;

    let score = 0;
    if (hasPublicTransport) score += 40;
    if (hasParking) score += 30;
    if (isWheelchairAccessible) score += 30;

    return score;
  }

  private async getWeatherScore(place: Place): Promise<number> {
    // TODO: Intégrer une API météo
    return 80; // Score par défaut
  }

  private async getCrowdingScore(place: Place): Promise<number> {
    // TODO: Intégrer une API d'affluence
    return 70; // Score par défaut
  }

  private async getSeasonalityScore(place: Place): Promise<number> {
    const currentMonth = new Date().getMonth();
    const bestMonths = place.metadata?.seasonality?.bestMonths || [];

    return bestMonths.includes(currentMonth) ? 100 : 50;
  }

  private async getTimeOfDayScore(place: Place): Promise<number> {
    const currentHour = new Date().getHours();
    const openingHours = place.openingHours?.periods || [];

    const isOpen = openingHours.some(hours => 
      currentHour >= parseInt(hours.open) && currentHour < parseInt(hours.close)
    );

    return isOpen ? 100 : 0;
  }

  private async getSpecialEventsScore(place: Place): Promise<number> {
    // TODO: Intégrer une API d'événements
    return 60; // Score par défaut
  }

  public async generateSignatureTemplate(
    user: IUser,
    places: Place[],
    creator: IUser
  ): Promise<Template> {
    return this.engine.generateTemplate("SIGNATURE", user, places, [creator]);
  }

  public async generateFusionTemplate(
    user: IUser,
    places: Place[],
    creators: IUser[]
  ): Promise<Template> {
    return this.engine.generateTemplate("FUSION", user, places, creators);
  }

  public async generateAITemplate(
    user: IUser,
    places: Place[]
  ): Promise<Template> {
    return this.engine.generateTemplate("AI_OPTIMIZED", user, places);
  }

  public async getRecommendationForPlace(
    place: Place,
    user: IUser,
    creator?: IUser
  ): Promise<RecommendationScore> {
    return this.engine.generateRecommendation(place, user, creator);
  }
} 