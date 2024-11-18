// lib/services/location.ts

interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  interface LocationBounds {
    north: number;  // max latitude
    south: number;  // min latitude
    east: number;   // max longitude
    west: number;   // min longitude
  }
  
  export class LocationService {
    // Limites géographiques du Japon
    private static readonly JAPAN_BOUNDS: LocationBounds = {
      north: 45.7,  // Hokkaido
      south: 24.0,  // Okinawa
      east: 154.0,  // Îles Ogasawara
      west: 122.0   // Îles Yonaguni
    };
  
    // Vérifier si des coordonnées sont dans les limites du Japon
    static isInJapan(coordinates: Coordinates): boolean {
      const { latitude, longitude } = coordinates;
      const { north, south, east, west } = this.JAPAN_BOUNDS;
  
      return (
        latitude >= south &&
        latitude <= north &&
        longitude >= west &&
        longitude <= east
      );
    }
  
    // Convertir des coordonnées [longitude, latitude] en {latitude, longitude}
    static convertCoordinates(coords: [number, number]): Coordinates {
      const [longitude, latitude] = coords;
      return { latitude, longitude };
    }
  
    // Calculer la distance entre deux points (en kilomètres)
    static calculateDistance(
      coord1: Coordinates,
      coord2: Coordinates
    ): number {
      const R = 6371; // Rayon de la Terre en km
      const dLat = this.toRad(coord2.latitude - coord1.latitude);
      const dLon = this.toRad(coord2.longitude - coord1.longitude);
      const lat1 = this.toRad(coord1.latitude);
      const lat2 = this.toRad(coord2.latitude);
  
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  
    // Convertir des degrés en radians
    private static toRad(degrees: number): number {
      return degrees * Math.PI / 180;
    }
  
    // Vérifier la validité des coordonnées
    static validateCoordinates(coordinates: any): boolean {
      // Vérifier le format
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
      }
  
      const [longitude, latitude] = coordinates;
  
      // Vérifier les types et les plages
      if (
        typeof longitude !== 'number' ||
        typeof latitude !== 'number' ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        return false;
      }
  
      return true;
    }
  
    // Extraire les coordonnées d'un string (format "lat,lng")
    static parseCoordinates(coordString: string): Coordinates | null {
      try {
        const [lat, lng] = coordString.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) {
          return null;
        }
        return { latitude: lat, longitude: lng };
      } catch {
        return null;
      }
    }
  
    // Formater les coordonnées pour l'affichage
    static formatCoordinates(coordinates: Coordinates): string {
      return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
    }
  
    // Obtenir un point aléatoire dans le Japon (pour les tests)
    static getRandomJapanLocation(): Coordinates {
      const { north, south, east, west } = this.JAPAN_BOUNDS;
      
      const latitude = south + Math.random() * (north - south);
      const longitude = west + Math.random() * (east - west);
      
      return { latitude, longitude };
    }
  }