// components/admin/places/form/LocationSection.tsx
import { useEffect, useState } from 'react';
import { Place } from '@/types/places/main';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPinIcon, TrainIcon } from 'lucide-react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { AccessInfo } from '@/types/places/base';

interface LocationSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem'
};

const japanBounds = {
  north: 45.7,  // Hokkaido
  south: 24.0,  // Okinawa
  east: 154.0,  // Îles Ogasawara
  west: 122.0   // Îles Yonaguni
};

export const LocationSection = ({ data, onChange, isSubmitting }: LocationSectionProps) => {
    const [transportOptions, setTransportOptions] = useState<string[]>(
      data.location.access?.transportOptions || []
    );
    const [mapsApiKey, setMapsApiKey] = useState<string>('');
    const [isLoading] = useState(true);
  
    useEffect(() => {
        const fetchApiKey = async () => {
          try {
            const response = await fetch('/api/config?service=google-maps');
            const data = await response.json();
            setMapsApiKey(data.apiKey);
          } catch (error) {
            console.error('Erreur lors du chargement de la clé API:', error);
          }
        };
      
        fetchApiKey();
      }, []);
  const [mapCenter, setMapCenter] = useState({
    lat: data.location.point.coordinates[1],
    lng: data.location.point.coordinates[0]
  });


  const handleAddressChange = (lang: 'fr' | 'ja' | 'en', type: 'full' | 'formatted', value: string) => {
    onChange({
      location: {
        ...data.location,
        address: {
          ...data.location.address,
          [type]: {
            ...data.location.address[type],
            [lang]: value
          }
        }
      }
    });
  };

  const handleCoordinatesChange = (position: google.maps.LatLngLiteral) => {
    onChange({
      location: {
        ...data.location,
        point: {
          type: 'Point',
          coordinates: [position.lng, position.lat]
        }
      }
    });
    setMapCenter(position);
  };

  const handleAccessChange = (field: keyof AccessInfo, value: string | number | string[]) => {
    onChange({
      location: {
        ...data.location,
        access: {
          ...data.location.access,
          [field]: value
        }
      }
    });
  };

  const addTransportOption = () => {
    const newOptions = [...transportOptions, ''];
    setTransportOptions(newOptions);
    handleAccessChange('transportOptions', newOptions);
  };

  const updateTransportOption = (index: number, value: string) => {
    const newOptions = [...transportOptions];
    newOptions[index] = value;
    setTransportOptions(newOptions);
    handleAccessChange('transportOptions', newOptions);
  };

  const removeTransportOption = (index: number) => {
    const newOptions = transportOptions.filter((_, i) => i !== index);
    setTransportOptions(newOptions);
    handleAccessChange('transportOptions', newOptions);
  };

  return (
    <Card className="hover-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <MapPinIcon className="h-6 w-6" />
          Localisation
        </CardTitle>
        <CardDescription>
          Adresse et informations d&apos;accès
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Carte Google Maps */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Position sur la carte</Label>
        {isLoading ? (
          <div className="h-[400px] rounded-lg bg-muted flex items-center justify-center">
            Chargement de la carte...
          </div>
        ) : mapsApiKey ? (
          <LoadScript googleMapsApiKey={mapsApiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={15}
              options={{
                restriction: {
                  latLngBounds: japanBounds,
                  strictBounds: true,
                },
                streetViewControl: false,
                mapTypeControl: false,
              }}
              onClick={(e) => e.latLng && handleCoordinatesChange({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              })}
            >
              <Marker
                position={mapCenter}
                draggable={true}
                onDragEnd={(e) => e.latLng && handleCoordinatesChange({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                })}
              />
            </GoogleMap>
          </LoadScript>
        ) : (
          <div className="h-[400px] rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
            Erreur de chargement de la carte
          </div>
          )}
        </div>

        {/* Adresse */}
        <Tabs defaultValue="full" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full">Adresse complète</TabsTrigger>
            <TabsTrigger value="formatted">Adresse formatée</TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="space-y-4">
            <div className="space-y-4">
              {['fr', 'ja'].map((lang) => (
                <div key={lang} className="relative">
                  <Input
                    value={data.location.address.full[lang as 'fr' | 'ja'] || ''}
                    onChange={(e) => handleAddressChange(lang as 'fr' | 'ja', 'full', e.target.value)}
                    className="pl-12"
                    placeholder={lang === 'fr' ? 'Adresse complète' : '住所'}
                    disabled={isSubmitting}
                  />
                  <Badge 
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    variant="outline"
                  >
                    {lang.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="formatted" className="space-y-4">
            <div className="space-y-4">
              {['fr', 'ja'].map((lang) => (
                <div key={lang} className="relative">
                  <Input
                    value={data.location.address.formatted[lang as 'fr' | 'ja'] || ''}
                    onChange={(e) => handleAddressChange(lang as 'fr' | 'ja', 'formatted', e.target.value)}
                    className="pl-12"
                    placeholder={lang === 'fr' ? 'Adresse formatée' : '正式住所'}
                    disabled={isSubmitting}
                  />
                  <Badge 
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    variant="outline"
                  >
                    {lang.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Détails de l'adresse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prefecture">Préfecture</Label>
            <Input
              id="prefecture"
              value={data.location.address.prefecture || ''}
              onChange={(e) => onChange({
                location: {
                  ...data.location,
                  address: {
                    ...data.location.address,
                    prefecture: e.target.value
                  }
                }
              })}
              placeholder="Ex: Tokyo"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={data.location.address.city || ''}
              onChange={(e) => onChange({
                location: {
                  ...data.location,
                  address: {
                    ...data.location.address,
                    city: e.target.value
                  }
                }
              })}
              placeholder="Ex: Shibuya"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Code postal</Label>
            <Input
              id="postalCode"
              value={data.location.address.postalCode || ''}
              onChange={(e) => onChange({
                location: {
                  ...data.location,
                  address: {
                    ...data.location.address,
                    postalCode: e.target.value
                  }
                }
              })}
              placeholder="Ex: 150-0043"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Informations d'accès */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <TrainIcon className="h-5 w-5" />
            Accès
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nearestStation">Station la plus proche</Label>
              <Input
                id="nearestStation"
                value={data.location.access?.nearestStation || ''}
                onChange={(e) => handleAccessChange('nearestStation', e.target.value)}
                placeholder="Ex: Shibuya Station"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="walkingTime">Temps de marche (minutes)</Label>
              <Input
                id="walkingTime"
                type="number"
                value={data.location.access?.walkingTime || ''}
                onChange={(e) => handleAccessChange('walkingTime', parseInt(e.target.value))}
                placeholder="Ex: 5"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Options de transport</Label>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {transportOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    value={option}
                    onChange={(e) => updateTransportOption(index, e.target.value)}
                    placeholder="Ex: JR Yamanote Line"
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTransportOption(index)}
                    disabled={isSubmitting}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addTransportOption}
                disabled={isSubmitting}
                className="w-full mt-2"
              >
                Ajouter une option de transport
              </Button>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};