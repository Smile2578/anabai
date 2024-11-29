// components/admin/places/form/PracticalSection.tsx
import { Place } from '@/types/places/main';
import { PracticalInfo } from '@/types/places/base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Info, Accessibility, Car, CreditCard, Coffee, GlassWater } from 'lucide-react';

interface PracticalSectionProps {
  data: Place;
  onChange: (value: Partial<Place>) => void;
  isSubmitting?: boolean;
}

type FoodAndDrinkOptionsKey = keyof Required<PracticalInfo>['foodAndDrinkOptions'];

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Espèces', ja: '現金' },
  { id: 'credit_card', label: 'Carte de crédit', ja: 'クレジットカード' },
  { id: 'ic_card', label: 'Carte IC', ja: 'ICカード' },
  { id: 'qr_code', label: 'QR Code', ja: 'QRコード' },
] as const;

export const PracticalSection = ({ data, onChange, isSubmitting }: PracticalSectionProps) => {
  const practicalInfo = data.practicalInfo || {};

  const updatePracticalInfo = (updates: Partial<PracticalInfo>) => {
    onChange({
      practicalInfo: {
        ...practicalInfo,
        ...updates
      }
    });
  };

  const updateFoodAndDrinkOptions = (field: FoodAndDrinkOptionsKey, value: boolean) => {
    const defaultOptions: Required<PracticalInfo>['foodAndDrinkOptions'] = {
      servesBeer: false,
      servesBreakfast: false,
      servesBrunch: false,
      servesDinner: false,
      servesLunch: false,
      servesVegetarianFood: false,
      servesWine: false
    };

    const currentOptions = practicalInfo.foodAndDrinkOptions || defaultOptions;

    updatePracticalInfo({
      foodAndDrinkOptions: {
        ...currentOptions,
        [field]: value
      }
    });
  };

  const togglePaymentMethod = (methodId: string) => {
    const currentMethods = practicalInfo.paymentMethods || [];
    const newMethods = currentMethods.includes(methodId)
      ? currentMethods.filter((id: string) => id !== methodId)
      : [...currentMethods, methodId];
    
    updatePracticalInfo({ paymentMethods: newMethods });
  };

  const foodAndDrinkOptions: Array<{
    key: FoodAndDrinkOptionsKey;
    label: string;
    description: string;
  }> = [
    {
      key: 'servesBreakfast',
      label: 'Petit-déjeuner',
      description: 'Service de petit-déjeuner'
    },
    {
      key: 'servesBrunch',
      label: 'Brunch',
      description: 'Service de brunch'
    },
    {
      key: 'servesLunch',
      label: 'Déjeuner',
      description: 'Service de déjeuner'
    },
    {
      key: 'servesDinner',
      label: 'Dîner',
      description: 'Service de dîner'
    },
    {
      key: 'servesVegetarianFood',
      label: 'Options végétariennes',
      description: 'Propose des plats végétariens'
    },
    {
      key: 'servesBeer',
      label: 'Bière',
      description: 'Sert de la bière'
    },
    {
      key: 'servesWine',
      label: 'Vin',
      description: 'Sert du vin'
    }
  ];

  return (
    <Card className="hover-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <Info className="w-6 h-6" />
          Informations pratiques
        </CardTitle>
        <CardDescription>
          Détails pratiques pour la visite
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Options de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Options de base</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Réservation requise</Label>
                  <p className="text-sm text-muted-foreground">
                    La réservation est-elle nécessaire ?
                  </p>
                </div>
                <Switch
                  checked={practicalInfo.bookingRequired || false}
                  onCheckedChange={(checked) => updatePracticalInfo({ bookingRequired: checked })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Support anglais</Label>
                  <p className="text-sm text-muted-foreground">
                    Le personnel parle-t-il anglais ?
                  </p>
                </div>
                <Switch
                  checked={practicalInfo.englishSupport || false}
                  onCheckedChange={(checked) => updatePracticalInfo({ englishSupport: checked })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Options de service</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Livraison</Label>
                  <p className="text-sm text-muted-foreground">
                    Service de livraison disponible
                  </p>
                </div>
                <Switch
                  checked={practicalInfo.delivery || false}
                  onCheckedChange={(checked) => updatePracticalInfo({ delivery: checked })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sur place</Label>
                  <p className="text-sm text-muted-foreground">
                    Consommation sur place possible
                  </p>
                </div>
                <Switch
                  checked={practicalInfo.dineIn || false}
                  onCheckedChange={(checked) => updatePracticalInfo({ dineIn: checked })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>À emporter</Label>
                  <p className="text-sm text-muted-foreground">
                    Service à emporter disponible
                  </p>
                </div>
                <Switch
                  checked={practicalInfo.takeout || false}
                  onCheckedChange={(checked) => updatePracticalInfo({ takeout: checked })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Options de nourriture et boissons */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            <GlassWater className="w-5 h-5" />
            Options de nourriture et boissons
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foodAndDrinkOptions.map((option) => (
              <div key={option.key} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>{option.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <Switch
                  checked={practicalInfo.foodAndDrinkOptions?.[option.key] || false}
                  onCheckedChange={(checked) => updateFoodAndDrinkOptions(option.key, checked)}
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Options de paiement */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Moyens de paiement acceptés
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = practicalInfo.paymentMethods?.includes(method.id);
              return (
                <div
                  key={method.id}
                  onClick={() => !isSubmitting && togglePaymentMethod(method.id)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-colors
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-muted hover:bg-muted'}
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{method.label}</span>
                    <span className="text-sm text-muted-foreground">{method.ja}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Options de parking */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Car className="w-5 h-5" />
            Options de parking
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <Label>Parking gratuit</Label>
              <Switch
                checked={practicalInfo.parkingOptions?.freeParking || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  parkingOptions: {
                    freeParking: checked,
                    paidParking: practicalInfo.parkingOptions?.paidParking || false,
                    streetParking: practicalInfo.parkingOptions?.streetParking || false,
                    valetParking: practicalInfo.parkingOptions?.valetParking || false,
                    parkingAvailable: practicalInfo.parkingOptions?.parkingAvailable || false
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <Label>Parking payant</Label>
              <Switch
                checked={practicalInfo.parkingOptions?.paidParking || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  parkingOptions: {
                    freeParking: practicalInfo.parkingOptions?.freeParking || false,
                    paidParking: checked,
                    streetParking: practicalInfo.parkingOptions?.streetParking || false,
                    valetParking: practicalInfo.parkingOptions?.valetParking || false,
                    parkingAvailable: practicalInfo.parkingOptions?.parkingAvailable || false
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <Label>Parking dans la rue</Label>
              <Switch
                checked={practicalInfo.parkingOptions?.streetParking || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  parkingOptions: {
                    freeParking: practicalInfo.parkingOptions?.freeParking || false,
                    paidParking: practicalInfo.parkingOptions?.paidParking || false,
                    streetParking: checked,
                    valetParking: practicalInfo.parkingOptions?.valetParking || false,
                    parkingAvailable: practicalInfo.parkingOptions?.parkingAvailable || false
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Accessibilité */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibilité
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label>Parking accessible</Label>
                <p className="text-sm text-muted-foreground">
                  Places de parking pour personnes à mobilité réduite
                </p>
              </div>
              <Switch
                checked={practicalInfo.accessibilityOptions?.wheelchairAccessibleParking || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  accessibilityOptions: {
                    wheelchairAccessibleParking: checked,
                    wheelchairAccessibleEntrance: practicalInfo.accessibilityOptions?.wheelchairAccessibleEntrance || false,
                    wheelchairAccessibleRestroom: practicalInfo.accessibilityOptions?.wheelchairAccessibleRestroom || false,
                    wheelchairAccessibleSeating: practicalInfo.accessibilityOptions?.wheelchairAccessibleSeating || false
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label>Entrée accessible</Label>
                <p className="text-sm text-muted-foreground">
                  Entrée adaptée aux fauteuils roulants
                </p>
              </div>
              <Switch
                checked={practicalInfo.accessibilityOptions?.wheelchairAccessibleEntrance || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  accessibilityOptions: {
                    wheelchairAccessibleParking: practicalInfo.accessibilityOptions?.wheelchairAccessibleParking || false,
                    wheelchairAccessibleEntrance: checked,
                    wheelchairAccessibleRestroom: practicalInfo.accessibilityOptions?.wheelchairAccessibleRestroom || false,
                    wheelchairAccessibleSeating: practicalInfo.accessibilityOptions?.wheelchairAccessibleSeating || false
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label>Toilettes accessibles</Label>
                <p className="text-sm text-muted-foreground">
                  Toilettes adaptées aux personnes à mobilité réduite
                </p>
              </div>
              <Switch
                checked={practicalInfo.accessibilityOptions?.wheelchairAccessibleRestroom || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  accessibilityOptions: {
                    wheelchairAccessibleParking: practicalInfo.accessibilityOptions?.wheelchairAccessibleParking || false,
                    wheelchairAccessibleEntrance: practicalInfo.accessibilityOptions?.wheelchairAccessibleEntrance || false,
                    wheelchairAccessibleRestroom: checked,
                    wheelchairAccessibleSeating: practicalInfo.accessibilityOptions?.wheelchairAccessibleSeating || false
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-0.5">
                <Label>Places assises accessibles</Label>
                <p className="text-sm text-muted-foreground">
                  Places adaptées aux personnes à mobilité réduite
                </p>
              </div>
              <Switch
                checked={practicalInfo.accessibilityOptions?.wheelchairAccessibleSeating || false}
                onCheckedChange={(checked) => updatePracticalInfo({
                  accessibilityOptions: {
                    wheelchairAccessibleParking: practicalInfo.accessibilityOptions?.wheelchairAccessibleParking || false,
                    wheelchairAccessibleEntrance: practicalInfo.accessibilityOptions?.wheelchairAccessibleEntrance || false,
                    wheelchairAccessibleRestroom: practicalInfo.accessibilityOptions?.wheelchairAccessibleRestroom || false,
                    wheelchairAccessibleSeating: checked
                  }
                })}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};