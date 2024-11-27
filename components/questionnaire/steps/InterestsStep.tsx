// components/questionnaire/steps/InterestsStep.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  LandmarkIcon, 
  TreePine, 
  Utensils, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown
} from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Liste des catégories avec leurs icônes associées
const interestCategories = [
  {
    id: "culture",
    name: "Culture & Histoire",
    description: "Temples, musées, sites historiques",
    icon: LandmarkIcon,
    subcategories: [
      { id: "temples", label: "Temples et sanctuaires" },
      { id: "museums", label: "Musées" },
      { id: "historical-sites", label: "Sites historiques" },
      { id: "traditional-arts", label: "Arts traditionnels" }
    ]
  },
  {
    id: "nature",
    name: "Nature & Paysages",
    description: "Parcs, jardins, montagnes, forêts",
    icon: TreePine,
    subcategories: [
      { id: "parks", label: "Parcs nationaux" },
      { id: "gardens", label: "Jardins japonais" },
      { id: "mountains", label: "Montagnes" },
      { id: "forests", label: "Forêts" }
    ]
  },
  {
    id: "food",
    name: "Gastronomie",
    description: "Restaurants, marchés, cours de cuisine",
    icon: Utensils,
    subcategories: [
      { id: "restaurants", label: "Restaurants traditionnels" },
      { id: "street-food", label: "Street food" },
      { id: "markets", label: "Marchés locaux" },
      { id: "cooking-classes", label: "Cours de cuisine" }
    ]
  },
  {
    id: "modern",
    name: "Japon Moderne",
    description: "Technologies, pop culture, shopping",
    icon: ShoppingBag,
    subcategories: [
      { id: "technology", label: "Quartiers technologiques" },
      { id: "anime", label: "Culture manga & anime" },
      { id: "shopping", label: "Shopping moderne" },
      { id: "entertainment", label: "Divertissement" }
    ]
  },
  {
    id: "experiences",
    name: "Expériences Uniques",
    description: "Activités traditionnelles, ateliers, festivals",
    icon: Sparkles,
    subcategories: [
      { id: "workshops", label: "Ateliers traditionnels" },
      { id: "festivals", label: "Festivals locaux" },
      { id: "tea-ceremony", label: "Cérémonie du thé" },
      { id: "ryokan", label: "Séjour en ryokan" }
    ]
  }
] as const;

type SubcategoryId = typeof interestCategories[number]['subcategories'][number]['id'];

const interestSchema = z.object({
  mainInterests: z.array(z.string()).min(1, "Sélectionnez au moins une catégorie"),
  subcategories: z.array(z.string()),
});

type InterestsValues = z.infer<typeof interestSchema>;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
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

export function InterestsStep() {
  const router = useRouter();
  const { answers, updateAnswers } = useQuestionnaireStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const form = useForm<InterestsValues>({
    resolver: zodResolver(interestSchema),
    defaultValues: {
      mainInterests: answers.interests?.mainInterests || [],
      subcategories: answers.interests?.subcategories || [],
    },
  });

  const mainInterests = form.watch('mainInterests');
  const subcategories = form.watch('subcategories');

  const handleCardClick = (categoryId: string, event: React.MouseEvent) => {
    // Empêcher la propagation si on clique sur une checkbox
    if ((event.target as HTMLElement).closest('.checkbox-container')) {
      return;
    }

    const currentInterests = form.getValues('mainInterests');
    if (!currentInterests.includes(categoryId)) {
      form.setValue('mainInterests', [...currentInterests, categoryId]);
      if (!expandedCategories.includes(categoryId)) {
        setExpandedCategories([...expandedCategories, categoryId]);
      }
    } else {
      // Si on désélectionne une catégorie, on retire aussi ses sous-catégories
      const categorySubcategories = interestCategories
        .find(cat => cat.id === categoryId)
        ?.subcategories.map(sub => sub.id) || [];
      
      const newSubcategories = subcategories.filter(
        (sub) => !categorySubcategories.includes(sub as SubcategoryId)
      );
      
      form.setValue('mainInterests', currentInterests.filter(id => id !== categoryId));
      form.setValue('subcategories', newSubcategories);
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    }
  };

  const toggleExpand = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const onSubmit = async (values: InterestsValues) => {
    updateAnswers({
      interests: values,
    });
    router.push('/questionnaire/4');
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div>
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Centres d&apos;intérêt
        </h2>
        <p className="text-secondary mt-2">
          Sélectionnez ce qui vous intéresse le plus au Japon pour un voyage personnalisé
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="mainInterests"
            render={() => (
              <FormItem className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {interestCategories.map((category) => {
                    const isSelected = mainInterests.includes(category.id);
                    const isExpanded = expandedCategories.includes(category.id);
                    const Icon = category.icon;
                    const selectedSubcategories = category.subcategories
                      .filter(sub => subcategories.includes(sub.id));
                    
                    return (
                      <motion.div
                        key={category.id}
                        variants={cardVariants}
                        layout="position"
                      >
                        <Card 
                          className={cn(
                            "transition-all duration-200 hover:shadow-lg",
                            isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
                          )}
                        >
                          <CardHeader 
                            className="pb-3 cursor-pointer"
                            onClick={(e) => handleCardClick(category.id, e)}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                isSelected ? "bg-primary text-white" : "bg-secondary/20 text-secondary"
                              )}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="flex items-center justify-between">
                                  <span>{category.name}</span>
                                  <div className="flex items-center gap-2">
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-primary"
                                      >
                                        <Check className="h-5 w-5" />
                                      </motion.div>
                                    )}
                                    {isSelected && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-0 h-8 w-8"
                                        onClick={(e) => toggleExpand(category.id, e)}
                                      >
                                        <ChevronDown 
                                          className={cn(
                                            "h-5 w-5 transition-transform",
                                            isExpanded && "transform rotate-180"
                                          )} 
                                        />
                                      </Button>
                                    )}
                                  </div>
                                </CardTitle>
                                <CardDescription>
                                  {category.description}
                                  {selectedSubcategories.length > 0 && (
                                    <div className="mt-2 text-xs text-primary">
                                      Sélectionnés : {selectedSubcategories.map(sub => sub.label).join(', ')}
                                    </div>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>

                          {isSelected && isExpanded && (
                            <CardContent className="pt-3 border-t">
                              <FormField
                                control={form.control}
                                name="subcategories"
                                render={({ field }) => (
                                  <div className="grid grid-cols-2 gap-4">
                                    {category.subcategories.map((subcategory) => (
                                      <div 
                                        key={subcategory.id} 
                                        className="checkbox-container flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          checked={field.value?.includes(subcategory.id)}
                                          onCheckedChange={(checked) => {
                                            const newValue = checked
                                              ? [...field.value, subcategory.id]
                                              : field.value?.filter((value) => value !== subcategory.id);
                                            field.onChange(newValue);
                                          }}
                                        />
                                        <span className="text-sm text-secondary">
                                          {subcategory.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              />
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <motion.div 
            className="flex justify-between gap-4 pt-4"
            variants={cardVariants}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/questionnaire/2')}
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