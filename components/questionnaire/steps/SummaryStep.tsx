// components/questionnaire/steps/SummaryStep.tsx
'use client';

import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Scale,
  Heart,
  Check,
  Loader2,
  Accessibility,
  Plane,
  Users,
  Clock,
  Globe,
  Utensils,
  Wallet,
  Banknote,
  Landmark,
  Mountain,
  Sparkles,
  ShoppingBag,
  Building,
  Star,
  Shuffle,
  Globe2,
  Compass,
  Map,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const badgeVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

type BudgetType = 'undecided' | 'low' | 'medium' | 'high' | 'higher';

const budgetLabels: Record<BudgetType, string> = {
  undecided: "À définir",
  low: "< 1500€",
  medium: "1500€ - 2500€",
  high: "2500€ - 4000€",
  higher: "> 4000€"
};

const dailyBudgetLabels: Record<BudgetType, string> = {
  undecided: "À définir",
  low: "< 100€/jour",
  medium: "100€ - 200€/jour",
  high: "200€ - 300€/jour",
  higher: "> 300€/jour"
};

const languageLevels = {
  none: "Aucune notion",
  basic: "Bases",
  intermediate: "Intermédiaire",
  fluent: "Courant",
};

const groupTypeLabels = {
  solo: "Voyage Solo",
  couple: "Voyage en Couple",
  friends: "Entre Amis",
  family: "En Famille",
  group: "En Groupe",
  business: "Voyage d'Affaires",
};

const comfortLevels = {
  luxury: "Luxe",
  comfort: "Confort",
  moderate: "Modéré",
  budget: "Économique",
};

const dietaryLabels = {
  none: "Aucune restriction",
  vegetarian: "Végétarien",
  vegan: "Végétalien",
  halal: "Halal",
  kosher: "Casher",
  "gluten-free": "Sans gluten",
  "lactose-free": "Sans lactose"
};

const interestCategories = {
  culture: {
    label: "Culture Traditionnelle",
    items: {
      temples: "Temples & Sanctuaires",
      ceremonies: "Cérémonies Traditionnelles",
      arts: "Arts Traditionnels",
      tea: "Cérémonie du Thé",
      calligraphy: "Calligraphie",
      kimono: "Port du Kimono"
    }
  },
  nature: {
    label: "Nature & Paysages",
    items: {
      mountains: "Montagnes & Randonnées",
      gardens: "Jardins Japonais",
      onsen: "Sources Thermales",
      sakura: "Floraison des Cerisiers",
      autumn: "Couleurs d'Automne",
      islands: "Îles & Plages"
    }
  },
  gastronomy: {
    label: "Gastronomie",
    items: {
      sushi: "Sushi & Sashimi",
      ramen: "Ramen & Nouilles",
      street: "Street Food",
      sake: "Saké & Boissons",
      wagyu: "Wagyu & Spécialités",
      kaiseki: "Cuisine Kaiseki"
    }
  },
  modern: {
    label: "Japon Moderne",
    items: {
      anime: "Anime & Manga",
      tech: "Quartiers High-Tech",
      jpop: "J-Pop & Musique",
      gaming: "Gaming & Arcades",
      fashion: "Mode & Tendances",
      robot: "Cafés Robots"
    }
  },
  experiences: {
    label: "Expériences Uniques",
    items: {
      martial: "Arts Martiaux",
      cooking: "Cours de Cuisine",
      festivals: "Festivals Traditionnels",
      crafts: "Artisanat Local",
      karaoke: "Karaoké",
      nightlife: "Vie Nocturne"
    }
  },
  shopping: {
    label: "Shopping & Souvenirs",
    items: {
      markets: "Marchés Traditionnels",
      malls: "Centres Commerciaux",
      antiques: "Antiquités & Artisanat",
      electronics: "Électronique",
      beauty: "Cosmétiques & Beauté",
      luxury: "Boutiques de Luxe"
    }
  }
};

// Ajout des couleurs par catégorie
const categoryStyles = {
  culture: {
    color: "#FF6B6B",
    bgColor: "#FFE8E8",
    icon: Landmark
  },
  nature: {
    color: "#4ECB71",
    bgColor: "#E8F5E9",
    icon: Mountain
  },
  gastronomy: {
    color: "#FF9F43",
    bgColor: "#FFF0E4",
    icon: Utensils
  },
  modern: {
    color: "#5C7CFA",
    bgColor: "#E8F0FF",
    icon: Building
  },
  experiences: {
    color: "#845EF7",
    bgColor: "#F3F0FF",
    icon: Sparkles
  },
  shopping: {
    color: "#20C997",
    bgColor: "#E6FCF5",
    icon: ShoppingBag
  }
} as const;

