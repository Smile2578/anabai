// components/questionnaire/steps/TravelStyleStep.tsx
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
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { 
  Activity,
  Hotel,
  ArrowLeft,
  ArrowRight,
  Building,
  Scale,
  Mountain,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";

const travelStyleSchema = z.object({
  pace: z.enum(['relaxed', 'moderate', 'intensive'], {
    required_error: "Veuillez choisir un rythme de voyage",
  }),
  comfort: z.enum(['budget', 'standard', 'luxury'], {
    required_error: "Veuillez choisir un niveau de confort",
  }),
  flexibility: z.number().min(0).max(100),
  culturalImmersion: z.number().min(0).max(100),
});

type TravelStyleValues = z.infer<typeof travelStyleSchema>;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 }
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

export function TravelStyleStep() {
  const router = useRouter();
  const { answers, updateAnswers } = useQuestionnaireStore();
  
  const form = useForm<TravelStyleValues>({
    resolver: zodResolver(travelStyleSchema),
    defaultValues: {
      pace: answers.travelStyle?.pace || 'moderate',
      comfort: answers.travelStyle?.comfort || 'standard',
      flexibility: answers.travelStyle?.flexibility || 50,
      culturalImmersion: answers.travelStyle?.culturalImmersion || 50,
    },
  });

  const onSubmit = async (values: TravelStyleValues) => {
    updateAnswers({
      travelStyle: values,
    });
    router.push('/questionnaire/3');
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
          <Scale className="h-6 w-6" />
          Style de voyage
        </h2>
        <p className="text-secondary">
          Définissez vos préférences pour un voyage qui vous correspond parfaitement
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pace"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          <FormLabel className="text-lg font-medium">Rythme du voyage</FormLabel>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Sélectionnez un rythme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="relaxed">
                              <span className="flex items-center gap-2">
                                🌿 Détendu
                              </span>
                            </SelectItem>
                            <SelectItem value="moderate">
                              <span className="flex items-center gap-2">
                                ⚖️ Modéré
                              </span>
                            </SelectItem>
                            <SelectItem value="intensive">
                              <span className="flex items-center gap-2">
                                ⚡ Intensif
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choisissez le rythme qui correspond le mieux à votre style de voyage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comfort"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Hotel className="h-5 w-5 text-primary" />
                          <FormLabel className="text-lg font-medium">Niveau de confort</FormLabel>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Sélectionnez un niveau de confort" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="budget">
                              <span className="flex items-center gap-2">
                                🎒 Budget
                              </span>
                            </SelectItem>
                            <SelectItem value="standard">
                              <span className="flex items-center gap-2">
                                🏡 Standard
                              </span>
                            </SelectItem>
                            <SelectItem value="luxury">
                              <span className="flex items-center gap-2">
                                ✨ Luxe
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="flexibility"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <FormLabel className="text-lg font-medium">Flexibilité du planning</FormLabel>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="pt-4"
                          defaultValue={[field.value]}
                        />
                      </FormControl>
                      <div className="flex justify-between text-sm text-secondary">
                        <span>Planning fixe</span>
                        <span className="font-medium text-primary">{field.value}%</span>
                        <span>Totalement flexible</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="culturalImmersion"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Mountain className="h-5 w-5 text-primary" />
                        <FormLabel className="text-lg font-medium">Immersion culturelle</FormLabel>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="pt-4"
                          defaultValue={[field.value]}
                        />
                      </FormControl>
                      <div className="flex justify-between text-sm text-secondary">
                        <span>Tourisme classique</span>
                        <span className="font-medium text-primary">{field.value}%</span>
                        <span>Immersion totale</span>
                      </div>
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
              onClick={() => router.push('/questionnaire/1')}
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