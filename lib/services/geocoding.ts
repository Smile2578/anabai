// lib/services/geocoding.ts

interface GeocodingResult {
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
    private apiKey: string;
    
    constructor() {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_MAPS_API_KEY is not defined');
      }
      this.apiKey = apiKey;
    }
  
    private async fetchGeocodingApi(endpoint: string, params: Record<string, string>) {
      const url = new URL(`https://maps.googleapis.com/maps/api/geocode/${endpoint}`);
      url.searchParams.append('key', this.apiKey);
      
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
  
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
  
    async geocode(address: string, region = 'jp'): Promise<GeocodingResult> {
      // Récupérer les résultats en français
      const frResult = await this.fetchGeocodingApi('json', {
        address,
        region,
        language: 'fr'
      });
  
      // Récupérer les résultats en japonais
      const jaResult = await this.fetchGeocodingApi('json', {
        address,
        region,
        language: 'ja'
      });
  
      const location = frResult.results[0].geometry.location;
      const coordinates: [number, number] = [location.lng, location.lat];
  
      // Extraire les composants d'adresse
      const addressComponents = frResult.results[0].address_components;
      const prefecture = addressComponents.find(
        (c: any) => c.types.includes('administrative_area_level_1')
      )?.long_name;
      
      const city = addressComponents.find(
        (c: any) => c.types.includes('locality')
      )?.long_name;
      
      const postalCode = addressComponents.find(
        (c: any) => c.types.includes('postal_code')
      )?.long_name;
  
      return {
        coordinates,
        address: {
          fr: frResult.results[0].formatted_address,
          ja: jaResult.results[0].formatted_address,
          prefecture,
          city,
          postalCode
        },
        placeId: frResult.results[0].place_id
      };
    }
  
    async reverseGeocode(
      coordinates: [number, number],
      languages = ['fr', 'ja']
    ): Promise<GeocodingResult> {
      const [longitude, latitude] = coordinates;
      
      // Récupérer les résultats pour chaque langue
      const results = await Promise.all(
        languages.map(language =>
          this.fetchGeocodingApi('json', {
            latlng: `${latitude},${longitude}`,
            language
          })
        )
      );
  
      const [frResult, jaResult] = results;
      const addressComponents = frResult.results[0].address_components;
  
      return {
        coordinates,
        address: {
          fr: frResult.results[0].formatted_address,
          ja: jaResult.results[0].formatted_address,
          prefecture: addressComponents.find(
            (c: any) => c.types.includes('administrative_area_level_1')
          )?.long_name,
          city: addressComponents.find(
            (c: any) => c.types.includes('locality')
          )?.long_name,
          postalCode: addressComponents.find(
            (c: any) => c.types.includes('postal_code')
          )?.long_name
        },
        placeId: frResult.results[0].place_id
      };
    }
  }