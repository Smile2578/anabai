// components/admin/places/form/ContactSection.tsx
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, Globe, Calendar, Instagram } from 'lucide-react';

interface ContactSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

export const ContactSection = ({ data, onChange, isSubmitting }: ContactSectionProps) => {
  const contact = data.contact || {};

  const handleChange = (field: keyof typeof contact, value: string) => {
    onChange({
      contact: {
        ...contact,
        [field]: value
      }
    });
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <Phone className="w-6 h-6" />
          Contact
        </CardTitle>
        <CardDescription>
          Informations de contact et liens utiles
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Numéro de téléphone
          </Label>
          <Input
            id="phone"
            value={contact.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Ex: +81 3-XXXX-XXXX"
            disabled={isSubmitting}
          />
        </div>

        {/* Site web */}
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Site web
          </Label>
          <Input
            id="website"
            type="url"
            value={contact.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://..."
            disabled={isSubmitting}
            className={!validateUrl(contact.website || '') ? 'border-destructive' : ''}
          />
          {!validateUrl(contact.website || '') && (
            <p className="text-sm text-destructive">URL invalide</p>
          )}
        </div>

        {/* URL de réservation */}
        <div className="space-y-2">
          <Label htmlFor="booking" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lien de réservation
          </Label>
          <Input
            id="booking"
            type="url"
            value={contact.bookingUrl || ''}
            onChange={(e) => handleChange('bookingUrl', e.target.value)}
            placeholder="https://..."
            disabled={isSubmitting}
            className={!validateUrl(contact.bookingUrl || '') ? 'border-destructive' : ''}
          />
          {!validateUrl(contact.bookingUrl || '') && (
            <p className="text-sm text-destructive">URL invalide</p>
          )}
        </div>

        {/* Google Maps */}
        <div className="space-y-2">
          <Label htmlFor="googleMaps" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Lien Google Maps
          </Label>
          <Input
            id="googleMaps"
            type="url"
            value={contact.googleMapsUrl || ''}
            onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
            placeholder="https://maps.google.com/..."
            disabled={isSubmitting}
            className={!validateUrl(contact.googleMapsUrl || '') ? 'border-destructive' : ''}
          />
          {!validateUrl(contact.googleMapsUrl || '') && (
            <p className="text-sm text-destructive">URL invalide</p>
          )}
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Lien Instagram
          </Label>
          <Input
            id="instagram"
            type="url"
            value={contact.instagramUrl || ''}
            onChange={(e) => handleChange('instagramUrl', e.target.value)}
            placeholder="https://www.instagram.com/..."
            disabled={isSubmitting}
          />
        </div>

        {/* Aperçu des liens */}
        {(contact.website || contact.bookingUrl || contact.googleMapsUrl) && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Liens rapides :</p>
            <div className="space-y-2">
              {contact.website && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={() => window.open(contact.website, '_blank')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Site web
                </Button>
              )}
              {contact.bookingUrl && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={() => window.open(contact.bookingUrl, '_blank')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Réservation
                </Button>
              )}
              {contact.googleMapsUrl && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={() => window.open(contact.googleMapsUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Maps
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};