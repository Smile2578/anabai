// app/(site)/questionnaire/layout.tsx
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { QuestionnaireProgress } from "@/components/questionnaire/QuestionnaireProgress";
import Image from "next/image";
import { QuestionnaireSyncProvider } from "@/components/questionnaire/QuestionnaireSyncProvider";

export const metadata: Metadata = {
  title: "Créez votre voyage | AnabAI",
  description: "Personnalisez votre voyage au Japon en quelques étapes simples",
};

interface QuestionnaireLayoutProps {
  children: React.ReactNode;
}

// Le composant principal reste un composant serveur
export default async function QuestionnaireLayout({
  children,
}: QuestionnaireLayoutProps) {
  // Vérification de l'authentification côté serveur
  const session = await auth();

  if (!session) {
    redirect('/auth/signin?callbackUrl=/questionnaire');
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond avec image et superposition */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/sakura.jpg" 
          alt="Japan Background"
          fill
          className="object-cover brightness-[0.2] select-none pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* En-tête avec titre */}
            <div className="flex flex-col items-center justify-center space-y-6 mb-12">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-secondary">
                  Créez votre voyage idéal
                </h1>
              </div>
            </div>

            {/* On enveloppe le contenu dans notre provider client */}
            <QuestionnaireSyncProvider>
              {/* Barre de progression */}
              <div className="mb-8">
                <QuestionnaireProgress />
              </div>

              {/* Effet de lueur sur les bords */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 -z-10 blur-xl opacity-50" />

              {/* Conteneur du contenu avec padding */}
              <div className="relative px-8 py-2">
                {children}
              </div>

              {/* Message de confidentialité */}
              <div className="mt-8 text-center text-sm text-secondary">
                Vos données sont sécurisées et ne seront utilisées que pour personnaliser votre voyage
              </div>
            </QuestionnaireSyncProvider>
          </div>
        </div>
      </div>
    </div>
  );
}