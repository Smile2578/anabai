// components/questionnaire/steps/TravelStyleStep.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { 
  Hotel, Map, Compass, ArrowLeft, ArrowRight, Castle, Tent, Building2, Clock, Timer, Zap
} from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
// Nous définissons d'abord les différents niveaux de confort avec leurs détails
const comfortLevels = [
  {
    id: 'backpacker',
    label: 'Économique',
    icon: Tent,
    description: 'Auberges de jeunesse, guesthouses et hébergements simples',
    examples: ['Dortoirs', 'Hotels capsules', 'Airbnb partagés'],
    color: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'standard',
    label: 'Standard',
    icon: Building2,
    description: 'Un bon équilibre entre confort et budget',
    examples: ['Business hotels', 'Ryokans simples', 'Airbnb privés'],
    color: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'comfort',
    label: 'Confort',
    icon: Hotel,
    description: 'Des hébergements de qualité supérieure',
    examples: ['Hôtels 4★', 'Ryokans traditionnels', 'Boutique hotels'],
    color: 'bg-purple-100 dark:bg-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'luxury',
    label: 'Luxe',
    icon: Castle,
    description: 'Le meilleur du Japon',
    examples: ['Hôtels 5★', 'Ryokans de luxe', 'Séjours exclusifs'],
    color: 'bg-amber-100 dark:bg-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
] as const;

// Nous définissons les différents rythmes de voyage avec leurs détails
const paceOptions = [
  {
    id: 'slow',
    label: 'Rythme tranquille',
    icon: Clock,
    description: 'Profitez pleinement de chaque endroit',
    examples: ['2-3 activités/quartiers par jour', 'Temps libre pour explorer', 'Pauses fréquentes'],
    color: 'bg-emerald-100 dark:bg-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'moderate',
    label: 'Rythme modéré',
    icon: Timer,
    description: 'Un équilibre entre activités et repos',
    examples: ['3-4 activités/quartiers par jour', 'Quelques temps libres', 'Pauses régulières'],
    color: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'fast',
    label: 'Rythme soutenu',
    icon: Zap,
    description: 'Maximisez vos découvertes',
    examples: ['4-5 activités/quartiers par jour', 'Planning optimisé', 'Journées bien remplies'],
    color: 'bg-orange-100 dark:bg-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
] as const;

// Schéma de validation avec des descriptions explicites
const formSchema = z.object({
  comfort: z.enum(['backpacker', 'standard', 'comfort', 'luxury']),
  flexibility: z.number().min(0).max(100),
  culturalImmersion: z.number().min(0).max(100),
  pace: z.enum(['slow', 'moderate', 'fast']).default('moderate'),
  preferences: z.array(z.string()).default([])
});

// Définition des animations des cartes
const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98
  }
};

export function TravelStyleStep() {
  const router = useRouter();
  const { updateAnswers, setCurrentStep, answers: savedAnswers } = useQuestionnaireStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comfort: 'standard',
      flexibility: 50,
      culturalImmersion: 50,
      pace: 'moderate',
      preferences: []
    },
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    if (savedAnswers?.travelStyle) {
      const { comfort, flexibility, culturalImmersion, pace, preferences } = savedAnswers.travelStyle;
      form.reset({
        comfort: comfort as "backpacker" | "standard" | "comfort" | "luxury",
        flexibility,
        culturalImmersion,
        pace: pace as "slow" | "moderate" | "fast",
        preferences: preferences || []
      });
    }
  }, [savedAnswers, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    updateAnswers({
      travelStyle: {
        comfort: data.comfort,
        flexibility: data.flexibility,
        culturalImmersion: data.culturalImmersion,
        pace: data.pace,
        preferences: data.preferences || [],
      },
    }, 2);

    setCurrentStep(3);
    router.push('/questionnaire/3');
  };

  // Fonction utilitaire pour obtenir le label du niveau de flexibilité
  const getFlexibilityLabel = (value: number) => {
    if (value <= 25) return "Planning très structuré";
    if (value <= 50) return "Quelques plages de liberté";
    if (value <= 75) return "Planning flexible";
    return "Totalement libre";
  };

  // Fonction utilitaire pour obtenir le label du niveau d'immersion
  const getImmersionLabel = (value: number) => {
    if (value <= 25) return "Découverte classique";
    if (value <= 50) return "Mix tourisme-local";
    if (value <= 75) return "Immersion partielle";
    return "Immersion totale";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-8"
        >
           {/* En-tête */}
           <div className="flex items-center justify-end mb-4">
            <Badge variant="secondary" className="text-sm px-4 py-2 rounded-full">
              Étape 2/5
            </Badge>
          </div>
          
          {/* Section Niveau de Confort */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="comfort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                      <Hotel className="h-5 w-5 text-primary" />
                      Niveau de Confort Souhaité
                    </FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comfortLevels.map((level) => {
                        const Icon = level.icon;
                        const isSelected = field.value === level.id;

                        return (
                          <motion.div
                            key={level.id}
                            variants={cardVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => field.onChange(level.id)}
                            className={`
                              cursor-pointer rounded-xl p-6
                              ${level.color}
                              ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                              transition-all duration-200
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <Icon className={`h-8 w-8 ${level.iconColor}`} />
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{level.label}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {level.description}
                                </p>
                                <ul className="text-xs text-muted-foreground">
                                  {level.examples.map((example, index) => (
                                    <li key={index}>• {example}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Rythme de Voyage */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="pace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                      <Timer className="h-5 w-5 text-primary" />
                      Rythme de Voyage
                    </FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {paceOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.value === option.id;

                        return (
                          <motion.div
                            key={option.id}
                            variants={cardVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => field.onChange(option.id)}
                            className={`
                              cursor-pointer rounded-xl p-6
                              ${option.color}
                              ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                              transition-all duration-200
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <Icon className={`h-8 w-8 ${option.iconColor}`} />
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{option.label}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {option.description}
                                </p>
                                <ul className="text-xs text-muted-foreground">
                                  {option.examples.map((example, index) => (
                                    <li key={index}>• {example}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Flexibilité */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="flexibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                      <Map className="h-5 w-5 text-primary" />
                      Flexibilité du Planning
                    </FormLabel>
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {getFlexibilityLabel(field.value)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {field.value <= 50 ? 
                            "Nous planifierons votre voyage en détail" :
                            "Vous aurez plus de liberté pour explorer"
                          }
                        </p>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Planning détaillé</span>
                        <span>Planning libre</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Immersion Culturelle */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="culturalImmersion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                      <Compass className="h-5 w-5 text-primary" />
                      Niveau d&apos;Immersion Culturelle
                    </FormLabel>
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {getImmersionLabel(field.value)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {field.value <= 50 ? 
                            "Focus sur les expériences touristiques classiques" :
                            "Découverte approfondie de la culture japonaise"
                          }
                        </p>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="py-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tourisme classique</span>
                        <span>Immersion totale</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Boutons de Navigation */}
          <motion.div variants={cardVariants} className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/questionnaire/1')}
              className="group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Précédent
            </Button>
            <Button
              type="submit"
              className="group hover:scale-105 transition-all duration-200"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  );
}