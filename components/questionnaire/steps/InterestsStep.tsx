// components/questionnaire/steps/InterestsStep.tsx
'use client';

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Info, 
  Landmark, 
  Mountain, 
  Utensils, 
  Building, 
  Sparkles, 
  ShoppingBag,
  Check,
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { designSystem } from "@/styles/theme";
import { useEffect } from "react";

const formSchema = z.object({
  mainInterests: z.array(z.string()).min(1, "Sélectionnez au moins un centre d'intérêt"),
  specificInterests: z.array(z.string()).optional(),
});

const interestCategories = [
  {
    id: "culture",
    label: "Culture Traditionnelle",
    description: "Immergez-vous dans l'histoire et les traditions séculaires",
    longDescription: "Des temples ancestraux aux cérémonies traditionnelles, découvrez l'essence même de la culture japonaise à travers ses rituels et son patrimoine.",
    icon: Landmark,
    color: designSystem.colors.primary.main,
    bgColor: `${designSystem.colors.primary.main}10`,
    items: [
      { id: "temples", label: "Temples & Sanctuaires" },
      { id: "ceremonies", label: "Cérémonies Traditionnelles" },
      { id: "arts", label: "Arts Traditionnels" },
      { id: "tea", label: "Cérémonie du Thé" },
      { id: "calligraphy", label: "Calligraphie" },
      { id: "kimono", label: "Port du Kimono" }
    ]
  },
  {
    id: "nature",
    label: "Nature & Paysages",
    description: "Explorez les merveilles naturelles du Japon",
    longDescription: "Des sommets enneigés du Mont Fuji aux jardins zen paisibles, le Japon offre une diversité naturelle exceptionnelle à découvrir.",
    icon: Mountain,
    color: designSystem.colors.accents.matcha,
    bgColor: `${designSystem.colors.accents.matcha}10`,
    items: [
      { id: "mountains", label: "Montagnes & Randonnées" },
      { id: "gardens", label: "Jardins Japonais" },
      { id: "onsen", label: "Sources Thermales" },
      { id: "sakura", label: "Floraison des Cerisiers" },
      { id: "autumn", label: "Couleurs d'Automne" },
      { id: "islands", label: "Îles & Plages" }
    ]
  },
  {
    id: "gastronomy",
    label: "Gastronomie",
    description: "Savourez les délices de la cuisine japonaise",
    longDescription: "De la haute gastronomie aux izakayas populaires, partez à la découverte des saveurs uniques qui font la renommée de la cuisine japonaise.",
    icon: Utensils,
    color: designSystem.colors.accents.sakura,
    bgColor: `${designSystem.colors.accents.sakura}10`,
    items: [
      { id: "sushi", label: "Sushi & Sashimi" },
      { id: "ramen", label: "Ramen & Nouilles" },
      { id: "street", label: "Street Food" },
      { id: "sake", label: "Saké & Boissons" },
      { id: "wagyu", label: "Wagyu & Spécialités" },
      { id: "kaiseki", label: "Cuisine Kaiseki" }
    ]
  },
  {
    id: "modern",
    label: "Japon Moderne",
    description: "Plongez dans la culture contemporaine",
    longDescription: "Découvrez le Japon d'aujourd'hui à travers sa pop culture, sa technologie de pointe et ses quartiers branchés.",
    icon: Building,
    color: designSystem.colors.accents.ocean,
    bgColor: `${designSystem.colors.accents.ocean}10`,
    items: [
      { id: "anime", label: "Anime & Manga" },
      { id: "tech", label: "Quartiers High-Tech" },
      { id: "jpop", label: "J-Pop & Musique" },
      { id: "gaming", label: "Gaming & Arcades" },
      { id: "fashion", label: "Mode & Tendances" },
      { id: "robot", label: "Cafés Robots" }
    ]
  },
  {
    id: "experiences",
    label: "Expériences Uniques",
    description: "Vivez des moments inoubliables",
    longDescription: "Participez à des activités authentiques et créez des souvenirs uniques à travers des expériences typiquement japonaises.",
    icon: Sparkles,
    color: designSystem.colors.accents.sunset,
    bgColor: `${designSystem.colors.accents.sunset}10`,
    items: [
      { id: "martial", label: "Arts Martiaux" },
      { id: "cooking", label: "Cours de Cuisine" },
      { id: "festivals", label: "Festivals Traditionnels" },
      { id: "crafts", label: "Artisanat Local" },
      { id: "karaoke", label: "Karaoké" },
      { id: "nightlife", label: "Vie Nocturne" }
    ]
  },
  {
    id: "shopping",
    label: "Shopping & Souvenirs",
    description: "Découvrez les meilleurs spots shopping",
    longDescription: "Des grands magasins aux marchés traditionnels, trouvez les meilleurs endroits pour vos achats et souvenirs.",
    icon: ShoppingBag,
    color: designSystem.colors.secondary.main,
    bgColor: `${designSystem.colors.secondary.main}10`,
    items: [
      { id: "markets", label: "Marchés Traditionnels" },
      { id: "malls", label: "Centres Commerciaux" },
      { id: "antiques", label: "Antiquités & Artisanat" },
      { id: "electronics", label: "Électronique" },
      { id: "beauty", label: "Cosmétiques & Beauté" },
      { id: "luxury", label: "Boutiques de Luxe" }
    ]
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

export function InterestsStep() {
  const router = useRouter();
  const { updateAnswers, setCurrentStep, answers: savedAnswers } = useQuestionnaireStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mainInterests: [],
      specificInterests: [],
    },
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    if (savedAnswers?.interests) {
      const { mainInterests, specificInterests } = savedAnswers.interests;
      form.reset({
        mainInterests: mainInterests || [],
        specificInterests: specificInterests || []
      });
    }
  }, [savedAnswers, form]);

  const selectedInterests = form.watch('mainInterests');

  const handleInterestToggle = (categoryId: string, itemId: string) => {
    const fullId = `${categoryId}.${itemId}`;
    const currentInterests = form.getValues('mainInterests') || [];
    
    if (currentInterests.includes(fullId)) {
      form.setValue('mainInterests', currentInterests.filter(id => id !== fullId));
    } else {
      form.setValue('mainInterests', [...currentInterests, fullId]);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateAnswers({
      interests: {
        mainInterests: data.mainInterests,
        specificInterests: data.specificInterests || [],
        categories: data.mainInterests.map(id => id.split('.')[0])
      },
    }, 3);
    setCurrentStep(4);
    router.push('/questionnaire/4');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* En-tête */}
          <div className="flex items-center justify-end mb-4">
            <Badge variant="secondary" className="text-sm px-4 py-2 rounded-full">
              Étape 3/5
            </Badge>
          </div>

          {/* Grille des catégories */}
          <div className="grid grid-cols-1 gap-8">
            {interestCategories.map((category) => (
              <motion.div
                key={category.id}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Card 
                  className={cn(
                    "h-full overflow-hidden transition-all duration-300",
                    "border-2 shadow-lg hover:shadow-xl",
                    selectedInterests.some(id => id.startsWith(category.id))
                      ? "border-opacity-100"
                      : "border-opacity-30"
                  )}
                  style={{
                    borderColor: category.color,
                    background: category.bgColor,
                  }}
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        <div
                          className="p-4 rounded-2xl transition-all duration-300 shadow-md"
                          style={{ 
                            backgroundColor: category.bgColor,
                            boxShadow: `0 4px 12px ${category.bgColor}`
                          }}
                        >
                          <category.icon 
                            className="h-8 w-8"
                            style={{ color: category.color }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold" style={{ color: category.color }}>
                            {category.label}
                          </CardTitle>
                          <CardDescription className="mt-2 text-base">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger>
                          <div 
                            className="p-2 rounded-full hover:bg-accent transition-colors"
                            style={{ color: category.color }}
                          >
                            <Info className="h-5 w-5" />
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent 
                          side="top" 
                          align="end"
                          className="w-96 p-6 shadow-lg"
                          style={{ 
                            borderColor: category.color,
                            borderWidth: "2px"
                          }}
                        >
                          <p className="text-sm leading-relaxed">
                            {category.longDescription}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {category.items.map((item) => {
                        const fullId = `${category.id}.${item.id}`;
                        const isSelected = selectedInterests.includes(fullId);

                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            onClick={() => handleInterestToggle(category.id, item.id)}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-xl",
                              "transition-all duration-300 cursor-pointer",
                              "border-2",
                              "hover:shadow-md",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-background hover:bg-accent/50 border-accent/50"
                            )}
                            style={{
                              borderColor: isSelected ? category.color : undefined,
                              background: isSelected 
                                ? `linear-gradient(45deg, ${category.color}, ${category.color}dd)`
                                : undefined
                            }}
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            {isSelected && (
                              <Check className="h-5 w-5 shrink-0" />
                            )}
                            <span className="text-base font-medium">
                              {item.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <motion.div variants={cardVariants} className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/questionnaire/2')}
              className="group px-6 py-3 text-base"
            >
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Retour
            </Button>
            <Button
              type="submit"
              className="group hover:scale-105 transition-all duration-200 px-6 py-3 text-base"
            >
              Suivant
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  );
}