// components/trip-planner/PricingSection.tsx

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingPlan {
    name: string;
    price: string;
    description: string;
    features: string[];
    icon: LucideIcon;
    popular?: boolean;
  }
  
  interface PricingSectionProps {
    plans: PricingPlan[];
  }
  
  export function PricingSection({ plans }: PricingSectionProps) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Choisissez votre formule
            </h2>
            <p className="text-lg text-muted-foreground">
              Une solution adaptée à chaque voyageur
            </p>
          </div>
  
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-lg border ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
                } bg-background p-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}
  
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  <plan.icon className={`h-6 w-6 ${
                    plan.popular ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
  
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/voyage</span>
                </div>
  
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
  
                <Button
                  className={`w-full ${
                    plan.popular ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  Choisir {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }