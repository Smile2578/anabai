// lib/services/core/LocationService.ts
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';
import { GoogleLocation } from '@/types/google/base';
import { GeographicPoint } from '@/types/common';

export interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class LocationService {
  private static readonly japanBounds = GOOGLE_MAPS_CONFIG.geocoding.bounds;

  static validateCoordinates(coordinates: { lng: number; lat: number }): boolean {
    const { lat, lng } = coordinates;
    
    // Vérification basique des types
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      console.warn('Invalid coordinate types:', { lat, lng });
      return false;
    }

    // Vérification des limites globales
    if (
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      console.warn('Coordinates out of global bounds:', { lat, lng });
      return false;
    }

    // Vérification si dans les limites du Japon
    return this.isInJapan({ latitude: lat, longitude: lng });
  }

  static isInJapan(location: GoogleLocation): boolean {
    const { latitude, longitude } = location;
    const bounds = this.japanBounds;

    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  }

  static convertToGoogleLocation(point: GeographicPoint): GoogleLocation {
    return {
      latitude: point.coordinates.lat,
      longitude: point.coordinates.lng
    };
  }

  static convertToGeographicPoint(location: GoogleLocation): GeographicPoint {
    return {
      type: 'Point',
      coordinates: {
        lat: location.latitude,
        lng: location.longitude
      }
    };
  }

  static calculateDistance(point1: GoogleLocation, point2: GoogleLocation): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  static formatLocation(location: GoogleLocation): string {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  static parseLocation(locationString: string): GoogleLocation | null {
    try {
      const [lat, lng] = locationString.split(',').map(n => parseFloat(n.trim()));
      if (isNaN(lat) || isNaN(lng)) return null;
      
      return { latitude: lat, longitude: lng };
    } catch {
      return null;
    }
  }
}