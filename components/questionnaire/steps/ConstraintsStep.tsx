// components/questionnaire/steps/ConstraintsStep.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormDescription, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  UtensilsCrossed,
  Languages,
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Banknote,
  Plane,
  Target,
  Hotel,
  Utensils,
  Ticket
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
// Configuration des niveaux de budget
const budgetRanges = {
  travelBudget: {
    undecided: "Je déciderai plus tard",
    low: "< 1500€",
    medium: "1500€ - 2500€",
    high: "2500€ - 4000€",
    higher: "> 4000€"
  },
  dailyBudget: {
    undecided: "Je déciderai plus tard",
    low: "< 100€/jour",
    medium: "100€ - 200€/jour",
    high: "200€ - 300€/jour",
    higher: "> 300€/jour"
  }
} as const;

// Configuration des restrictions alimentaires
const dietaryRestrictions = [
  { id: "none", label: "Aucune restriction", emoji: "✓", isDefault: true },
  { id: "vegetarian", label: "Végétarien", description: "Pas de viande", emoji: "🥬", isDefault: false },
  { id: "vegan", label: "Végétalien", description: "Aucun produit animal", emoji: "🌱", isDefault: false },
  { id: "halal", label: "Halal", description: "Selon les règles alimentaires islamiques", emoji: "🌙", isDefault: false },
  { id: "kosher", label: "Casher", description: "Selon les règles alimentaires juives", emoji: "✡️", isDefault: false },
  { id: "gluten-free", label: "Sans gluten", description: "Pas de blé, seigle, orge", emoji: "🌾", isDefault: false },
  { id: "lactose-free", label: "Sans lactose", description: "Pas de produits laitiers", emoji: "🥛", isDefault: false }
] as const;

// Configuration des niveaux de langue
const languageLevels = [
  {
    id: "none",
    label: "Aucune connaissance",
    description: "Je ne parle pas japonais",
    examples: ["Première fois", "Besoin de guides en français"]
  },
  {
    id: "basic",
    label: "Notions de base",
    description: "Je connais quelques mots et expressions",
    examples: ["Salutations", "Chiffres", "Phrases simples"]
  },
  {
    id: "intermediate",
    label: "Niveau intermédiaire",
    description: "Je peux tenir une conversation simple",
    examples: ["Commander au restaurant", "Demander son chemin"]
  },
  {
    id: "fluent",
    label: "Courant",
    description: "Je parle couramment japonais",
    examples: ["Conversations élaborées", "Lecture des kanji"]
  }
] as const;

// Schéma de validation
const formSchema = z.object({
  travelBudget: z.enum(['undecided', 'low', 'medium', 'high', 'higher']),
  dailyBudget: z.enum(['undecided', 'low', 'medium', 'high', 'higher']),
  mobility: z.boolean(),
  language: z.enum(['none', 'basic', 'intermediate', 'fluent']),
  dietary: z.array(z.string()).default([]),
  budgetPriority: z.enum(['accommodation', 'food', 'activities', 'undecided']),
});

// Animations
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
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

