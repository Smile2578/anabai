// lib/services/core/LocationService.ts
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class LocationService {
  private static readonly japanBounds = GOOGLE_MAPS_CONFIG.geocoding.bounds;

  static validateCoordinates(coordinates: [number, number]): boolean {
    const [longitude, latitude] = coordinates;
    
    // Vérification basique des types
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return false;
    }

    // Vérification des limites globales
    if (
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return false;
    }

    // Vérification si dans les limites du Japon
    return this.isInJapan({ latitude, longitude });
  }

  static isInJapan(coords: Coordinates): boolean {
    const { latitude, longitude } = coords;
    const bounds = this.japanBounds;

    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  }

  static convertCoordinates(coords: [number, number]): Coordinates {
    const [longitude, latitude] = coords;
    return { latitude, longitude };
  }

  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
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

  private static toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  static formatCoordinates(coordinates: Coordinates): string {
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
  }

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
}