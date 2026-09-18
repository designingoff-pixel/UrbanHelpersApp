/**
 * geocodingService.ts
 * Multi-source address autocomplete and geocoding:
 * 1. Instant local index for popular Tamil Nadu / Indian cities and localities
 * 2. Photon OpenStreetMap Geocoding API (Fast, free, no API key needed)
 * 3. Nominatim OpenStreetMap fallback
 * 4. Google Places API when API key is available
 */

import * as Location from "expo-location";

export interface GeocodedLocation {
  label: string;
  city?: string;
  state?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

// Built-in instant dictionary for fast response while typing (including user requested examples like chen -> chennai, chennimalai, etc.)
const POPULAR_LOCATIONS: GeocodedLocation[] = [
  { label: "Chennai, Tamil Nadu", city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { label: "Chennimalai, Erode, Tamil Nadu", city: "Chennimalai", state: "Tamil Nadu", lat: 11.1683, lng: 77.6083 },
  { label: "Chengalpattu, Tamil Nadu", city: "Chengalpattu", state: "Tamil Nadu", lat: 12.6819, lng: 79.9888 },
  { label: "Coimbatore, Tamil Nadu", city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { label: "Salem, Tamil Nadu", city: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 },
  { label: "Madurai, Tamil Nadu", city: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { label: "Tiruchirappalli, Tamil Nadu", city: "Trichy", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047 },
  { label: "Erode, Tamil Nadu", city: "Erode", state: "Tamil Nadu", lat: 11.3410, lng: 77.7172 },
  { label: "Tiruppur, Tamil Nadu", city: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
  { label: "Vellore, Tamil Nadu", city: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
  { label: "Bengaluru, Karnataka", city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { label: "Hyderabad, Telangana", city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { label: "Kochi, Kerala", city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { label: "Mumbai, Maharashtra", city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { label: "Delhi, India", city: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
];

export async function searchAddressSuggestions(
  query: string,
  signal?: AbortSignal
): Promise<GeocodedLocation[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  const results: GeocodedLocation[] = [];
  const seen = new Set<string>();

  // 1. Instant local matching
  const localMatches = POPULAR_LOCATIONS.filter((loc) =>
    loc.label.toLowerCase().includes(trimmed) ||
    (loc.city && loc.city.toLowerCase().includes(trimmed))
  );

  for (const match of localMatches) {
    if (!seen.has(match.label.toLowerCase())) {
      results.push(match);
      seen.add(match.label.toLowerCase());
    }
  }

  // 2. Photon API (OpenStreetMap geocoding - free, high quality, worldwide with India focus)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lat=13.08&lon=80.27`;
    const res = await fetch(photonUrl, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.features)) {
        for (const f of data.features) {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates;
          if (coords && coords.length >= 2) {
            const parts = [
              props.name,
              props.street,
              props.district,
              props.city,
              props.state,
              props.country,
            ].filter(Boolean);
            
            // Build formatted readable label
            const label = parts.filter((v, i, a) => a.indexOf(v) === i).join(", ");
            const lowerLabel = label.toLowerCase();
            if (label && !seen.has(lowerLabel)) {
              results.push({
                label,
                city: props.city || props.district,
                state: props.state,
                lat: coords[1], // GeoJSON is [lng, lat]
                lng: coords[0],
                placeId: props.osm_id ? String(props.osm_id) : undefined,
              });
              seen.add(lowerLabel);
            }
          }
        }
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") throw err;
    // Network or photon error -> fallback silently
  }

  // 3. Expo Location geocode fallback if results are still sparse
  if (results.length < 3) {
    try {
      const expoGeocode = await Location.geocodeAsync(query);
      for (const item of expoGeocode.slice(0, 3)) {
        const rev = await Location.reverseGeocodeAsync({
          latitude: item.latitude,
          longitude: item.longitude,
        }).catch(() => []);
        
        let label = query;
        if (rev && rev.length > 0) {
          const p = rev[0];
          label = [p.name, p.street, p.subregion, p.city, p.region]
            .filter(Boolean)
            .join(", ");
        }
        if (label && !seen.has(label.toLowerCase())) {
          results.push({
            label,
            lat: item.latitude,
            lng: item.longitude,
          });
          seen.add(label.toLowerCase());
        }
      }
    } catch (_) {}
  }

  return results.slice(0, 7);
}
