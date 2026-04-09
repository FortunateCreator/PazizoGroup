/**
 * SmartLocationService - Handles high-precision GPS with IP fallback.
 * No API keys required for basic IP lookups.
 */

export interface UserLocation {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  source: 'gps' | 'ip';
}

export interface Hub {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

export const PAZIZO_HUBS: Hub[] = [
  { name: "Apapa Depot", lat: 6.4483, lng: 3.3522, region: "Lagos" },
  { name: "PH Refining Hub", lat: 4.8156, lng: 7.0498, region: "Rivers" },
  { name: "Kano Distribution Center", lat: 12.0022, lng: 8.5920, region: "Kano" },
  { name: "Ikeja Logistics Base", lat: 6.5965, lng: 3.3421, region: "Lagos" },
];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function getIntelligentLocation(): Promise<UserLocation> {
  // 1. Try GPS first (High Precision)
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });

    // Reverse geocode using a free service (nominatim)
    const revGeo = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
    );
    const geoData = await revGeo.json();
    
    return {
      city: geoData.address.city || geoData.address.town || "Unknown",
      state: geoData.address.state || "Unknown",
      country: geoData.address.country || "Nigeria",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      source: 'gps'
    };
  } catch (e) {
    console.warn("GPS failed or denied, falling back to IP...");
  }

  // 2. Fallback to Free IP API (ipapi.co free tier)
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      city: data.city,
      state: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      source: 'ip'
    };
  } catch (e) {
    // Final fallback: Default to Lagos
    return {
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      latitude: 6.5244,
      longitude: 3.3792,
      source: 'ip'
    };
  }
}
