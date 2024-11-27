// components/trip-planner/CTASection.tsx
'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface CTASectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  isAuthenticated: boolean;
  hasCompletedQuestionnaire: boolean;
}

export function CTASection({ 
  title, 
  subtitle, 
  buttonText,
  isAuthenticated,
  hasCompletedQuestionnaire
}: CTASectionProps) {
  const router = useRouter();

  const handleAction = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?callbackUrl=/questionnaire/start');
    } else if (!hasCompletedQuestionnaire) {
      router.push('/questionnaire');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <section className="py-20 bg-primary/5">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>
          <Button size="lg" onClick={handleAction}>
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}