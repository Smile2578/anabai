// app/trip-planner/page.tsx
import { auth } from "@/auth";
import { features, plans, testimonials } from "@/lib/config/trip-planner.config";
import { HeroSection } from "@/components/trip-planner/HeroSection";
import { ProcessSection } from "@/components/trip-planner/ProcessSection";
import { FeaturesSection } from "@/components/trip-planner/FeaturesSection";
import { PricingSection } from "@/components/trip-planner/PricingSection";
import { TestimonialsSection } from "@/components/trip-planner/TestimonialsSection";
import { CTASection } from "@/components/trip-planner/CTASection";
import { getQuestionnaire } from "@/lib/actions/questionnaire";
import { FileSpreadsheetIcon, BrainIcon, EditIcon } from "lucide-react";

export default async function TripPlannerPage() {
  const session = await auth();
  
  let hasCompletedQuestionnaire = false;
  
  if (session?.user?.id) {
    const questionnaire = await getQuestionnaire();
    hasCompletedQuestionnaire = !!questionnaire?.completed;
  }

  return (
    <div className="bg-background">
      <main className="flex-1">
        {/* Hero Section - Pleine largeur avec contenu centré */}
        <section className="relative w-full">
          <HeroSection
            title="Planifiez votre voyage au Japon"
            subtitle="Une expérience unique et personnalisée grâce à l'IA"
            isAuthenticated={!!session}
            hasCompletedQuestionnaire={hasCompletedQuestionnaire}
          />
        </section>

        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          {/* Process Section */}
          <section className="py-20">
            <ProcessSection
              steps={[
                {
                  number: 1,
                  title: "Partagez vos envies",
                  description: "Un questionnaire simple pour comprendre vos préférences",
                  icon: FileSpreadsheetIcon,
                },
                {
                  number: 2,
                  title: "L'IA crée votre itinéraire",
                  description: "Un planning optimisé selon vos critères",
                  icon: BrainIcon,
                },
                {
                  number: 3,
                  title: "Affinez et personnalisez",
                  description: "Modifiez votre itinéraire à volonté",
                  icon: EditIcon,
                },
              ]}
            />
          </section>

          {/* Features Section */}
          <section className="py-20">
            <FeaturesSection features={features} />
          </section>

          {/* Pricing Section */}
          <section className="py-20">
            <PricingSection plans={plans} />
          </section>

          {/* Testimonials Section */}
          <section className="py-20">
            <TestimonialsSection testimonials={testimonials} />
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <CTASection 
              title="Prêt à vivre une expérience unique ?"
              subtitle="Commencez votre planification maintenant"
              buttonText="Créer mon voyage"
              isAuthenticated={!!session}
              hasCompletedQuestionnaire={hasCompletedQuestionnaire}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
