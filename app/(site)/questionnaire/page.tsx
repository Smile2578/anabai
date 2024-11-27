// app/questionnaire/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function QuestionnairePage() {
  const session = await auth();
  
  // Redirection vers la connexion si non authentifié
  if (!session) {
    redirect('/auth/signin?callbackUrl=/questionnaire');
  }

  // Redirection vers la première étape
  redirect('/questionnaire/1');
}