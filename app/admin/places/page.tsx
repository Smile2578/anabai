'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { ImportWizard } from '@/components/admin/places/import/ImportWizard';

import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PlacesPage = () => {
  const router = useRouter();
  const [showImportDialog, setShowImportDialog] = React.useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Lieux</h2>
          <p className="text-muted-foreground">
            Gérez les lieux de votre application
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push('/admin/places/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau lieu
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
        </div>
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import de lieux</DialogTitle>
          </DialogHeader>
          <ImportWizard
            onComplete={() => {
              setShowImportDialog(false);
            }}
            onCancel={() => setShowImportDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PlacesPage;