export function ConstraintsStep() {
  const router = useRouter();
  const { updateAnswers, setCurrentStep, answers: savedAnswers } = useQuestionnaireStore();

  // Initialisation du formulaire avec des valeurs par défaut
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      travelBudget: 'undecided',
      dailyBudget: 'undecided',
      mobility: false,
      language: 'none',
      dietary: ['none'],
      budgetPriority: 'undecided',
    },
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    if (savedAnswers?.constraints) {
      const { travelBudget, dailyBudget, mobility, language, dietary, budgetPriority } = savedAnswers.constraints;
      form.reset({
        travelBudget: travelBudget as "undecided" | "low" | "medium" | "high" | "higher",
        dailyBudget: dailyBudget as "undecided" | "low" | "medium" | "high" | "higher",
        mobility,
        language: language as "none" | "basic" | "intermediate" | "fluent",
        dietary: dietary || ['none'],
        budgetPriority: budgetPriority as "accommodation" | "food" | "activities" | "undecided"
      });
    }
  }, [savedAnswers, form]);

  // Soumission du formulaire
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateAnswers({
      constraints: {
        travelBudget: data.travelBudget,
        dailyBudget: data.dailyBudget,
        mobility: data.mobility,
        language: data.language,
        dietary: data.dietary,
        budgetPriority: data.budgetPriority || 'undecided',
      },
    }, 4);

    setCurrentStep(5);
    router.push('/questionnaire/5');
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
              Étape 4/5
            </Badge>
          </div>

          {/* Section Budget */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                <Wallet className="h-5 w-5 text-primary" />
                
                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md font-semibold border border-red-200 shadow-sm">
                  Budget / Personne
                </span>
              </FormLabel>
              
              {/* Budget Voyage */}
              <div className="space-y-6 mb-8">
                <FormField
                  control={form.control}
                  name="travelBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base flex items-center gap-2">
                        <Plane className="h-5 w-5 text-primary" />
                        Voyage (Avion + Hôtel + Déplacements)
                      </FormLabel>
                      <FormDescription>
                        Budget total pour l&apos;ensemble du séjour, hors dépenses quotidiennes
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {Object.entries(budgetRanges.travelBudget).map(([value, label]) => (
                          <div
                            key={value}
                            onClick={() => field.onChange(value)}
                            className={`
                              p-4 rounded-lg cursor-pointer
                              ${field.value === value ? 
                                'bg-primary/10 border-2 border-primary' : 
                                'bg-card hover:bg-accent border-2 border-transparent'}
                              transition-colors duration-200
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {value === 'undecided' ? (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Wallet className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>{label}</span>
                              </div>
                              {field.value === value && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Quotidien */}
              <FormField
                control={form.control}
                name="dailyBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-primary" />
                      Dépenses quotidiennes
                    </FormLabel>
                    <FormDescription>
                      Budget journalier pour les repas, activités et achats
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {Object.entries(budgetRanges.dailyBudget).map(([value, label]) => (
                        <div
                          key={value}
                          onClick={() => field.onChange(value)}
                          className={`
                            p-4 rounded-lg cursor-pointer
                            ${field.value === value ? 
                              'bg-primary/10 border-2 border-primary' : 
                              'bg-card hover:bg-accent border-2 border-transparent'}
                            transition-colors duration-200
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {value === 'undecided' ? (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{label}</span>
                            </div>
                            {field.value === value && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priorité Budget */}
              <FormField
                control={form.control}
                name="budgetPriority"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Priorité budgétaire
                    </FormLabel>
                    <FormDescription>
                      Sur quoi souhaitez-vous mettre l&apos;accent dans votre budget ?
                    </FormDescription>
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      <div
                        onClick={() => field.onChange('undecided')}
                        className={`
                          p-4 rounded-lg cursor-pointer
                          ${field.value === 'undecided' ? 
                            'bg-primary/10 border-2 border-primary' : 
                            'bg-card hover:bg-accent border-2 border-transparent'}
                          transition-colors duration-200
                        `}
                      >
                        <div className="flex items-center justify-center">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Je déciderai plus tard</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          onClick={() => field.onChange('accommodation')}
                          className={`
                            p-4 rounded-lg cursor-pointer
                            ${field.value === 'accommodation' ? 
                              'bg-primary/10 border-2 border-primary' : 
                              'bg-card hover:bg-accent border-2 border-transparent'}
                            transition-colors duration-200
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Hotel className="h-4 w-4 text-muted-foreground" />
                              <span>Hébergement</span>
                            </div>
                            {field.value === 'accommodation' && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <div
                          onClick={() => field.onChange('food')}
                          className={`
                            p-4 rounded-lg cursor-pointer
                            ${field.value === 'food' ? 
                              'bg-primary/10 border-2 border-primary' : 
                              'bg-card hover:bg-accent border-2 border-transparent'}
                            transition-colors duration-200
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Utensils className="h-4 w-4 text-muted-foreground" />
                              <span>Restauration</span>
                            </div>
                            {field.value === 'food' && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        <div
                          onClick={() => field.onChange('activities')}
                          className={`
                            p-4 rounded-lg cursor-pointer
                            ${field.value === 'activities' ? 
                              'bg-primary/10 border-2 border-primary' : 
                              'bg-card hover:bg-accent border-2 border-transparent'}
                            transition-colors duration-200
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Ticket className="h-4 w-4 text-muted-foreground" />
                              <span>Activités</span>
                            </div>
                            {field.value === 'activities' && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Régime Alimentaire */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="dietary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                      Régime alimentaire et restrictions
                    </FormLabel>
                    
                    {/* Option "Aucune restriction" séparée */}
                    <div className="mb-4">
                      <div 
                        className={`
                          flex items-center space-x-2 p-4 rounded-lg cursor-pointer border-primary border-2
                          ${field.value.includes('none') ?
                            'bg-primary/10 border-2 border-primary' :
                            'hover:bg-accent border-2 border-transparent'}
                          transition-colors duration-200
                        `}
                        onClick={() => {
                          if (field.value.includes('none')) {
                            field.onChange([]);
                          } else {
                            field.onChange(['none']);
                          }
                        }}
                      >
                        <Check className="h-5 w-5 text-primary" />
                        <Label className="font-medium cursor-pointer">Aucune restriction</Label>
                      </div>
                    </div>

                    {/* Autres restrictions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dietaryRestrictions.filter(r => !r.isDefault).map((restriction) => (
                        <div
                          key={restriction.id}
                          className={`
                            p-4 rounded-lg cursor-pointer
                            ${field.value.includes(restriction.id) ?
                              'border-primary border-2 bg-primary/5' :
                              'border-transparent hover:bg-accent'}
                            transition-colors duration-200
                          `}
                          onClick={() => {
                            const newValue = field.value.includes(restriction.id)
                              ? field.value.filter(v => v !== restriction.id)
                              : [...field.value.filter(v => v !== 'none'), restriction.id];
                            field.onChange(newValue);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{restriction.emoji}</span>
                              <Label className="font-medium cursor-pointer mt-1">{restriction.label}</Label>
                            </div>
                            {field.value.includes(restriction.id) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Niveau de Japonais */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-6">
                      <Languages className="h-5 w-5 text-primary" />
                      Niveau en japonais
                    </FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {languageLevels.map((level) => (
                        <div
                          key={level.id}
                          onClick={() => field.onChange(level.id)}
                          className={`
                            p-4 rounded-lg cursor-pointer
                            ${field.value === level.id ?
                              'bg-primary/10 border-2 border-primary' :
                              'bg-card hover:bg-accent border-2 border-transparent'}
                            transition-colors duration-200
                          `}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{level.label}</h4>
                              {field.value === level.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {level.description}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <ul className="list-disc list-inside space-y-1">
                                {level.examples.map((example, index) => (
                                  <li key={index}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Mobilité Réduite */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="mobility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Accessibility className="h-5 w-5 text-primary" />
                        Mobilité Réduite
                      </FormLabel>
                      <FormDescription>
                        Cochez cette case si vous avez des besoins spécifiques en termes d&apos;accessibilité
                      </FormDescription>
                    </div>
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
              onClick={() => router.push('/questionnaire/3')}
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