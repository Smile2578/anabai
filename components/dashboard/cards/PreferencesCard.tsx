// components/dashboard/cards/PreferencesCard.tsx
import { Button } from "@/components/ui/button";
import { PreferencesCardProps } from "@/types/dashboard/cards";
import { DashboardCard } from "../shared/DashboardCard";
import { Heart, Scale, Footprints, Sparkles } from "lucide-react";

type CategoryId = 'culture' | 'nature' | 'gastronomy' | 'modern' | 'experiences' | 'shopping';

interface CategoryItems {
  [key: string]: string;
}

interface Category {
  label: string;
  color: string;
  items: CategoryItems;
}

const interestCategories: Record<CategoryId, Category> = {
  culture: {
    label: "Culture Traditionnelle",
    color: "primary",
    items: {
      temples: "⛩️ Temples & Sanctuaires",
      ceremonies: "🎎 Cérémonies Traditionnelles",
      arts: "🎭 Arts Traditionnels",
      tea: "🍵 Cérémonie du Thé",
      calligraphy: "✒️ Calligraphie",
      kimono: "👘 Port du Kimono"
    }
  },
  nature: {
    label: "Nature & Paysages",
    color: "matcha",
    items: {
      mountains: "⛰️ Montagnes & Randonnées",
      gardens: "🌸 Jardins Japonais",
      onsen: "♨️ Sources Thermales",
      sakura: "🌺 Floraison des Cerisiers",
      autumn: "🍁 Couleurs d'Automne",
      islands: "🏖️ Îles & Plages"
    }
  },
  gastronomy: {
    label: "Gastronomie",
    color: "sakura",
    items: {
      sushi: "🍣 Sushi & Sashimi",
      ramen: "🍜 Ramen & Nouilles",
      street: "🍡 Street Food",
      sake: "🍶 Saké & Boissons",
      wagyu: "🥩 Wagyu & Spécialités",
      kaiseki: "🍱 Cuisine Kaiseki"
    }
  },
  modern: {
    label: "Japon Moderne",
    color: "ocean",
    items: {
      anime: "🎨 Anime & Manga",
      tech: "🤖 Quartiers High-Tech",
      jpop: "🎵 J-Pop & Musique",
      gaming: "🎮 Gaming & Arcades",
      fashion: "👗 Mode & Tendances",
      robot: "🦾 Cafés Robots"
    }
  },
  experiences: {
    label: "Expériences Uniques",
    color: "sunset",
    items: {
      martial: "🥋 Arts Martiaux",
      cooking: "👨‍🍳 Cours de Cuisine",
      festivals: "🎆 Festivals Traditionnels",
      crafts: "🎨 Artisanat Local",
      karaoke: "🎤 Karaoké",
      nightlife: "🌙 Vie Nocturne"
    }
  },
  shopping: {
    label: "Shopping & Souvenirs",
    color: "secondary",
    items: {
      markets: "🏮 Marchés Traditionnels",
      malls: "🛍️ Centres Commerciaux",
      antiques: "🏺 Antiquités & Artisanat",
      electronics: "📱 Électronique",
      beauty: "💄 Cosmétiques & Beauté",
      luxury: "✨ Boutiques de Luxe"
    }
  }
};

const translateInterest = (interest: string): string => {
  const [category, item] = interest.split('.');
  if (category && item && category in interestCategories) {
    return interestCategories[category as CategoryId].items[item] || interest;
  }
  return interest;
};

export function PreferencesCard({ preferences, onEdit }: PreferencesCardProps) {
  const getComfortLevel = (comfort?: string) => {
    const levels = {
      budget: '🎒 Voyageur',
      standard: '🏡 Confortable',
      luxury: '✨ Luxueux',
    };
    return levels[comfort as keyof typeof levels] || 'Non spécifié';
  };

  const getPaceLevel = (pace?: string) => {
    const levels = {
      relaxed: '🌅 Détendu',
      moderate: '⚖️ Équilibré',
      intensive: '🏃 Dynamique',
    };
    return levels[pace as keyof typeof levels] || 'Non spécifié';
  };

  // Grouper les intérêts par catégorie
  const groupedInterests = preferences.interests?.mainInterests.reduce((acc, interest) => {
    const [category] = interest.split('.');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(interest);
    return acc;
  }, {} as Record<string, string[]>) || {};

  return (
    <DashboardCard
      title="Style de voyage"
      description="Vos préférences pour une expérience unique"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Colonne de gauche */}
          <div className="space-y-4">
            {/* Style de voyage */}
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Scale className="h-4 w-4" />
                <h4 className="font-medium text-sm">Style</h4>
              </div>
              <p className="text-sm">{getComfortLevel(preferences.travelStyle?.comfort)}</p>
            </div>

            {/* Rythme */}
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Footprints className="h-4 w-4" />
                <h4 className="font-medium text-sm">Rythme</h4>
              </div>
              <p className="text-sm">{getPaceLevel(preferences.travelStyle?.pace)}</p>
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="space-y-4">
            {/* Flexibilité */}
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Sparkles className="h-4 w-4" />
                <h4 className="font-medium text-sm">Flexibilité</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-primary/20 rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${preferences.travelStyle?.flexibility || 0}%` }}
                  />
                </div>
                <span className="text-xs">
                  {preferences.travelStyle?.flexibility}%
                </span>
              </div>
            </div>

            {/* Immersion */}
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Heart className="h-4 w-4" />
                <h4 className="font-medium text-sm">Immersion</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-secondary/20 rounded-full">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all"
                    style={{ width: `${preferences.travelStyle?.culturalImmersion || 0}%` }}
                  />
                </div>
                <span className="text-xs">
                  {preferences.travelStyle?.culturalImmersion}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Centres d'intérêt par catégorie */}
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Heart className="h-4 w-4" />
            <h4 className="font-medium text-sm">Centres d&apos;intérêt</h4>
          </div>
          <div className="space-y-2">
            {Object.entries(groupedInterests).map(([category, interests]) => (
              <div key={category} className="space-y-1">
                <h5 className="text-xs font-medium text-muted-foreground">
                  {interestCategories[category as CategoryId]?.label}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {translateInterest(interest)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={onEdit}
          variant="outline"
          className="w-full mt-2"
        >
          Modifier mes préférences
        </Button>
      </div>
    </DashboardCard>
  );
}