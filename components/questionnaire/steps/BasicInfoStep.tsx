// components/questionnaire/steps/BasicInfoStep.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { addDays } from "date-fns";
import { 
  Users, UserRound, Heart, Home, User, 
  ArrowRight, Calendar,
  Plane,
  Users2,
  Briefcase,
  Baby
} from "lucide-react";
import { useEffect } from "react";

// Types de voyage avec leurs informations complètes
const travelTypes = [
  {
    id: 'solo',
    label: 'Voyage Solo',
    description: 'Explorez le Japon à votre rythme',
    icon: UserRound,
    defaultSize: 1,
    fixedSize: true,
    hasChildren: false
  },
  {
    id: 'couple',
    label: 'Voyage en Couple',
    description: 'Partagez des moments romantiques',
    icon: Heart,
    defaultSize: 2,
    fixedSize: true,
    hasChildren: false
  },
  {
    id: 'friends',
    label: 'Entre Amis',
    description: 'Aventures et découvertes à plusieurs',
    icon: Users2,
    defaultSize: 2,
    fixedSize: false,
    hasChildren: false
  },
  {
    id: 'family',
    label: 'En Famille',
    description: 'Des souvenirs inoubliables en famille',
    icon: Home,
    defaultSize: 3,
    fixedSize: false,
    hasChildren: true
  },
  {
    id: 'group',
    label: 'En Groupe',
    description: 'Voyagez avec votre groupe',
    icon: User,
    defaultSize: 3,
    fixedSize: false,
    hasChildren: true
  },
  {
    id: 'business',
    label: 'Voyage d\'Affaires',
    description: 'Combinez travail et découverte',
    icon: Briefcase,
    defaultSize: 1,
    fixedSize: false,
    hasChildren: false
  }
] as const;

const formSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  previousVisit: z.boolean(),
  visitCount: z.number().optional(),
  groupType: z.enum(['solo', 'couple', 'friends', 'family', 'group', 'business']),
  groupSize: z.number().min(1).max(10),
  hasChildren: z.boolean().optional(),
  childrenCount: z.number().optional(),
});

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

export function BasicInfoStep() {
  const router = useRouter();
  const { updateAnswers, setCurrentStep, answers: savedAnswers } = useQuestionnaireStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateRange: {
        from: addDays(new Date(), 30),
        to: addDays(new Date(), 37),
      },
      previousVisit: false,
      visitCount: 0,
      groupType: 'solo',
      groupSize: 1,
      hasChildren: false,
      childrenCount: 0,
    },
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    if (savedAnswers?.basicInfo) {
      const { dateRange, groupType, groupSize, previousVisit, visitCount, hasChildren, childrenCount } = savedAnswers.basicInfo;
      form.reset({
        dateRange: {
          from: new Date(dateRange.from),
          to: new Date(dateRange.to)
        },
        groupType,
        groupSize,
        previousVisit,
        visitCount,
        hasChildren,
        childrenCount
      });
    }
  }, [savedAnswers, form]);

  const watchGroupType = form.watch('groupType');
  const selectedType = travelTypes.find(type => type.id === watchGroupType);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('Submitting data:', data);
    const duration = Math.ceil(
      (data.dateRange.to.getTime() - data.dateRange.from.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    const childrenCount = data.childrenCount || 0;
    const basicInfoData = {
      basicInfo: {
        duration,
        dateRange: data.dateRange,
        groupSize: data.groupSize,
        previousVisit: data.previousVisit,
        visitCount: data.visitCount,
        groupType: data.groupType,
        hasChildren: childrenCount > 0,
        childrenCount,
      },
    };

    console.log('Saving to store:', basicInfoData);
    await updateAnswers(basicInfoData, 1);

    setCurrentStep(2);
    router.push('/questionnaire/2');
  };

  const watchGroupSize = form.watch('groupSize');

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
          <motion.div variants={cardVariants}>
            <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-3">
              Informations de base
            </h3>
          </motion.div>

          {/* Section Expérience avec le Japon */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="previousVisit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                      <Plane className="h-5 w-5 text-primary" />
                      Êtes-vous déjà allé au Japon ?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value ? 'true' : 'false'}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="yes" />
                          <Label htmlFor="yes">Oui</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="no" />
                          <Label htmlFor="no">Non</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AnimatePresence>
                {form.watch('previousVisit') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <FormField
                      control={form.control}
                      name="visitCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Combien de fois ?</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value || 1]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-[200px]"
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {field.value || 1} fois
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Section Dates */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                      <Calendar className="h-5 w-5 text-primary" />
                      Dates du voyage
                    </FormLabel>
                    <FormControl>
                      <DatePickerWithRange
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Type de Voyage */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormField
                control={form.control}
                name="groupType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      Type de voyage
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {travelTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <motion.div
                              key={type.id}
                              variants={cardVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => {
                                field.onChange(type.id);
                                const selectedType = travelTypes.find(t => t.id === type.id);
                                if (selectedType) {
                                  form.setValue('groupSize', selectedType.defaultSize);
                                  if (!selectedType.hasChildren) {
                                    form.setValue('hasChildren', false);
                                    form.setValue('childrenCount', 0);
                                  }
                                }
                              }}
                              className={`
                                cursor-pointer rounded-xl p-4
                                ${field.value === type.id ? 
                                  'bg-primary text-primary-foreground shadow-lg' : 
                                  'bg-card hover:bg-accent'
                                }
                                transition-colors duration-200
                              `}
                            >
                              <div className="flex flex-col items-center text-center space-y-2">
                                <Icon className={`h-8 w-8 ${field.value === type.id ? 'text-primary-foreground' : 'text-primary'}`} />
                                <h3 className="font-medium">{type.label}</h3>
                                <p className="text-sm opacity-80">{type.description}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Taille du Groupe */}
          {selectedType && !selectedType.fixedSize && (
            <motion.div variants={cardVariants}>
              <Card className="p-6">
                <FormField
                  control={form.control}
                  name="groupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                        <Users2 className="h-5 w-5 text-primary" />
                        Nombre de voyageurs
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={selectedType.defaultSize}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-[200px]"
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        {watchGroupSize} {watchGroupSize > 1 ? 'personnes' : 'personne'}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </motion.div>
          )}

          {/* Section Enfants */}
          {selectedType && selectedType.hasChildren && (
            <motion.div variants={cardVariants}>
              <Card className="p-6">
                <FormField
                  control={form.control}
                  name="childrenCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                        <Baby className="h-5 w-5 text-primary" />
                        Nombre d&apos;enfants
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={5}
                          step={1}
                          value={[field.value || 0]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-[200px]"
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        {field.value || 0} {(field.value || 0) > 1 ? 'enfants' : 'enfant'}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </motion.div>
          )}

          {/* Bouton de soumission */}
          <motion.div variants={cardVariants} className="flex justify-end">
            <Button type="submit" className="w-full md:w-auto">
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  );
}