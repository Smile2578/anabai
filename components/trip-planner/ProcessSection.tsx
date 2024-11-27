// components/trip-planner/ProcessSection.tsx

import { LucideIcon } from "lucide-react";

interface ProcessStep {
    number: number;
    title: string;
    description: string;
    icon: LucideIcon;
  }
  
  interface ProcessSectionProps {
    steps: ProcessStep[];
  }
  
 // components/trip-planner/ProcessSection.tsx
export function ProcessSection({ steps }: ProcessSectionProps) {
    return (
      <section className="py-32 relative overflow-hidden">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
              <h2 className="text-4xl font-bold mb-6">
                Un processus simple et efficace
              </h2>
              <p className="text-lg text-muted-foreground">
                De vos préférences à votre itinéraire parfait, en quelques étapes seulement
              </p>
            </div>
  
            <div className="md:w-2/3 grid md:grid-cols-3 gap-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary/20 to-primary/5 -translate-y-1/2 z-0" />
              
              {steps.map((step, index) => (
                <div key={index} className="relative z-10">
                  <div className="bg-secondary/10 backdrop-blur-sm rounded-xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-5xl font-bold text-primary/10">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }