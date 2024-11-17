import { Loader } from '@googlemaps/js-api-loader';

// Initialisation du loader Google Maps
const loader = new Loader({
  apiKey: process.env.GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geocoding']
});

// Fonction pour géocoder une adresse
export async function geocodeAddress(address: string) {
  await loader.importLibrary('geocoding');
  const geocoder = new google.maps.Geocoder();
  
  try {
    const response = await geocoder.geocode({ address });
    if (response.results.length > 0) {
      const location = response.results[0].geometry.location;
      return {
        coordinates: [location.lat(), location.lng()],
        formattedAddress: response.results[0].formatted_address
      };
    }
    throw new Error('Aucun résultat trouvé');
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    throw error;
  }
}

// Fonction pour obtenir les détails d'un lieu via Places API
export async function getPlaceDetails(placeId: string) {
  await loader.load();
  const service = new google.maps.places.PlacesService(document.createElement('div'));

  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'photos', 'opening_hours', 'website', 'formatted_phone_number']
      },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Erreur Places API: ${status}`));
        }
      }
    );
  });
}

// Fonction pour obtenir l'URL d'une photo
export async function getPhotoUrl(photoReference: string, maxWidth: number = 800) {
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/photo';
  return `${baseUrl}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
}

// Fonction pour calculer la distance entre deux points
export function calculateDistance(
  origin: [number, number],
  destination: [number, number]
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(destination[0] - origin[0]);
  const dLon = toRad(destination[1] - origin[1]);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(origin[0])) * Math.cos(toRad(destination[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}