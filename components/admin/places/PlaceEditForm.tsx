// components/admin/places/PlaceEditForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Place } from '@/types/place';
import {  PlaceFormValues, placeFormSchema } from '@/types/form';
import {
 Form,
} from "@/components/ui/form";
import {
 Tabs,
 TabsContent,
 TabsList,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from 'lucide-react';
import { GeneralSection } from './form/GeneralSection';
import { LocationSection } from './form/LocationSection';
import { DetailsSection } from './form/DetailsSection';
import { MediaSection } from './form/MediaSection';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormReturn } from 'react-hook-form';
import { FormComponentProps } from '@/types/form';

interface PlaceEditFormProps {
 place?: Partial<Place>;
 onSubmit: (data: PlaceFormValues) => Promise<void>;
 isLoading?: boolean;
 error?: string;
}



interface TabComponent {
  id: string;
  label: string;
  component: React.FC<FormComponentProps>;
}

export function PlaceEditForm({ place, onSubmit, isLoading, error }: PlaceEditFormProps) {
 const [activeTab, setActiveTab] = React.useState('general');
 const [isDirty, setIsDirty] = React.useState(false);

 const form = useForm<PlaceFormValues>({
   resolver: zodResolver(placeFormSchema),
   defaultValues: {
     name: { 
       ja: place?.name?.ja || '', 
       en: place?.name?.en || '', 
       fr: place?.name?.fr || '' 
     },
     location: {
       coordinates: place?.location?.coordinates || [35.6762, 139.6503],
       address: {
         ja: place?.location?.address?.ja || '',
         en: place?.location?.address?.en || '',
         fr: place?.location?.address?.fr || '',
       },
       accessInfo: place?.location?.accessInfo || {
         nearestStation: '',
         walkingTime: 0,
       },
     },
     category: place?.category || 'Restaurant',
     subcategories: place?.subcategories || [],
     description: {
       ja: place?.description?.ja || '',
       en: place?.description?.en || '',
       fr: place?.description?.fr || '',
     },
     images: place?.images || [],
     openingHours: place?.openingHours || {
       periods: [],
       weekdayText: {
         ja: [],
         en: [],
         fr: [],
       },
     },
     pricing: place?.pricing || {
       priceRange: 1,
       currency: 'JPY',
       details: {
         ja: '',
         en: '',
         fr: '',
       },
     },
     contact: place?.contact || {
       phone: '',
       website: '',
       bookingUrl: '',
     },
   },
 });

 const tabs: TabComponent[] = [
  { 
    id: 'general', 
    label: 'Général', 
    component: GeneralSection as React.FC<FormComponentProps>
  },
  { 
    id: 'location', 
    label: 'Localisation', 
    component: LocationSection as React.FC<FormComponentProps>
  },
  { 
    id: 'details', 
    label: 'Détails', 
    component: DetailsSection as React.FC<FormComponentProps>
  },
  { 
    id: 'media', 
    label: 'Médias', 
    component: MediaSection as React.FC<FormComponentProps>
  },
];


 // Surveille les changements du formulaire
 React.useEffect(() => {
   const subscription = form.watch(() => setIsDirty(true));
   return () => subscription.unsubscribe();
 }, [form, form.watch]);

 // Gestion de la navigation entre les onglets
 const handleTabChange = (value: string) => {
   if (isDirty) {
     if (window.confirm('Certaines modifications n\'ont pas été enregistrées. Voulez-vous vraiment changer d\'onglet ?')) {
       setActiveTab(value);
     }
   } else {
     setActiveTab(value);
   }
 };

 const onSubmitHandler = async (data: PlaceFormValues) => {
   try {
     await onSubmit(data);
     setIsDirty(false);
   } catch (error) {
     console.error('Error submitting form:', error);
   }
 };

 return (
   <Form {...form}>
     <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
       {/* En-tête avec boutons de sauvegarde */}
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

       {/* Message d'erreur */}
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

       {/* Onglets */}
       <Tabs value={activeTab} onValueChange={handleTabChange}>
         <TabsList>
         {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <tab.component form={form} />
              </motion.div>
            </TabsContent>
          ))}
         </TabsList>

         {tabs.map((tab) => (
           <TabsContent key={tab.id} value={tab.id}>
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
             >
               <tab.component form={form as UseFormReturn<PlaceFormValues>} />
             </motion.div>
           </TabsContent>
         ))}
       </Tabs>
     </form>
   </Form>
 );
}