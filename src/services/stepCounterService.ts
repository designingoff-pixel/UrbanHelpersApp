import { AppState, AppStateStatus, Platform } from "react-native";
import { Pedometer } from "expo-sensors";
import {
  getTodayKey,
  getStepBaseline,
  saveStepBaseline,
  saveTodayStepCount,
  getTodayStepCount,
  getStepHistory,
  saveDailyStepRecord,
  getStoredStepGoal,
  saveStoredStepGoal,
  DailyStepRecord,
  StepBaselineData,
} from "./healthLogService";
import {
  isNativeStepCounterAvailable,
  requestStepCounterPermissionsAsync,
  getNativeTotalSensorSteps,
  startNativeStepListening,
  StepCounterEvent,
} from "../../modules/step-counter";

export type StepUpdateListener = (steps: number) => void;

export interface StepCounterStatus {
  isAvailable: boolean;
  hasPermission: boolean;
  isTracking: boolean;
  unavailableReason?: string;
}

export interface WeeklyStepData {
  total: number;
  average: number;
  days: {
    day: string; // "Mon", "Tue", etc.
    date: string; // "YYYY-MM-DD"
    steps: number;
    isToday: boolean;
  }[];
}

export interface MonthlyStepData {
  total: number;
  count: number;
  average: number;
  daysRecorded: number;
}

export interface GoalProgressData {
  steps: number;
  goal: number;
  percentage: number;
  remaining: number;
  completed: boolean;
}

// In-memory runtime state
let currentTodaySteps = 0;
let totalHardwareSensorSteps = 0;
let isTrackingActive = false;
let isHardwareAvailable = false;
let hasActivityPermission = false;
let unavailableReasonText: string | undefined = undefined;

// Active listeners for UI updates
const stepListeners = new Set<StepUpdateListener>();

// Subscriptions
let nativeSubscriptionCleanup: (() => void) | null = null;
let expoPedometerSubscription: any = null;
let appStateSubscription: any = null;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Dispatch step updates to all registered UI listeners.
 */
function notifyStepListeners(steps: number) {
  currentTodaySteps = Math.max(0, steps);
  stepListeners.forEach((listener) => {
    try {
      listener(currentTodaySteps);
    } catch (e) {
      console.warn("[StepCounter] Listener notification error:", e);
    }
  });
}

/**
 * Check whether a physical hardware step counter is present on this device
 * and request the android.permission.ACTIVITY_RECOGNITION permission.
 */
export async function checkStepCounterAvailability(): Promise<StepCounterStatus> {
  // 1. First check the native Kotlin Android module
  const nativeAvailable = isNativeStepCounterAvailable();

  // 2. Fall back to expo-sensors Pedometer (which queries Sensor.TYPE_STEP_COUNTER on Android)
  let expoAvailable = false;
  try {
    expoAvailable = await Pedometer.isAvailableAsync();
  } catch (e) {
    console.log("[StepCounter] Pedometer.isAvailableAsync error:", e);
  }

  isHardwareAvailable = nativeAvailable || expoAvailable;

  if (!isHardwareAvailable) {
    unavailableReasonText =
      Platform.OS === "android"
        ? "Hardware step sensor (Sensor.TYPE_STEP_COUNTER) not detected on this device/emulator."
        : "Step counter hardware unavailable on this device.";
    return {
      isAvailable: false,
      hasPermission: false,
      isTracking: false,
      unavailableReason: unavailableReasonText,
    };
  }

  // 3. Check / request ACTIVITY_RECOGNITION permission
  let permGranted = false;
  try {
    if (nativeAvailable) {
      permGranted = await requestStepCounterPermissionsAsync();
    }
    if (!permGranted && Pedometer.requestPermissionsAsync) {
      const resp = await Pedometer.requestPermissionsAsync();
      permGranted = resp.granted;
    } else if (!permGranted && !Pedometer.requestPermissionsAsync) {
      permGranted = true;
    }
  } catch (err) {
    console.warn("[StepCounter] Permission request error:", err);
  }

  hasActivityPermission = permGranted;

  if (!permGranted) {
    unavailableReasonText = "Physical Activity Recognition permission denied.";
  } else {
    unavailableReasonText = undefined;
  }

  return {
    isAvailable: isHardwareAvailable,
    hasPermission: hasActivityPermission,
    isTracking: isTrackingActive,
    unavailableReason: unavailableReasonText,
  };
}

