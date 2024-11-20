// lib/services/core/GeocodingService.ts
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';
import { GoogleLocation } from '@/types/google/base';
import { Language } from '@/types/common';

interface AddressComponent {
 long_name: string;
 short_name: string;
 types: string[];
}

interface GeocodingResponse {
 results: {
   formatted_address: string;
   geometry: {
     location: {
       lat: number;
       lng: number;
     };
     location_type: string;
     viewport: {
       northeast: GoogleLocation;
       southwest: GoogleLocation;
     };
   };
   address_components: AddressComponent[];
   place_id: string;
   plus_code?: {
     compound_code: string;
     global_code: string;
   };
   types: string[];
 }[];
 status: string;
 error_message?: string;
}

export interface GeocodingResult {
 coordinates: {
   lat: number;
   lng: number;
 };
 address: {
   fr: string;
   ja: string;
   prefecture?: string;
   city?: string;
   postalCode?: string;
 };
 placeId?: string;
 locationType?: string;
 types?: string[];
}

export class GeocodingService {
 private readonly apiKey: string;

 constructor() {
   const apiKey = process.env.GOOGLE_MAPS_API_KEY;
   if (!apiKey) {
     throw new Error('Google Maps API key is not configured');
   }
   this.apiKey = apiKey;
 }

 private async fetchGeocodingApi(
   endpoint: string, 
   params: Record<string, string>
 ): Promise<GeocodingResponse> {
   const url = new URL(`https://maps.googleapis.com/maps/api/geocode/${endpoint}`);
   
   // Ajout des paramètres de base
   for (const [key, value] of Object.entries(params)) {
     url.searchParams.append(key, value);
   }
   
   // Ajout de la clé API et des paramètres par défaut
   url.searchParams.append('key', this.apiKey);
   url.searchParams.append('region', GOOGLE_MAPS_CONFIG.geocoding.region);

   const response = await fetch(url.toString());
   if (!response.ok) {
     throw new Error(`Geocoding API error: ${response.statusText}`);
   }

   const data = await response.json();
   if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
     throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
   }

   return data;
 }

 async geocode(
   address: string,
   languages: Language[] = ['fr', 'ja']
 ): Promise<GeocodingResult | null> {
   try {
     // Récupérer les résultats dans toutes les langues demandées
     const results = await Promise.all(
       languages.map(language =>
         this.fetchGeocodingApi('json', {
           address,
           language
         })
       )
     );

     // Si aucun résultat n'a été trouvé
     if (!results[0].results.length) {
       console.log(`No results found for address: ${address}`);
       return null;
     }

     // On utilise le premier résultat comme référence
     const primaryResult = results[0].results[0];
     const { location } = primaryResult.geometry;

     // Construction du résultat avec les adresses dans différentes langues
     const addressesByLanguage = results.reduce((acc, result, index) => {
       if (result.results.length) {
         acc[languages[index]] = result.results[0].formatted_address;
       }
       return acc;
     }, {} as Record<Language, string>);

     // Extraction des composants d'adresse
     const components = primaryResult.address_components;
     const result: GeocodingResult = {
       coordinates: {
         lat: location.lat,
         lng: location.lng
       },
       address: {
         fr: addressesByLanguage.fr || '',
         ja: addressesByLanguage.ja || '',
         prefecture: components.find(
           c => c.types.includes('administrative_area_level_1')
         )?.long_name,
         city: components.find(
           c => c.types.includes('locality')
         )?.long_name,
         postalCode: components.find(
           c => c.types.includes('postal_code')
         )?.long_name
       },
       placeId: primaryResult.place_id,
       locationType: primaryResult.geometry.location_type,
       types: primaryResult.types
     };

     // Log pour le debugging
     console.log('Geocoding result:', {
       query: address,
       placeId: result.placeId,
       location: result.coordinates,
       prefecture: result.address.prefecture,
       city: result.address.city
     });

     return result;

   } catch (error) {
     console.error('Geocoding error:', error);
     throw error;
   }
 }

 async reverseGeocode(
   coordinates: { lat: number; lng: number },
   languages: Language[] = ['fr', 'ja']
 ): Promise<GeocodingResult | null> {
   try {
     // Récupérer les résultats dans toutes les langues demandées
     const results = await Promise.all(
       languages.map(language =>
         this.fetchGeocodingApi('json', {
           latlng: `${coordinates.lat},${coordinates.lng}`,
           language
         })
       )
     );

     // Si aucun résultat n'a été trouvé
     if (!results[0].results.length) {
       console.log(`No results found for coordinates:`, coordinates);
       return null;
     }

     // On utilise le premier résultat comme référence
     const primaryResult = results[0].results[0];

     // Construction du résultat avec les adresses dans différentes langues
     const addressesByLanguage = results.reduce((acc, result, index) => {
       if (result.results.length) {
         acc[languages[index]] = result.results[0].formatted_address;
       }
       return acc;
     }, {} as Record<Language, string>);

     // Extraction des composants d'adresse
     const components = primaryResult.address_components;
     const result: GeocodingResult = {
       coordinates,
       address: {
         fr: addressesByLanguage.fr || '',
         ja: addressesByLanguage.ja || '',
         prefecture: components.find(
           c => c.types.includes('administrative_area_level_1')
         )?.long_name,
         city: components.find(
           c => c.types.includes('locality')
         )?.long_name,
         postalCode: components.find(
           c => c.types.includes('postal_code')
         )?.long_name
       },
       placeId: primaryResult.place_id,
       locationType: primaryResult.geometry.location_type,
       types: primaryResult.types
     };

     return result;

   } catch (error) {
     console.error('Reverse geocoding error:', error);
     throw error;
   }
 }

 validateGeocodingResult(result: GeocodingResult): boolean {
   // Vérifier que les coordonnées sont dans les limites du Japon
   const { lat, lng } = result.coordinates;
   const bounds = GOOGLE_MAPS_CONFIG.geocoding.bounds;

   const isInJapan = 
     lat >= bounds.south && 
     lat <= bounds.north && 
     lng >= bounds.west && 
     lng <= bounds.east;

   if (!isInJapan) {
     console.warn('Coordinates outside Japan:', result.coordinates);
     return false;
   }

   // Vérifier la présence des informations essentielles
   if (!result.address.prefecture || !result.address.city) {
     console.warn('Missing essential address components:', result.address);
     return false;
   }

   return true;
 }
}