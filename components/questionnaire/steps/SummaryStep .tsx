// components/questionnaire/steps/SummaryStep.tsx
'use client';

import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/store/useQuestionnaireStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  Scale,
  Heart,
  Wallet,
  Languages,
  Check,
  Loader2,
  Utensils,
  Accessibility,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";


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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 } 
  }
};

export function SummaryStep() {
  const router = useRouter();
  const { answers, submitQuestionnaire } = useQuestionnaireStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await submitQuestionnaire();
      toast({
        title: "Félicitations ! 🎉",
        description: "Votre profil de voyage a été créé avec succès. Préparez-vous à découvrir le Japon !",
        duration: 5000,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Une erreur est survenue",
        description: "Impossible de finaliser votre profil pour le moment. Veuillez réessayer.",
        duration: 5000,
      });
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getComfortLevel = (comfort?: string) => {
    const levels = {
      budget: '🎒 Économique',
      standard: '🏡 Standard',
      luxury: '✨ Luxe',
    };
    return levels[comfort as keyof typeof levels] || 'Non spécifié';
  };

  const getPaceLevel = (pace?: string) => {
    const paces = {
      relaxed: '🌿 Détendu',
      moderate: '⚖️ Modéré',
      intensive: '⚡ Intensif',
    };
    return paces[pace as keyof typeof paces] || 'Non spécifié';
  };

  const getLanguageLevel = (level?: string) => {
    const levels = {
      none: 'Aucune connaissance',
      basic: 'Notions de base',
      intermediate: 'Niveau intermédiaire',
      fluent: 'Courant',
    };
    return levels[level as keyof typeof levels] || 'Non spécifié';
  };

  const getInterestCategories = (categories: string[]) => {
    const categoryNames = {
      culture: '🏛️ Culture & Histoire',
      nature: '🌲 Nature & Paysages',
      food: '🍱 Gastronomie',
      modern: '🌆 Japon Moderne',
      experiences: '✨ Expériences Uniques',
    };

    return categories.map(category => 
      categoryNames[category as keyof typeof categoryNames] || category
    ).join(', ');
  };

  const getBudgetPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'accommodation': return 'Hébergement';
      case 'food': return 'Nourriture';
      case 'activities': return 'Activités';
      case 'undefined': return 'Peu importe';
      default: return 'Non spécifié';
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardVariants} className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Check className="h-6 w-6" />
            Résumé de votre profil voyage
          </h2>
          <div className="text-sm text-secondary bg-primary/10 px-3 py-1 rounded-full">
            Dernière étape !
          </div>
        </div>
        <p className="text-secondary">
          Vérifiez les informations avant de finaliser votre profil de voyage
        </p>
      </motion.div>

      <div className="grid gap-6">
        {/* Informations de base */}
        <motion.div variants={cardVariants}>
          <Card className="group hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Informations de base</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <motion.div variants={listItemVariants} className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Dates du voyage</p>
                  <p className="text-sm text-secondary">
                    Du {formatDate(answers.basicInfo?.startDate)} au {formatDate(answers.basicInfo?.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Durée</p>
                  <p className="text-sm text-secondary">
                    {answers.basicInfo?.duration} jours
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Nombre de voyageurs</p>
                  <p className="text-sm text-secondary">
                    {answers.basicInfo?.groupSize} personne(s)
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Style de voyage */}
        <motion.div variants={cardVariants}>
          <Card className="group hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle>Style de voyage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <motion.div variants={listItemVariants} className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Rythme</p>
                  <p className="text-sm text-secondary">
                    {getPaceLevel(answers.travelStyle?.pace)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Niveau de confort</p>
                  <p className="text-sm text-secondary">
                    {getComfortLevel(answers.travelStyle?.comfort)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Flexibilité</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-secondary/20 rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${answers.travelStyle?.flexibility || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-secondary">
                      {answers.travelStyle?.flexibility}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Immersion culturelle</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-secondary/20 rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${answers.travelStyle?.culturalImmersion || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-secondary">
                      {answers.travelStyle?.culturalImmersion}%
                    </span>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Centres d'intérêt */}
        <motion.div variants={cardVariants}>
          <Card className="group hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <CardTitle>Centres d&apos;intérêt</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Catégories principales</p>
                <p className="text-sm text-secondary">
                  {answers.interests?.mainInterests && 
                   getInterestCategories(answers.interests.mainInterests)}
                </p>
              </div>
              {answers.interests?.subcategories && answers.interests.subcategories.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Intérêts spécifiques</p>
                  <p className="text-sm text-secondary">
                    {answers.interests.subcategories.map(sub => 
                      sub.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                    ).join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget et Contraintes */}
        <motion.div variants={cardVariants}>
          <Card className="group hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <CardTitle>Budget et Contraintes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Budget total par personne</p>
                  <p className="text-sm text-secondary">
                    {answers.budget?.total === undefined
                      ? 'Non défini'
                      : `${answers.budget?.total?.toLocaleString('fr-FR')} €`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Limite journalière</p>
                  <p className="text-sm text-secondary">
                    {answers.budget?.dailyLimit === undefined
                      ? 'Non défini'
                      : `${answers.budget?.dailyLimit?.toLocaleString('fr-FR')} €`}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Priorité budgétaire</p>
                <p className="text-sm text-secondary">
                  {getBudgetPriorityLabel(answers.budget?.priority)}
                </p>
              </div>

              {answers.constraints?.dietary && answers.constraints.dietary.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Régimes alimentaires</p>
                  <p className="text-sm text-secondary">
                    {answers.constraints.dietary.join(', ')}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Niveau de japonais</p>
                <p className="text-sm text-secondary">
                  {getLanguageLevel(answers.constraints?.language)}
                </p>
              </div>

              {answers.constraints?.mobility && (
                <Alert className="mt-2 bg-primary/5 border-primary/20">
                  <Accessibility className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">
                    Besoin d&apos;accès adaptés pour mobilité réduite
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        className="flex justify-between gap-4 pt-4"
        variants={cardVariants}
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/questionnaire/4')}
          className="group"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Précédent
        </Button>
        <Button 
          onClick={handleSubmit}
          className="group"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création du profil...
            </>
          ) : (
            <>
              Finaliser
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}