const paceLabels = {
  slow: "Rythme tranquille",
  moderate: "Rythme modéré",
  fast: "Rythme soutenu"
} as const;

export function SummaryStep() {
  const router = useRouter();
  const { answers, submitQuestionnaire, validateAnswers } = useQuestionnaireStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      toast({
        variant: "destructive",
        title: "Questionnaire incomplet",
        description: "Veuillez remplir toutes les sections avant de soumettre.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await submitQuestionnaire();
      
      toast({
        title: "Questionnaire soumis avec succès ! 🎉",
        description: "Votre profil de voyage a été créé. Préparez-vous à découvrir le Japon !",
      });

      // Redirection vers la page de résultats
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* En-tête */}
      <motion.div variants={cardVariants} className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <Check className="h-8 w-8" />
          Résumé de votre voyage
        </h2>
        <p className="text-lg text-muted-foreground">
          Vérifiez les informations avant de finaliser votre profil de voyage
        </p>
        <Badge variant="outline" className="text-lg px-6 py-2">
          Dernière étape
        </Badge>
      </motion.div>

      <div className="grid gap-8">
        {/* Informations de base */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden border-2 border-primary/10">
            <div className="bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Informations de base</CardTitle>
                  <CardDescription className="text-base">
                    Détails essentiels de votre voyage
                  </CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Dates</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {answers.basicInfo?.dateRange?.from ? new Date(answers.basicInfo.dateRange.from).toLocaleDateString('fr-FR') : ''} - {answers.basicInfo?.dateRange?.to ? new Date(answers.basicInfo.dateRange.to).toLocaleDateString('fr-FR') : ''}
                    </Badge>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Voyageurs</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {answers.basicInfo?.groupSize} personne{answers.basicInfo?.groupSize !== 1 ? 's' : ''}
                      {answers.basicInfo?.hasChildren ? 
                        ` (dont ${answers.basicInfo?.childrenCount || 0} enfant${(answers.basicInfo?.childrenCount || 0) > 1 ? 's' : ''})` : ''}
                    </Badge>
                  </motion.div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Plane className="h-5 w-5" />
                    <span className="font-medium">Type de voyage</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {groupTypeLabels[answers.basicInfo?.groupType as keyof typeof groupTypeLabels]}
                    </Badge>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Map className="h-5 w-5" />
                    <span className="font-medium">Expérience du Japon</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {answers.basicInfo?.previousVisit && answers.basicInfo?.visitCount ? 
                        `${answers.basicInfo.visitCount} visite${answers.basicInfo.visitCount > 1 ? 's' : ''} précédente${answers.basicInfo.visitCount > 1 ? 's' : ''}` : 
                        'Première visite'}
                    </Badge>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Style de voyage */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden border-2 border-secondary/10">
            <div className="bg-secondary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Compass className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Style de voyage</CardTitle>
                  <CardDescription className="text-base">
                    Vos préférences de voyage
                  </CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Shuffle className="h-5 w-5" />
                    <span className="font-medium">Flexibilité</span>
                  </div>
                  <div className="bg-secondary/5 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Planifié</span>
                      <span>Flexible</span>
                    </div>
                    <Progress value={answers.travelStyle?.flexibility || 0} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Globe2 className="h-5 w-5" />
                    <span className="font-medium">Immersion culturelle</span>
                  </div>
                  <div className="bg-secondary/5 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Basique</span>
                      <span>Immersif</span>
                    </div>
                    <Progress value={answers.travelStyle?.culturalImmersion || 0} className="h-2" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary">
                    <Star className="h-5 w-5" />
                    <span className="font-medium">Niveau de confort</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {comfortLevels[answers.travelStyle?.comfort as keyof typeof comfortLevels]}
                    </Badge>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary">
                    <Timer className="h-5 w-5" />
                    <span className="font-medium">Rythme de voyage</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {paceLabels[answers.travelStyle?.pace as keyof typeof paceLabels]}
                    </Badge>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Centres d'intérêt */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden border-2 border-[#FF6B6B]/10">
            <div className="bg-[#FF6B6B]/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#FF6B6B]/10">
                  <Heart className="h-6 w-6 text-[#FF6B6B]" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Centres d&apos;intérêt</CardTitle>
                  <CardDescription className="text-base">
                    Vos préférences d&apos;activités
                  </CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                {answers.interests?.mainInterests && 
                  Object.entries(
                    answers.interests.mainInterests.reduce((acc, interest) => {
                      const [cat, itemId] = interest.split('.');
                      if (!acc[cat]) acc[cat] = [];
                      if (interestCategories[cat as keyof typeof interestCategories]?.items[itemId as keyof typeof interestCategories[keyof typeof interestCategories]['items']]) {
                        acc[cat].push(itemId);
                      }
                      return acc;
                    }, {} as Record<string, string[]>)
                  ).map(([categoryId, items]) => {
                    const category = interestCategories[categoryId as keyof typeof interestCategories];
                    const style = categoryStyles[categoryId as keyof typeof categoryStyles];
                    if (!category || !style) return null;

                    const Icon = style.icon;
                    return (
                      <motion.div 
                        key={categoryId}
                        variants={cardVariants}
                        className="space-y-3 p-4 rounded-xl"
                        style={{ backgroundColor: style.bgColor }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: style.color + '20' }}>
                            <Icon className="h-5 w-5" style={{ color: style.color }} />
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-medium" style={{ color: style.color }}>
                              {category.label}
                            </p>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: style.color,
                                color: style.color,
                                backgroundColor: style.color + '10'
                              }}
                            >
                              {items.length} {items.length > 1 ? 'activités' : 'activité'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {items.map(itemId => {
                            const itemLabel = category.items[itemId as keyof typeof category.items];
                            if (!itemLabel) return null;
                            return (
                              <motion.div variants={badgeVariants} key={`${categoryId}.${itemId}`}>
                                <Badge
                                  variant="outline"
                                  className="text-sm px-3 py-1"
                                  style={{ 
                                    backgroundColor: style.color + '20',
                                    color: style.color
                                  }}
                                >
                                  {itemLabel}
                                </Badge>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contraintes */}
        <motion.div variants={cardVariants}>
          <Card className="overflow-hidden border-2 border-[#845EF7]/10">
            <div className="bg-[#845EF7]/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#845EF7]/10">
                  <Scale className="h-6 w-6 text-[#845EF7]" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Contraintes</CardTitle>
                  <CardDescription className="text-base">
                    Vos contraintes et préférences
                  </CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#845EF7]">
                    <Wallet className="h-5 w-5" />
                    <span className="font-medium">Budget voyage</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {budgetLabels[answers.constraints?.travelBudget as keyof typeof budgetLabels]}
                    </Badge>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#845EF7]">
                    <Banknote className="h-5 w-5" />
                    <span className="font-medium">Budget journalier</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {dailyBudgetLabels[answers.constraints?.dailyBudget as keyof typeof dailyBudgetLabels]}
                    </Badge>
                  </motion.div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#845EF7]">
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">Niveau de langue</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {languageLevels[answers.constraints?.language as keyof typeof languageLevels]}
                    </Badge>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#845EF7]">
                    <Accessibility className="h-5 w-5" />
                    <span className="font-medium">Mobilité réduite</span>
                  </div>
                  <motion.div variants={badgeVariants}>
                    <Badge 
                      variant="outline" 
                      className="text-base px-4 py-2"
                    >
                      {answers.constraints?.mobility ? 'Oui' : 'Non'}
                    </Badge>
                  </motion.div>
                </div>
              </div>

              {answers.constraints?.dietary && answers.constraints.dietary.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#845EF7]">
                    <Utensils className="h-5 w-5" />
                    <span className="font-medium">Régimes alimentaires</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {answers.constraints.dietary.map((diet) => (
                      <motion.div variants={badgeVariants} key={diet}>
                        <Badge
                          variant="outline"
                          className="text-base px-4 py-2"
                        >
                          {dietaryLabels[diet as keyof typeof dietaryLabels] || diet}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Boutons de navigation */}
        <motion.div variants={cardVariants} className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/questionnaire/4')}
            className="group px-6 py-3 text-base"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="group px-6 py-3 text-base bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                Finaliser
                <Check className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}