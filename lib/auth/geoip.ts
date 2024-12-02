// lib/auth/geoip.ts

interface GeoLocation {
  country: string;
  city: string;
  region: string;
  timezone: string;
}

export async function getIpLocation(ip: string): Promise<GeoLocation> {
  try {
    // Éviter de faire une requête pour localhost ou IPs invalides
    if (ip === 'unknown' || ip === 'localhost' || ip === '127.0.0.1') {
      return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'Unknown'
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,regionName,timezone`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country,
        city: data.city,
        region: data.regionName,
        timezone: data.timezone
      };
    }

    throw new Error(data.message || 'Failed to get location');
  } catch (error) {
    console.error('Error getting IP location:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown'
    };
  }
} 