/**
 * Read the current today steps.
 */
export async function getTodaySteps(): Promise<number> {
  const saved = await getTodayStepCount();
  if (saved.date === getTodayKey()) {
    currentTodaySteps = Math.max(currentTodaySteps, saved.steps);
  }
  return currentTodaySteps;
}

/**
 * Get the total cumulative sensor steps reported by the hardware sensor since boot.
 */
export async function getTotalSensorSteps(): Promise<number> {
  const nativeTotal = getNativeTotalSensorSteps();
  if (nativeTotal > 0) {
    totalHardwareSensorSteps = nativeTotal;
  }
  return totalHardwareSensorSteps;
}

/**
 * Process incoming cumulative hardware steps from Sensor.TYPE_STEP_COUNTER.
 * Handles:
 * 1. Daily baseline persistence: todaySteps = currentSensor - startOfDaySensor + rebootOffset
 * 2. New calendar day detection and rollover (auto-archives yesterday to history)
 * 3. Phone reboot / sensor reset safe recovery (currentSensor < lastSensor)
 * 4. Duplicate prevention
 */
async function processHardwareSensorReading(cumulativeHardwareSteps: number) {
  if (cumulativeHardwareSteps <= 0) return;

  totalHardwareSensorSteps = cumulativeHardwareSteps;
  const todayKey = getTodayKey();
  let baseline = await getStepBaseline();

  // Case 1: Fresh start or Calendar Day Rollover
  if (!baseline || baseline.date !== todayKey) {
    // If there was a previous day's baseline with recorded steps, archive it to history
    if (baseline && baseline.recordedSteps > 0) {
      const dateObj = new Date(baseline.date);
      const dayLabel = DAY_NAMES[dateObj.getDay()] || "Day";
      const goal = await getStoredStepGoal();
      const distanceKm = Number(((baseline.recordedSteps * 0.762) / 1000).toFixed(2));
      const caloriesKcal = Math.round(baseline.recordedSteps * 0.04);

      await saveDailyStepRecord({
        date: baseline.date,
        dayLabel,
        steps: baseline.recordedSteps,
        goal,
        completed: baseline.recordedSteps >= goal,
        distanceKm,
        caloriesKcal,
      });
    }

    // Initialize new day baseline
    baseline = {
      date: todayKey,
      startOfDaySensorSteps: cumulativeHardwareSteps,
      lastSensorSteps: cumulativeHardwareSteps,
      recordedSteps: 0,
      rebootOffset: 0,
      lastUpdated: Date.now(),
    };
    currentTodaySteps = 0;
    await saveStepBaseline(baseline);
    await saveTodayStepCount(0);
    notifyStepListeners(0);
    return;
  }

  // Case 2: Phone Reboot / Sensor Counter Reset
  // On Android, TYPE_STEP_COUNTER resets to 0 upon device reboot.
  // If cumulativeHardwareSteps < baseline.lastSensorSteps, phone rebooted!
  if (cumulativeHardwareSteps < baseline.lastSensorSteps) {
    console.log(
      `[StepCounter] Device reboot detected! Prior lastSensor=${baseline.lastSensorSteps}, current=${cumulativeHardwareSteps}`
    );
    // The steps taken before reboot are preserved in baseline.recordedSteps
    baseline.rebootOffset = baseline.recordedSteps;
    baseline.startOfDaySensorSteps = cumulativeHardwareSteps;
    baseline.lastSensorSteps = cumulativeHardwareSteps;
  }

  // Case 3: Calculate today's steps: (currentSensor - startOfDaySensor) + rebootOffset
  const sensorDeltaSinceStartOfDay = Math.max(0, cumulativeHardwareSteps - baseline.startOfDaySensorSteps);
  const calculatedTodaySteps = sensorDeltaSinceStartOfDay + baseline.rebootOffset;

  // Prevent duplicate / downward count jumps
  if (calculatedTodaySteps >= baseline.recordedSteps) {
    baseline.recordedSteps = calculatedTodaySteps;
    baseline.lastSensorSteps = cumulativeHardwareSteps;
    baseline.lastUpdated = Date.now();

    await saveStepBaseline(baseline);
    await saveTodayStepCount(calculatedTodaySteps);
    notifyStepListeners(calculatedTodaySteps);
  }
}

