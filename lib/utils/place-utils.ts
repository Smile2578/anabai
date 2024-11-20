// lib/utils/place-utils.ts
export async function extractPlaceIdFromUrl(url: string = ''): Promise<string | null> {
  try {
    if (!url) {
      console.log('URL is empty');
      return null;
    }

    console.log('Processing URL:', url);

    // Extraire le nom du lieu pour la recherche
    const nameMatch = url.match(/maps\/place\/([^\/]+)(?:\/data=|\/|$|\?|#)/);
    if (nameMatch) {
      const placeName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
      console.log('Extracted place name:', placeName);

      const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY || '',
          'X-Goog-FieldMask': 'places.id'
        },
        body: JSON.stringify({
          textQuery: placeName,
          locationBias: {
            rectangle: {
              low: { latitude: 24, longitude: 122 },  // Sud-ouest du Japon
              high: { latitude: 46, longitude: 154 }  // Nord-est du Japon
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Places API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.places?.[0]?.id) {
        console.log('Found Place ID:', data.places[0].id);
        return data.places[0].id;
      }
    }

    console.warn('No valid Place ID pattern found in URL:', url);
    return null;

  } catch (error) {
    console.error('Error in extractPlaceIdFromUrl:', error);
    return null;
  }
}

export function validatePlaceId(placeId: string): boolean {
  if (!placeId) {
    console.log('Place ID is empty');
    return false;
  }

  // Le format de l'API Places v1 est différent
  const validFormats = [
    /^[A-Za-z0-9_-]{27}$/, // Format Place ID standard
  ];

  const isValid = validFormats.some(format => format.test(placeId));
  console.log(`Validating Place ID: ${placeId} - IsValid: ${isValid}`);
  return isValid;
}

export async function validateGoogleMapsUrl(url: string): Promise<{ isValid: boolean, placeId: string | null }> {
  const placeId = await extractPlaceIdFromUrl(url);
  const isValid = placeId ? validatePlaceId(placeId) : false;
  return { isValid, placeId };
}