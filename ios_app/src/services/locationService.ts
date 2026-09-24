// ─────────────────────────────────────────────────────────────────────────────
// locationService.ts — Customer App
// Utilities for distance calculation, ETA, and demo simulation.
// Used by LiveTrackingScreen to show real ETA and demo vendor movement.
// ─────────────────────────────────────────────────────────────────────────────

// ── Haversine distance ────────────────────────────────────────────────────────
export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── ETA from distance ─────────────────────────────────────────────────────────
export function calculateETA(distanceKm: number): number {
  const avgSpeedKmh = 25; // city average
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

// ── Format ETA for display ────────────────────────────────────────────────────
export function formatETA(minutes: number): string {
  if (minutes < 1)  return "Arriving now";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Format distance for display ───────────────────────────────────────────────
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Simulation
// Used when no real vendor GPS is available yet.
// Moves a fake vendor from 2km north → customer location over ~90 seconds.
// ─────────────────────────────────────────────────────────────────────────────

export interface SimCoords {
  lat:     number;
  lng:     number;
  heading: number;
  speed:   number; // km/h
}

const DEMO_TOTAL_STEPS = 30;   // 30 steps × 3s = 90 seconds
const DEMO_INTERVAL_MS = 3000; // move every 3 seconds

/**
 * Starts a demo simulation of a vendor moving toward the customer.
 * Calls onUpdate every 3 seconds with new coords.
 * Returns a cleanup function — call it when real GPS arrives or component unmounts.
 */
export function startDemoSimulation(
  customerLat: number,
  customerLng: number,
  onUpdate:    (coords: SimCoords) => void,
  onArrived?:  () => void,
): () => void {
  // Start 2km north of customer
  const startLat = customerLat + 0.018; // ~2km north
  const startLng = customerLng;

  let step = 0;

  const timer = setInterval(() => {
    step++;

    const progress = Math.min(step / DEMO_TOTAL_STEPS, 1);

    // Lerp toward customer
    const lat = startLat + (customerLat - startLat) * progress;
    const lng = startLng + (customerLng - startLng) * progress;

    // Heading: pointing south (toward customer)
    const heading = 180;

    // Speed tapers to 0 as vendor approaches
    const speed = progress < 0.9 ? 25 * (1 - progress * 0.5) : 5;

    onUpdate({ lat, lng, heading, speed: Math.round(speed) });

    if (progress >= 1) {
      clearInterval(timer);
      onArrived?.();
    }
  }, DEMO_INTERVAL_MS);

  // Return cleanup
  return () => clearInterval(timer);
}
