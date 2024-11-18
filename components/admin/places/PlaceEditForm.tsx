// components/admin/places/PlaceEditForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlaceBase } from '@/types/place';
import { PlaceFormValues, placeFormSchema } from '@/types/form';
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

// Import des sections du formulaire
import { GeneralSection } from './form/GeneralSection';
import { LocationSection } from './form/LocationSection';
import { DetailsSection } from './form/DetailsSection';
import { PreviewSection } from './form/PreviewSection';

interface PlaceEditFormProps {
  place?: Partial<PlaceBase>;
  onSubmit: (data: PlaceFormValues) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function PlaceEditForm({ place, onSubmit, isLoading, error }: PlaceEditFormProps) {
  const [activeTab, setActiveTab] = React.useState('general');
  const [isDirty, setIsDirty] = React.useState(false);

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: { 
        fr: place?.name?.fr || '',
        ja: place?.name?.ja || ''
      },
      location: {
        coordinates: place?.location?.coordinates || [35.6762, 139.6503],
        address: {
          fr: place?.location?.address?.fr || '',
          ja: place?.location?.address?.ja || '',
          prefecture: place?.location?.address?.prefecture || '',
          city: place?.location?.address?.city || '',
        },
        accessInfo: place?.location?.accessInfo || {
          nearestStation: '',
          walkingTime: 0,
        },
      },
      category: place?.category || 'Restaurant',
      subcategories: place?.subcategories || [],
      description: {
        fr: place?.description?.fr || '',
      },
      images: place?.images || [],
      openingHours: place?.openingHours || {
        periods: [],
        weekdayText: {
          ja: [],
          fr: [],
        },
      },
      pricing: place?.pricing || {
        priceRange: 1,
        currency: 'JPY',
        budget: {
          min: 0,
          max: 0,
        },
      },
      contact: place?.contact || {
        phone: '',
        website: '',
        bookingUrl: '',
      },
      ratings: place?.ratings || {
        googleRating: 0,
        googleReviewsCount: 0,
      },
    },
  });

  React.useEffect(() => {
    const subscription = form.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [form, form.watch]);

  const handleSubmit = async (data: PlaceFormValues) => {
    try {
      await onSubmit(data);
      setIsDirty(false);
      toast({
        title: "Succès",
        description: "Le lieu a été sauvegardé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error as Error).message || "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'location', label: 'Localisation' },
    { id: 'details', label: 'Détails' },
    { id: 'preview', label: 'Aperçu' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {place ? 'Modifier le lieu' : 'Nouveau lieu'}
          </h2>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading}
              onClick={() => window.history.back()}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder'
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general">
            <GeneralSection form={form} />
          </TabsContent>

          <TabsContent value="location">
            <LocationSection form={form} />
          </TabsContent>

          <TabsContent value="details">
            <DetailsSection form={form} />
          </TabsContent>

          <TabsContent value="preview">
            <PreviewSection form={form} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}