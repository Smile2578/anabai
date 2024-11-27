// app/questionnaire/[step]/page.tsx
import { redirect } from "next/navigation";

import { BasicInfoStep } from "@/components/questionnaire/steps/BasicInfoStep";
import { TravelStyleStep } from "@/components/questionnaire/steps/TravelStyleStep";
import { InterestsStep } from "@/components/questionnaire/steps/InterestsStep";
import { ConstraintsStep } from "@/components/questionnaire/steps/ConstraintsStep";
import { SummaryStep } from "@/components/questionnaire/steps/SummaryStep ";

interface PageProps {
  params: {
    step: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function QuestionnaireStepPage({ 
  params,
  searchParams,
}: PageProps) {
  const step = await Promise.resolve(params.step);
  const stepNumber = parseInt(step);

  // Validation du numéro d'étape
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 5) {
    redirect('/questionnaire/1');
  }

  // Rendu du composant approprié selon l'étape
  const stepComponents = {
    1: BasicInfoStep,
    2: TravelStyleStep,
    3: InterestsStep,
    4: ConstraintsStep,
    5: SummaryStep,
  };

  const StepComponent = stepComponents[stepNumber as keyof typeof stepComponents];

  return <StepComponent />;
}