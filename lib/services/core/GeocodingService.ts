// lib/services/core/GeocodingService.ts
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';

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
      }
    };
    address_components: AddressComponent[];
    place_id: string;
  }[];
  status: string;
}

export interface GeocodingResult {
  coordinates: [number, number];
  address: {
    fr: string;
    ja: string;
    prefecture?: string;
    city?: string;
    postalCode?: string;
  };
  placeId?: string;
}

export class GeocodingService {
  private async fetchGeocodingApi(
    endpoint: string, 
    params: Record<string, string>
  ): Promise<GeocodingResponse> {
    const url = new URL(`https://maps.googleapis.com/maps/api/geocode/${endpoint}`);
    
    // Ajouter les paramètres
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
    url.searchParams.append('key', GOOGLE_MAPS_CONFIG.apiKey || '');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    return data;
  }

  async geocode(address: string): Promise<GeocodingResult> {
    // Récupérer en parallèle les versions FR et JA
    const [frResult, jaResult] = await Promise.all([
      this.fetchGeocodingApi('json', {
        address,
        region: GOOGLE_MAPS_CONFIG.geocoding.region,
        language: 'fr'
      }),
      this.fetchGeocodingApi('json', {
        address,
        region: GOOGLE_MAPS_CONFIG.geocoding.region,
        language: 'ja'
      })
    ]);

    const location = frResult.results[0].geometry.location;
    const coordinates: [number, number] = [location.lng, location.lat];

    const components = frResult.results[0].address_components;
    return {
      coordinates,
      address: {
        fr: frResult.results[0].formatted_address,
        ja: jaResult.results[0].formatted_address,
        prefecture: components.find(
          (c: AddressComponent) => c.types.includes('administrative_area_level_1')
        )?.long_name,
        city: components.find(
          (c: AddressComponent) => c.types.includes('locality')
        )?.long_name,
        postalCode: components.find(
          (c: AddressComponent) => c.types.includes('postal_code')
        )?.long_name
      },
      placeId: frResult.results[0].place_id
    };
  }

  async reverseGeocode(coordinates: [number, number]): Promise<GeocodingResult> {
    const [longitude, latitude] = coordinates;
    
    const [frResult, jaResult] = await Promise.all([
      this.fetchGeocodingApi('json', {
        latlng: `${latitude},${longitude}`,
        language: 'fr'
      }),
      this.fetchGeocodingApi('json', {
        latlng: `${latitude},${longitude}`,
        language: 'ja'
      })
    ]);

    const components = frResult.results[0].address_components;
    return {
      coordinates,
      address: {
        fr: frResult.results[0].formatted_address,
        ja: jaResult.results[0].formatted_address,
        prefecture: components.find(
          (c: AddressComponent) => c.types.includes('administrative_area_level_1')
        )?.long_name,
        city: components.find(
          (c: AddressComponent) => c.types.includes('locality')
        )?.long_name,
        postalCode: components.find(
          (c: AddressComponent) => c.types.includes('postal_code')
        )?.long_name
      },
      placeId: frResult.results[0].place_id
    };
  }

  validateCoordinates(coordinates: [number, number]): boolean {
    const [longitude, latitude] = coordinates;
    const { bounds } = GOOGLE_MAPS_CONFIG.geocoding;

    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  }
}