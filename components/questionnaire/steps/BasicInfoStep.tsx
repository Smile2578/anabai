// components/questionnaire/steps/BasicInfoStep.tsx
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
import { CalendarClock, Users, Plane, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";
import { motion } from "framer-motion";
import { z } from "zod";

const basicInfoSchema = z.object({
  startDate: z.date({
    required_error: "La date de départ est requise",
  }),
  duration: z.number().min(1, "La durée est requise").max(30, "Maximum 30 jours"),
  groupSize: z.number().min(1, "Minimum 1 personne").max(20, "Maximum 20 personnes"),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

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

export function BasicInfoStep() {
  const router = useRouter();
  const { answers, updateAnswers } = useQuestionnaireStore();
  
  const form = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      startDate: answers.basicInfo?.startDate ? new Date(answers.basicInfo.startDate) : undefined,
      duration: answers.basicInfo?.duration || 14,
      groupSize: answers.basicInfo?.groupSize || 1,
    },
  });

  const onSubmit = async (values: BasicInfoValues) => {
    const endDate = new Date(values.startDate);
    endDate.setDate(endDate.getDate() + values.duration - 1);
    
    updateAnswers({
      basicInfo: {
        startDate: values.startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: values.duration,
        groupSize: values.groupSize,
      },
    });
    router.push('/questionnaire/2');
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="space-y-2">
        <h2 className="text-2xl font-bold text-primary">Informations de base</h2>
        <p className="text-secondary">
          Commençons par les informations essentielles de votre voyage
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-primary" />
                    <FormLabel className="text-lg font-medium">Date de départ souhaitée</FormLabel>
                  </div>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Sélectionnez une date approximative de départ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    <FormLabel className="text-lg font-medium">Durée du voyage</FormLabel>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="pt-4"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-secondary">
                    <span>1 jour</span>
                    <span className="font-medium text-primary">{field.value} jours</span>
                    <span>30 jours</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="groupSize"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <FormLabel className="text-lg font-medium">Nombre de voyageurs</FormLabel>
                  </div>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="pt-4"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-secondary">
                    <span>1 personne</span>
                    <span className="font-medium text-primary">{field.value} personne{field.value > 1 ? 's' : ''}</span>
                    <span>10 personnes</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex justify-end pt-4"
          >
            <Button 
              type="submit"
              className="group hover:scale-105 transition-all duration-200"
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