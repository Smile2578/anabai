// lib/utils/validation.ts
export function validateJapanCoordinates(location: { lat: number; lng: number }): boolean {
    // Coordonnées approximatives du Japon (incluant Okinawa)
    const JAPAN_BOUNDS = {
      north: 45.7, // Hokkaido
      south: 24.0, // Okinawa
      east: 154.0, // Îles Ogasawara
      west: 122.0  // Îles Yonaguni
    };
  
    return (
      location.lat >= JAPAN_BOUNDS.south &&
      location.lat <= JAPAN_BOUNDS.north &&
      location.lng >= JAPAN_BOUNDS.west &&
      location.lng <= JAPAN_BOUNDS.east
    );
  }

  export function validatePlaceResult(place: any): boolean {
    const requiredFields = [
      'name.fr',
      'location.coordinates',
      'location.address.fr',
      'category'
    ];
  
    return requiredFields.every(field => {
      const parts = field.split('.');
      let value = place;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return false;
      }
      return true;
    });
  }