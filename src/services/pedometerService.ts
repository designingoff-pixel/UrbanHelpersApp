import { Pedometer, Accelerometer } from "expo-sensors";
import { getTodayStepCount, saveTodayStepCount } from "./healthLogService";

type StepListener = (steps: number) => void;

let currentLiveSteps = 0;
let baseHistoricalSteps = 0;
let pedometerSubscription: any = null;
let accelerometerSubscription: any = null;
const listeners = new Set<StepListener>();

// Accelerometer fallback step detector variables
let lastStepTime = 0;
let lastMag = 1.0;
let stepPeakDetected = false;

/**
 * Notify all registered UI components of a step count update.
 */
function notifyListeners(steps: number) {
  currentLiveSteps = steps;
  listeners.forEach((listener) => {
    try {
      listener(steps);
    } catch (e) {
      console.warn("Step listener error:", e);
    }
  });
}

/**
 * Initialize and start tracking real steps.
 * Handles permissions, past step queries for today, live pedometer events,
 * and accelerometer fallback.
 */
export async function initializeStepTracking(): Promise<number> {
  try {
    // 1. Load any saved step count from today first
    const saved = await getTodayStepCount();
    baseHistoricalSteps = saved.steps || 0;
    currentLiveSteps = baseHistoricalSteps;
    notifyListeners(currentLiveSteps);

    // 2. Request Pedometer permission
    let hasPermission = false;
    try {
      if (Pedometer.requestPermissionsAsync) {
        const perm = await Pedometer.requestPermissionsAsync();
        hasPermission = perm.granted;
      } else {
        hasPermission = true;
      }
    } catch (e) {
      console.log("Pedometer permission check skipped or failed:", e);
    }

    // 3. Check Pedometer availability
    let isAvailable = false;
    try {
      isAvailable = await Pedometer.isAvailableAsync();
    } catch (e) {
      console.log("Pedometer isAvailableAsync error:", e);
    }

    if (isAvailable && hasPermission) {
      // 4. Query real historical steps for today (midnight to now)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const now = new Date();

      try {
        const stepResult = await Pedometer.getStepCountAsync(startOfDay, now);
        if (stepResult && typeof stepResult.steps === "number") {
          // Use maximum between hardware history and stored count
          baseHistoricalSteps = Math.max(stepResult.steps, baseHistoricalSteps);
          currentLiveSteps = baseHistoricalSteps;
          await saveTodayStepCount(currentLiveSteps);
          notifyListeners(currentLiveSteps);
        }
      } catch (err) {
        console.log("Could not query historical step count:", err);
      }

      // 5. Attach real-time pedometer watcher for new steps
      if (!pedometerSubscription) {
        pedometerSubscription = Pedometer.watchStepCount((event: any) => {
          if (event && typeof event.steps === "number") {
            const total = baseHistoricalSteps + event.steps;
            currentLiveSteps = total;
            saveTodayStepCount(total);
            notifyListeners(total);
          }
        });
      }
    } else {
      // 6. Accelerometer motion step detection fallback (for emulators / unsupported sensors)
      startAccelerometerStepDetection();
    }

    return currentLiveSteps;
  } catch (error) {
    console.error("Error initializing step tracking:", error);
    return currentLiveSteps;
  }
}

/**
 * Accelerometer fallback that detects physical walking motion
 * when dedicated hardware pedometer is unavailable.
 */
function startAccelerometerStepDetection() {
  if (accelerometerSubscription) return;

  try {
    Accelerometer.setUpdateInterval(100); // 10Hz sampling
    accelerometerSubscription = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      // Detect peak and valley indicative of human walking cadence (280ms - 2000ms)
      if (mag > 1.25 && lastMag <= 1.25) {
        stepPeakDetected = true;
      } else if (stepPeakDetected && mag < 0.95) {
        if (now - lastStepTime > 280) {
          lastStepTime = now;
          stepPeakDetected = false;
          currentLiveSteps += 1;
          saveTodayStepCount(currentLiveSteps);
          notifyListeners(currentLiveSteps);
        }
      }
      lastMag = mag;
    });
  } catch (err) {
    console.log("Accelerometer fallback not available:", err);
  }
}

/**
 * Subscribe a component to real-time step count changes.
 */
export function subscribeToStepCount(listener: StepListener): () => void {
  listeners.add(listener);
  // Send current cached value immediately
  listener(currentLiveSteps);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get the current real step count.
 */
export function getCurrentLiveSteps(): number {
  return currentLiveSteps;
}
