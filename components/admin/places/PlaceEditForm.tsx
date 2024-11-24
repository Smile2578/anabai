// components/admin/places/PlaceEditForm.tsx
import { useState } from 'react';
import { Place } from '@/types/places/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  BasicInfoSection,
  LocationSection,
  CategorySection,
  DescriptionSection,
  ImagesSection,
  OpeningHoursSection,
  PricingSection,
  ContactSection,
  PlanningSection,
  PracticalSection,
  MetadataSection,
} from './form';


interface PlaceEditFormProps {
  place: Place;
  onSubmit: (updatedPlace: Place) => Promise<void>;
}

type TabValue = 
  | 'basic'
  | 'location'
  | 'category'
  | 'description'
  | 'images'
  | 'hours'
  | 'pricing'
  | 'contact'
  | 'planning'
  | 'practical'
  | 'metadata';

const TABS: Array<{
  value: TabValue;
  label: string;
  icon?: string;
}> = [
  { value: 'basic', label: 'Informations de base' },
  { value: 'location', label: 'Localisation' },
  { value: 'category', label: 'Catégorie' },
  { value: 'description', label: 'Description' },
  { value: 'images', label: 'Images' },
  { value: 'hours', label: 'Horaires' },
  { value: 'pricing', label: 'Tarifs' },
  { value: 'contact', label: 'Contact' },
  { value: 'planning', label: 'Planification' },
  { value: 'practical', label: 'Pratique' },
  { value: 'metadata', label: 'Métadonnées' },
];

export const PlaceEditForm = ({ place, onSubmit }: PlaceEditFormProps) => {
  const [formData, setFormData] = useState<Place>(place);
  const [activeTab, setActiveTab] = useState<TabValue>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      toast({
        title: "Modifications enregistrées",
        description: "Les modifications ont été sauvegardées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (value: Partial<Place>) => {
    setFormData(prev => ({
      ...prev,
      ...value
    }));
  };

  const handleReset = () => {
    setFormData(place);
    toast({
      title: "Formulaire réinitialisé",
      description: "Toutes les modifications ont été annulées.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="w-full h-auto flex-wrap gap-2 p-2">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={isSubmitting}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-10">
          <TabsContent value="basic">
            <BasicInfoSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="location">
            <LocationSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="category" className="m-0">
            <CategorySection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="description" className="m-0">
            <DescriptionSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="images" className="m-0">
            <ImagesSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="hours" className="m-0">
            <OpeningHoursSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="pricing" className="m-0">
            <PricingSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="contact" className="m-0">
            <ContactSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="planning" className="m-0">
            <PlanningSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="practical" className="m-0">
            <PracticalSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="metadata" className="m-0">
            <MetadataSection
              data={formData}
              onChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </div>
      </Tabs>

      <div className="bottom-0 z-10">
        <div className="flex items-center justify-end gap-4 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Réinitialiser
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};