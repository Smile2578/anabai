// components/trip-planner/FeaturesSection.tsx

import { LucideIcon } from "lucide-react";

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
  }
  
  interface FeaturesSectionProps {
    features: Feature[];
  }
  
  export function FeaturesSection({ features }: FeaturesSectionProps) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Une planification intelligente
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez les fonctionnalités qui rendront votre voyage unique
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-background hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }