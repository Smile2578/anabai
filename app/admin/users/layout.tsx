import { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'Utilisateurs - AnabAI Admin',
  description: 'Gestion des utilisateurs de la plateforme AnabAI',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4">
      <Suspense 
        fallback={
          <Card className="p-8">
            <div className="flex space-x-4">
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
              </div>
            </div>
          </Card>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}