/**
 * Start tracking real hardware steps.
 * Subscribes to the native Android SensorManager (or Expo Pedometer)
 * and maintains continuous background-aware updates.
 */
export async function startStepTracking(listener?: StepUpdateListener): Promise<void> {
  if (listener) {
    stepListeners.add(listener);
    // Immediately emit whatever is currently cached
    listener(currentTodaySteps);
  }

  if (isTrackingActive) {
    return;
  }

  // 1. Load today's persisted steps first
  const todayKey = getTodayKey();
  const baseline = await getStepBaseline();
  if (baseline && baseline.date === todayKey) {
    currentTodaySteps = baseline.recordedSteps;
    totalHardwareSensorSteps = baseline.lastSensorSteps;
  } else {
    const saved = await getTodayStepCount();
    if (saved.date === todayKey) {
      currentTodaySteps = saved.steps;
    }
  }
  notifyStepListeners(currentTodaySteps);

  // 2. Check availability and permissions
  const status = await checkStepCounterAvailability();
  if (!status.isAvailable || !status.hasPermission) {
    console.log("[StepCounter] Step counter unavailable or permission missing:", status.unavailableReason);
    return;
  }

  isTrackingActive = true;

  // 3. Try Native Android Step Counter Module first
  if (isNativeStepCounterAvailable()) {
    nativeSubscriptionCleanup = startNativeStepListening((event: StepCounterEvent) => {
      processHardwareSensorReading(event.totalSteps);
    });
  } else {
    // 4. Fall back to Expo Pedometer (which uses Android Sensor.TYPE_STEP_COUNTER)
    // Note: Expo pedometer watchStepCount emits cumulative delta steps for the active session.
    let sessionStartSteps = currentTodaySteps;
    expoPedometerSubscription = Pedometer.watchStepCount(async (event: any) => {
      if (event && typeof event.steps === "number") {
        const todayKeyNow = getTodayKey();
        let b = await getStepBaseline();

        // Check for midnight rollover
        if (!b || b.date !== todayKeyNow) {
          sessionStartSteps = 0;
          await processHardwareSensorReading(event.steps);
        } else {
          const updatedSteps = sessionStartSteps + event.steps;
          if (updatedSteps >= currentTodaySteps) {
            currentTodaySteps = updatedSteps;
            b.recordedSteps = updatedSteps;
            b.lastUpdated = Date.now();
            await saveStepBaseline(b);
            await saveTodayStepCount(updatedSteps);
            notifyStepListeners(updatedSteps);
          }
        }
      }
    });
  }

  // 5. Register AppState listener to handle background/foreground transitions
  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener("change", async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // App returned to foreground: refresh today's data and check for day rollover
        const activeBaseline = await getStepBaseline();
        if (activeBaseline && activeBaseline.date === getTodayKey()) {
          notifyStepListeners(activeBaseline.recordedSteps);
        } else {
          // Date rolled over while app was in background
          const today = await getTodaySteps();
          notifyStepListeners(today);
        }
      }
    });
  }
}

