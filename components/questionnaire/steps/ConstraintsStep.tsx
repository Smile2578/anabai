// components/questionnaire/steps/ConstraintsStep.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Euro,
  Languages,
  Utensils,
  Accessibility,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";

const budgetOptions = [
  { value: 'undefined', label: 'Non défini' },
  { value: '2500', label: '2500 €' },
  { value: '5000', label: '5000 €' },
  { value: '7500', label: '7500+ €' },
] as const;

const dailyBudgetOptions = [
  { value: 'undefined', label: 'Non défini' },
  { value: '100', label: '100 €' },
  { value: '200', label: '200 €' },
  { value: '300', label: '300+ €' },
] as const;

const constraintsSchema = z.object({
  budget: z.object({
    total: z.enum(['undefined', '2500', '5000', '7500']),
    dailyLimit: z.enum(['undefined', '100', '200', '300']),
    priority: z.enum(['accommodation', 'food', 'activities', 'undefined'], {
      required_error: "Veuillez sélectionner une priorité budgétaire",
    }),
  }),
  constraints: z.object({
    dietary: z.array(z.string()).optional(),
    mobility: z.boolean().default(false),
    language: z.enum(['none', 'basic', 'intermediate', 'fluent'], {
      required_error: "Veuillez sélectionner votre niveau de japonais",
    }),
  }),
});

type ConstraintsValues = z.infer<typeof constraintsSchema>;

const dietaryOptions = [
  { id: 'vegetarian', label: 'Végétarien', icon: '🥗' },
  { id: 'vegan', label: 'Végétalien', icon: '🌱' },
  { id: 'halal', label: 'Halal', icon: '🍖' },
  { id: 'kosher', label: 'Kasher', icon: '✡️' },
  { id: 'gluten-free', label: 'Sans gluten', icon: '🌾' },
  { id: 'lactose-free', label: 'Sans lactose', icon: '🥛' },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

export function ConstraintsStep() {
  const router = useRouter();
  const { answers, updateAnswers } = useQuestionnaireStore();
  
  const form = useForm<ConstraintsValues>({
    resolver: zodResolver(constraintsSchema),
    defaultValues: {
      budget: {
        total: answers.budget?.total?.toString() as any || 'undefined',
        dailyLimit: answers.budget?.dailyLimit?.toString() as any || 'undefined',
        priority: answers.budget?.priority || 'undefined',
      },
      constraints: {
        dietary: answers.constraints?.dietary || [],
        mobility: answers.constraints?.mobility || false,
        language: answers.constraints?.language || 'none',
      },
    },
  });

  const onSubmit = async (values: ConstraintsValues) => {
    updateAnswers({
      budget: {
        ...values.budget,
        total: values.budget.total === 'undefined' ? 0 : parseInt(values.budget.total),
        dailyLimit: values.budget.dailyLimit === 'undefined' ? 0 : parseInt(values.budget.dailyLimit),
        priority: values.budget.priority === 'undefined' ? 'accommodation' : values.budget.priority,
      },
      constraints: values.constraints,
    });
    router.push('/questionnaire/5');
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Budget et Contraintes
        </h2>
        <p className="text-secondary">
          Définissez vos préférences budgétaires et besoins spécifiques
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Budget
                </h3>
                
                <FormField
                  control={form.control}
                  name="budget.total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget total par personne</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget.dailyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget journalier par personne</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un budget journalier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dailyBudgetOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget.priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité budgétaire</FormLabel>
                      <FormDescription>
                        Sur quoi souhaitez-vous mettre l&apos;accent dans votre budget ?
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisissez une priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="undefined">Peu importe</SelectItem>
                          <SelectItem value="accommodation">Hébergement</SelectItem>
                          <SelectItem value="food">Nourriture</SelectItem>
                          <SelectItem value="activities">Activités</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Régimes alimentaires
                </h3>

                <FormField
                  control={form.control}
                  name="constraints.dietary"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-4">
                        {dietaryOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="constraints.dietary"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), option.id]
                                        : field.value?.filter((value) => value !== option.id);
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-secondary">
                                  {option.icon} {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Accessibilité
                </h3>

                <FormField
                  control={form.control}
                  name="constraints.mobility"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Mobilité réduite
                        </FormLabel>
                        <FormDescription>
                          Cochez cette case si vous avez besoin d&apos;accès adaptés
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Langue
                </h3>

                <FormField
                  control={form.control}
                  name="constraints.language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau de japonais</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucune connaissance</SelectItem>
                          <SelectItem value="basic">Notions de base</SelectItem>
                          <SelectItem value="intermediate">Niveau intermédiaire</SelectItem>
                          <SelectItem value="fluent">Courant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="flex justify-between gap-4 pt-4"
            variants={itemVariants}
          >
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
              className="group"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}