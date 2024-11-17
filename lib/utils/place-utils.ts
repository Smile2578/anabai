// lib/utils/place-utils.ts

export function extractPlaceIdFromUrl(url: string = ''): string | null {
    try {
      if (!url) {
        console.log('URL is empty');
        return null;
      }
  
      console.log('Processing URL:', url);
  
      // Format: 0x.....:0x.....
      const hexMatch = url.match(/0x([0-9a-fA-F]+):0x([0-9a-fA-F]+)/);
      if (hexMatch) {
        const [_, firstPart, secondPart] = hexMatch;
        console.log('Hex format detected:', {
          firstPart,
          secondPart
        });
  
        // Conversion en CID (décimal)
        const cid = parseInt(secondPart, 16).toString();
        console.log('Converted to CID:', cid);
        return cid;
      }
  
      // Format ChIJ direct
      const chijMatch = url.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
      if (chijMatch) {
        console.log('Direct ChIJ format detected:', chijMatch[0]);
        return chijMatch[0];
      }
  
      console.warn('No valid Place ID pattern found in URL:', url);
      return null;
  
    } catch (error) {
      console.error('Error in extractPlaceIdFromUrl:', error);
      return null;
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
      /^ChIJ[a-zA-Z0-9_-]{20,}$/, // Format ChIJ
      /^\d+$/ // Format CID (numérique)
    ];
  
    const isValid = validFormats.some(format => format.test(placeId));
    
    if (isValid) {
      console.log('Valid Place ID format');
      return true;
    }
  
    console.log('Invalid Place ID format');
    return false;
  }