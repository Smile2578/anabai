// components/trip-planner/HeroSection.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  isAuthenticated: boolean;
  hasCompletedQuestionnaire: boolean;
}

export function HeroSection({ 
  title, 
  subtitle, 
  isAuthenticated,
  hasCompletedQuestionnaire 
}: HeroSectionProps) {
  const router = useRouter();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?callbackUrl=/questionnaire/start');
    } else if (!hasCompletedQuestionnaire) {
      router.push('/questionnaire');
    } else {
      router.push('/dashboard');
    }
  };
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/sakura2.jpg"
          alt="Japan Travel"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l&apos;intelligence artificielle</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            {title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
              onClick={handleGetStarted}
            >
              Commencer la planification
            </Button>
            <Button 
              size="lg" 
              variant="outline"
            >
              Comment ça marche ?
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}