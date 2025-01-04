// app/(protected)/questionnaire/page.tsx
import { redirect } from "next/navigation";

export default async function QuestionnairePage() {
  // Redirection directe vers la première étape
  redirect('/questionnaire/1');
}