/**
 * Backward compatibility alias for startStepTracking
 */
export const initializeStepTracking = startStepTracking;

/**
 * Stop tracking real steps and release hardware sensor listeners.
 */
export function stopStepTracking(): void {
  if (nativeSubscriptionCleanup) {
    nativeSubscriptionCleanup();
    nativeSubscriptionCleanup = null;
  }
  if (expoPedometerSubscription) {
    expoPedometerSubscription.remove();
    expoPedometerSubscription = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  isTrackingActive = false;
}

/**
 * Subscribe a component to real-time step count changes.
 */
export function subscribeToStepCount(listener: StepUpdateListener): () => void {
  stepListeners.add(listener);
  listener(currentTodaySteps);

  return () => {
    stepListeners.delete(listener);
  };
}

/**
 * Get step counter hardware availability & permission status.
 */
export function getStepCounterStatus(): StepCounterStatus {
  return {
    isAvailable: isHardwareAvailable,
    hasPermission: hasActivityPermission,
    isTracking: isTrackingActive,
    unavailableReason: unavailableReasonText,
  };
}

/**
 * Get daily step history (past days).
 */
export async function getStepDailyHistory(): Promise<DailyStepRecord[]> {
  return await getStepHistory();
}

/**
 * Get weekly step statistics for the current 7-day week (Mon to Sun).
 * Incorporates past days' real history + today's live steps.
 */
export async function getWeeklyStepTotal(): Promise<WeeklyStepData> {
  const history = await getStepHistory();
  const todayKey = getTodayKey();
  const todaySteps = await getTodaySteps();

  const now = new Date();
  // Determine current Monday as the start of the week
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const days: WeeklyStepData["days"] = [];
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const dayName = DAY_NAMES[d.getDay()] || "Day";
    const isToday = dateStr === todayKey;

    let stepsForDay = 0;
    if (isToday) {
      stepsForDay = todaySteps;
    } else {
      const match = history.find((h) => h.date === dateStr);
      stepsForDay = match ? match.steps : 0;
    }

    days.push({
      day: dayName,
      date: dateStr,
      steps: stepsForDay,
      isToday,
    });
    total += stepsForDay;
  }

  const average = Math.round(total / 7);

  return {
    total,
    average,
    days,
  };
}

/**
 * Get monthly step statistics (for the current calendar month).
 */
export async function getMonthlyStepTotal(): Promise<MonthlyStepData> {
  const history = await getStepHistory();
  const todayKey = getTodayKey();
  const todaySteps = await getTodaySteps();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let total = 0;
  let daysRecorded = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr === todayKey) {
      total += todaySteps;
      if (todaySteps > 0) daysRecorded++;
    } else {
      const match = history.find((h) => h.date === dateStr);
      if (match && match.steps > 0) {
        total += match.steps;
        daysRecorded++;
      }
    }
  }

  const daysSoFar = now.getDate();
  const average = daysRecorded > 0 ? Math.round(total / daysRecorded) : Math.round(total / daysSoFar);

  return {
    total,
    count: daysSoFar,
    average,
    daysRecorded,
  };
}

/**
 * Get the current user-configured daily step goal.
 */
export async function getStepGoal(): Promise<number> {
  return await getStoredStepGoal();
}

/**
 * Set and persist a new daily step goal.
 */
export async function setStepGoal(goal: number): Promise<void> {
  await saveStoredStepGoal(goal);
}

/**
 * Get real progress toward the daily goal.
 */
export async function getProgressTowardGoal(): Promise<GoalProgressData> {
  const steps = await getTodaySteps();
  const goal = await getStoredStepGoal();
  const percentage = Math.min(100, Math.round((steps / goal) * 100));
  const remaining = Math.max(0, goal - steps);
  const completed = steps >= goal;

  return {
    steps,
    goal,
    percentage,
    remaining,
    completed,
  };
}
