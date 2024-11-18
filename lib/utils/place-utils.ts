// lib/utils/place-utils.ts

export async function extractPlaceIdFromUrl(url: string = ''): Promise<string | null> {
  try {
    if (!url) {
      console.log('URL is empty');
      return null;
    }

    console.log('Processing URL:', url);

    // Nouvelle expression régulière pour extraire le nom du lieu
    const nameMatch = url.match(/maps\/place\/([^\/]+)(?:\/data=|\/|$|\?|#)/);
    if (nameMatch) {
      // Décoder le nom du lieu
      const placeName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
      console.log('Extracted place name:', placeName);

      // Appel à l'API Places pour rechercher le lieu
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
      const params = new URLSearchParams({
        input: placeName,
        inputtype: 'textquery',
        key: process.env.GOOGLE_MAPS_API_KEY || '',
        fields: 'place_id'
      });

      const response = await fetch(`${searchUrl}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Places API error: ${response.statusText}\nDetails: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (data.candidates?.[0]?.place_id) {
        const placeId = data.candidates[0].place_id;
        console.log('Found place ID:', placeId);
        return placeId;
      }
    }

    // Méthodes de secours pour extraire l'ID du lieu
    const placeIdMatch = url.match(/[?&]place_id=([^&]+)/);
    if (placeIdMatch) {
      console.log('Place ID parameter detected:', placeIdMatch[1]);
      return placeIdMatch[1];
    }

    const cidMatch = url.match(/[?&]cid=(\d+)/);
    if (cidMatch) {
      console.log('CID detected:', cidMatch[1]);
      return cidMatch[1];
    }

    console.warn('No valid Place ID pattern found in URL:', url);
    return null;

  } catch (error) {
    console.error('Error in extractPlaceIdFromUrl:', error);
    return null;
  }
}


  function convertToChIJFormat(hexId: string): string {
    // Exemple de conversion basique - à adapter selon le format exact attendu
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const parts = hexId.split(':');
    if (parts.length !== 2) return hexId;

    try {
      // Conversion du format hex en base32
      const num1 = BigInt('0x' + parts[0]);
      const num2 = BigInt('0x' + parts[1]);
      
      let result = 'ChIJ';
      // Conversion simplifiée - à améliorer selon les besoins exacts
      const combined = Number(num1) * Math.pow(2, 32) + Number(num2);
      
      for (let i = 0; i < 22; i++) {
        result += base32Chars[Math.floor(combined / Math.pow(2, 5 * i)) & 31];
      }

      return result;
    } catch (e) {
      console.error('Error converting hex to ChIJ format:', e);
      return hexId;
    }
  }
  
  export function validatePlaceId(placeId: string): boolean {
    console.log('Validating Place ID:', placeId);
    
    if (!placeId) {
      console.log('Place ID is empty');
      return false;
    }
  
    // Vérification des formats valides
    const validFormats = [
      /^ChIJ[a-zA-Z0-9_-]{20,}$/, // Format ChIJ standard
      /^[A-Za-z0-9_-]{27}$/, // Format Place ID standard
      /^\d{5,}$/ // Format CID (numérique)
    ];
  
    const isValid = validFormats.some(format => format.test(placeId));
    
    if (isValid) {
      console.log('Valid Place ID format');
      return true;
    }
  
    console.log('Invalid Place ID format');
    return false;
  }

  export async function validateGoogleMapsUrl(url: string): Promise<{ isValid: boolean, placeId: string | null }> {
    const placeId = await extractPlaceIdFromUrl(url);
    return { isValid: placeId ? validatePlaceId(placeId) : false, placeId };
  }
