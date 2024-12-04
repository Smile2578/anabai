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
  travelType: z.enum(['solo', 'couple', 'friends', 'family', 'group', 'business']),
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
      travelType: 'solo',
      groupSize: 1,
      hasChildren: false,
      childrenCount: 0,
    },
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    if (savedAnswers?.basicInfo) {
      const { dateRange, travelType, groupSize, previousVisit, visitCount, hasChildren, childrenCount } = savedAnswers.basicInfo;
      form.reset({
        dateRange: {
          from: new Date(dateRange.from),
          to: new Date(dateRange.to)
        },
        travelType: travelType as "solo" | "couple" | "friends" | "family" | "group" | "business",
        groupSize,
        previousVisit,
        visitCount,
        hasChildren,
        childrenCount
      });
    }
  }, [savedAnswers, form]);

  const watchTravelType = form.watch('travelType');
  const selectedType = travelTypes.find(type => type.id === watchTravelType);

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
        groupType: data.travelType,
        travelType: data.travelType,
        hasChildren: childrenCount > 0,
        childrenCount,
      },
    };

    console.log('Saving to store:', basicInfoData);
    await updateAnswers(basicInfoData, 1);

    setCurrentStep(2);
    router.push('/questionnaire/2');
  };

  const handleTravelTypeChange = (type: string) => {
    const selectedType = travelTypes.find(t => t.id === type);
    if (selectedType) {
      form.setValue('travelType', type as 'solo' | 'couple' | 'friends' | 'family' | 'group' | 'business');
      form.setValue('groupSize', selectedType.defaultSize);
      if (!selectedType.hasChildren) {
        form.setValue('hasChildren', false);
        form.setValue('childrenCount', 0);
      }
    }
  };

  const watchGroupSize = form.watch('groupSize');

  // Ajout d'un useEffect pour le debug
  useEffect(() => {
    console.log('🔄 BasicInfoStep monté avec savedAnswers:', savedAnswers);
  }, [savedAnswers]);

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
                          <FormLabel className="text-sm font-medium">
                            Combien de fois ?
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Slider
                                min={1}
                                max={4}
                                step={1}
                                value={[field.value || 1]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="mt-6 cursor-grab active:cursor-grabbing"
                              />
                              <div className="flex justify-between text-sm text-secondary px-1">
                                <span>1 fois</span>
                                <span>2 fois</span>
                                <span>3 fois</span>
                                <span>4+ fois</span>
                              </div>
                            </div>
                          </FormControl>
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
                    <DatePickerWithRange
                      date={field.value}
                      setDate={(newDate) => field.onChange(newDate)}
                      minDate={addDays(new Date(), 7)} // Minimum 1 semaine à l'avance
                      maxDate={addDays(new Date(), 365)} // Maximum 1 an à l'avance
                      numberOfMonths={2}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </motion.div>

          {/* Section Type de voyage */}
          <motion.div variants={cardVariants}>
            <Card className="p-6">
              <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                <Users className="h-5 w-5 text-primary" />
                Type de voyage
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {travelTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = watchTravelType === type.id;

                  return (
                    <motion.div
                      key={type.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => handleTravelTypeChange(type.id)}
                      className={`
                        cursor-pointer rounded-xl p-4
                        ${isSelected ? 
                          'bg-primary text-primary-foreground shadow-lg' : 
                          'bg-card hover:bg-accent'
                        }
                        transition-colors duration-200
                      `}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Icon className={`h-8 w-8 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                        <h3 className="font-medium">{type.label}</h3>
                        <p className="text-sm opacity-80">{type.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Section Taille du groupe (conditionnelle) */}
          {selectedType && !selectedType.fixedSize && (
            <AnimatePresence mode="wait">
              <motion.div
                key={watchTravelType}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Card className="p-6">
                  <FormField
                    control={form.control}
                    name="groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                          <User className="h-5 w-5 text-primary" />
                          Nombre de voyageurs
                        </FormLabel>
                        <div className="space-y-4">
                          <Slider
                            min={selectedType.defaultSize}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="cursor-grab active:cursor-grabbing"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground px-1">
                            <span className="text-secondary">Sélectionné : {field.value} personne{field.value > 1 ? 's' : ''}</span>
                            <span className="text-red-500">Maximum : 10 personnes</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Section Nombre d'enfants (conditionnelle) */}
          {selectedType?.hasChildren && (
            <AnimatePresence mode="wait">
              <motion.div
                key="children-slider"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Card className="p-6">
                  <FormField
                    control={form.control}
                    name="childrenCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-lg font-medium mb-4">
                          <Baby className="h-5 w-5 text-primary" />
                          Nombre d&apos;enfants parmi les {watchGroupSize} voyageurs
                        </FormLabel>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={6}
                            step={1}
                            value={[field.value || 0]}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="cursor-grab active:cursor-grabbing"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground px-1">
                            <span className="text-secondary">Sélectionné : {field.value || 0} enfant{(field.value || 0) > 1 ? 's' : ''}</span>
                            <span className="text-red-500">Maximum : 6 enfants</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Section Navigation */}
          <motion.div variants={cardVariants} className="flex justify-between pt-4">
            <div className="flex justify-end w-full">
              <Button
                type="submit"
                className="group hover:scale-105 transition-all duration-200"
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </form>
    </Form>
  );
}