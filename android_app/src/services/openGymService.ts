import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  OpenGymExercise,
  OpenGymSet,
  OpenGymActiveExercise,
  OpenGymSession,
  OpenGymRoutine,
  OpenGymBodyweightEntry,
  OPENGYM_EXERCISES,
  OPENGYM_EXERCISE_MAP,
  OPENGYM_ROUTINES,
  OPENGYM_WEEKLY_SCHEDULE,
} from "./openGymData";
import { addActivity } from "./healthLogService";

const STORAGE_KEYS = {
  ACTIVE_SESSION: "@opengym_active_session_v1",
  COMPLETED_SESSIONS: "@opengym_completed_sessions_v1",
  CUSTOM_ROUTINES: "@opengym_custom_routines_v1",
  BODYWEIGHT_LOG: "@opengym_bodyweight_log_v1",
};

/** Get currently active workout session */
export async function getActiveSession(): Promise<OpenGymSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading active OpenGym session:", e);
    return null;
  }
}

/** Start a new workout session from a routine or freestyle */
export async function startOpenGymSession(routineId?: string): Promise<OpenGymSession> {
  let routineName = "Freestyle Workout";
  let activeExercises: OpenGymActiveExercise[] = [];

  if (routineId) {
    const routines = await getAllRoutines();
    const found = routines.find((r) => r.id === routineId);
    if (found) {
      routineName = found.name;
      activeExercises = found.exerciseIds.map((exId) => {
        const ex = OPENGYM_EXERCISE_MAP[exId];
        const sets: OpenGymSet[] = [];
        const numSets = ex ? ex.defaultSets : 3;
        const reps = ex ? ex.defaultReps : 10;
        const weight = ex ? ex.defaultWeight : 20;

        for (let i = 1; i <= numSets; i++) {
          sets.push({
            setNumber: i,
            reps,
            weightKg: weight,
            completed: false,
          });
        }

        return {
          exerciseId: exId,
          name: ex ? ex.name : "Exercise",
          bodyPart: ex ? ex.bodyPart : "chest",
          equipment: ex ? ex.equipment : "Barbell",
          sets,
        };
      });
    }
  }

  // If freestyle with no exercises yet, add a starter bench press
  if (activeExercises.length === 0) {
    const defaultEx = OPENGYM_EXERCISES[0];
    activeExercises.push({
      exerciseId: defaultEx.id,
      name: defaultEx.name,
      bodyPart: defaultEx.bodyPart,
      equipment: defaultEx.equipment,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 20, completed: false },
        { setNumber: 2, reps: 10, weightKg: 20, completed: false },
        { setNumber: 3, reps: 10, weightKg: 20, completed: false },
      ],
    });
  }

  const newSession: OpenGymSession = {
    id: `opengym_${Date.now()}`,
    routineId,
    routineName,
    startTime: Date.now(),
    durationMins: 0,
    totalVolumeKg: 0,
    totalSetsCompleted: 0,
    caloriesBurned: 0,
    exercises: activeExercises,
  };

  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(newSession));
  return newSession;
}

/** Add exercise to active session */
export async function addExerciseToActiveSession(exerciseId: string): Promise<OpenGymSession | null> {
  const session = await getActiveSession();
  if (!session) return null;

  const ex = OPENGYM_EXERCISE_MAP[exerciseId];
  if (!ex) return session;

  const newActiveEx: OpenGymActiveExercise = {
    exerciseId: ex.id,
    name: ex.name,
    bodyPart: ex.bodyPart,
    equipment: ex.equipment,
    sets: [
      { setNumber: 1, reps: ex.defaultReps, weightKg: ex.defaultWeight, completed: false },
      { setNumber: 2, reps: ex.defaultReps, weightKg: ex.defaultWeight, completed: false },
      { setNumber: 3, reps: ex.defaultReps, weightKg: ex.defaultWeight, completed: false },
    ],
  };

  session.exercises.push(newActiveEx);
  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  return session;
}

/** Update a set within active session */
export async function updateActiveSet(
  exerciseIndex: number,
  setIndex: number,
  updates: Partial<OpenGymSet>
): Promise<OpenGymSession | null> {
  const session = await getActiveSession();
  if (!session) return null;

  if (session.exercises[exerciseIndex]?.sets[setIndex]) {
    session.exercises[exerciseIndex].sets[setIndex] = {
      ...session.exercises[exerciseIndex].sets[setIndex],
      ...updates,
    };

    // Recompute totals
    let vol = 0;
    let completedSets = 0;
    session.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          completedSets++;
          vol += (s.weightKg || 0) * (s.reps || 0);
        }
      });
    });

    session.totalVolumeKg = vol;
    session.totalSetsCompleted = completedSets;
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  }

  return session;
}

/** Add a new set to an exercise in active session */
export async function addSetToExercise(exerciseIndex: number): Promise<OpenGymSession | null> {
  const session = await getActiveSession();
  if (!session) return null;

  const ex = session.exercises[exerciseIndex];
  if (ex) {
    const lastSet = ex.sets[ex.sets.length - 1];
    const newSetNumber = ex.sets.length + 1;
    ex.sets.push({
      setNumber: newSetNumber,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 20,
      completed: false,
    });
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  }

  return session;
}

/** Remove a set from an exercise */
export async function removeSetFromExercise(exerciseIndex: number, setIndex: number): Promise<OpenGymSession | null> {
  const session = await getActiveSession();
  if (!session) return null;

  const ex = session.exercises[exerciseIndex];
  if (ex && ex.sets.length > 1) {
    ex.sets.splice(setIndex, 1);
    // Renumber sets
    ex.sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  }

  return session;
}

/** Remove an entire exercise from active session */
export async function removeExerciseFromSession(exerciseIndex: number): Promise<OpenGymSession | null> {
  const session = await getActiveSession();
  if (!session) return null;

  session.exercises.splice(exerciseIndex, 1);
  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  return session;
}

/** Cancel / discard active session */
export async function cancelActiveSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}

/** Finish active session and log to health records */
export async function finishActiveSession(notes?: string): Promise<{ session: OpenGymSession; activityId?: string } | null> {
  const session = await getActiveSession();
  if (!session) return null;

  const now = Date.now();
  session.endTime = now;
  const elapsedMs = now - session.startTime;
  const durationMins = Math.max(1, Math.round(elapsedMs / (1000 * 60)));
  session.durationMins = durationMins;

  // Compute total volume & sets
  let vol = 0;
  let setsDone = 0;
  session.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.completed) {
        setsDone++;
        vol += (s.weightKg || 0) * (s.reps || 0);
      }
    });
  });

  session.totalVolumeKg = vol;
  session.totalSetsCompleted = setsDone;
  session.notes = notes;

  // Estimate calories burned: ~7 kcal per minute of lifting, bonus for heavy volume
  const estCalories = Math.round(durationMins * 7 + (vol > 0 ? Math.min(250, vol * 0.04) : 0));
  session.caloriesBurned = estCalories;

  // 1. Save to completed sessions list
  const existingCompleted = await getCompletedSessions();
  existingCompleted.unshift(session);
  await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(existingCompleted));

  // 2. Clear active session
  await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);

  // 3. Log to customer health log so Fitness Dashboard radar and daily totals update!
  let activityId: string | undefined;
  try {
    const act = await addActivity({
      type: "gym",
      title: `OpenGym: ${session.routineName}`,
      durationMins,
      caloriesBurned: estCalories,
    });
    activityId = act.id;
  } catch (e) {
    console.error("Error logging OpenGym session to health log:", e);
  }

  return { session, activityId };
}

/** Get list of completed workout sessions */
export async function getCompletedSessions(): Promise<OpenGymSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading completed OpenGym sessions:", e);
    return [];
  }
}

/** Get all routines (standard presets + custom ones) */
export async function getAllRoutines(): Promise<OpenGymRoutine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES);
    const custom: OpenGymRoutine[] = raw ? JSON.parse(raw) : [];
    return [...OPENGYM_ROUTINES, ...custom];
  } catch (e) {
    return OPENGYM_ROUTINES;
  }
}

/** Save custom routine */
export async function saveCustomRoutine(routine: OpenGymRoutine): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES);
    const custom: OpenGymRoutine[] = raw ? JSON.parse(raw) : [];
    const idx = custom.findIndex((r) => r.id === routine.id);
    if (idx >= 0) {
      custom[idx] = routine;
    } else {
      custom.push(routine);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(custom));
  } catch (e) {
    console.error("Error saving custom routine:", e);
  }
}

/** Muscle Recovery Map: Computes recovery percentage for each muscle group based on recent volume */
export interface MuscleRecoveryItem {
  name: string;
  bodyPart: string;
  recoveryPct: number; // 0 - 100% (100% = fully recovered, < 50% = fatigued)
  status: "Fresh" | "Optimal" | "Recovering" | "Fatigued";
  color: string;
}

export async function calculateMuscleRecovery(): Promise<MuscleRecoveryItem[]> {
  const sessions = await getCompletedSessions();
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Track volume and sets completed in the last 72 hours per muscle group
  const fatigueMap: Record<string, number> = {
    chest: 0,
    back: 0,
    shoulders: 0,
    arms: 0,
    legs: 0,
    core: 0,
  };

  sessions.forEach((s) => {
    const ageMs = now - s.startTime;
    if (ageMs < 3 * ONE_DAY_MS) {
      // Weight decay over 3 days
      const decay = Math.max(0, 1 - ageMs / (3 * ONE_DAY_MS));
      s.exercises.forEach((ex) => {
        const bp = (ex.bodyPart || "").toLowerCase();
        let targetGroup = "core";
        if (bp.includes("chest")) targetGroup = "chest";
        else if (bp.includes("back")) targetGroup = "back";
        else if (bp.includes("shoulder")) targetGroup = "shoulders";
        else if (bp.includes("arm")) targetGroup = "arms";
        else if (bp.includes("leg")) targetGroup = "legs";

        const completedSets = ex.sets.filter((st) => st.completed).length;
        if (fatigueMap[targetGroup] !== undefined) {
          fatigueMap[targetGroup] += completedSets * 12 * decay;
        }
      });
    }
  });

  const muscleConfigs = [
    { name: "Chest (Pecs)", bodyPart: "chest", color: "#f43f5e" },
    { name: "Upper & Lat Back", bodyPart: "back", color: "#3b82f6" },
    { name: "Shoulders (Delts)", bodyPart: "shoulders", color: "#8b5cf6" },
    { name: "Arms (Biceps & Triceps)", bodyPart: "arms", color: "#f59e0b" },
    { name: "Legs (Quads & Glutes)", bodyPart: "legs", color: "#10b981" },
    { name: "Core & Abdominals", bodyPart: "core", color: "#ec4899" },
  ];

  return muscleConfigs.map((m) => {
    const fatigue = fatigueMap[m.bodyPart] || 0;
    // Calculate recovery percentage: higher fatigue = lower recovery %
    const recoveryPct = Math.max(25, Math.min(100, Math.round(100 - fatigue)));

    let status: "Fresh" | "Optimal" | "Recovering" | "Fatigued" = "Fresh";
    if (recoveryPct < 45) status = "Fatigued";
    else if (recoveryPct < 70) status = "Recovering";
    else if (recoveryPct < 90) status = "Optimal";

    return {
      name: m.name,
      bodyPart: m.bodyPart,
      recoveryPct,
      status,
      color: m.color,
    };
  });
}

/** Bodyweight Tracking */
export async function getBodyweightHistory(): Promise<OpenGymBodyweightEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BODYWEIGHT_LOG);
    if (!raw) {
      // Seed default baseline
      return [
        { id: "bw_1", weightKg: 74.5, date: "2026-10-15", timestamp: Date.now() - 6 * 86400000 },
        { id: "bw_2", weightKg: 74.2, date: "2026-10-18", timestamp: Date.now() - 3 * 86400000 },
        { id: "bw_3", weightKg: 73.8, date: "2026-10-21", timestamp: Date.now() },
      ];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function logBodyweight(weightKg: number): Promise<OpenGymBodyweightEntry> {
  const list = await getBodyweightHistory();
  const dateStr = new Date().toISOString().split("T")[0];
  const newEntry: OpenGymBodyweightEntry = {
    id: `bw_${Date.now()}`,
    weightKg: Math.round(weightKg * 10) / 10,
    date: dateStr,
    timestamp: Date.now(),
  };

  list.push(newEntry);
  await AsyncStorage.setItem(STORAGE_KEYS.BODYWEIGHT_LOG, JSON.stringify(list));
  return newEntry;
}

export { OPENGYM_EXERCISES, OPENGYM_EXERCISE_MAP, OPENGYM_ROUTINES, OPENGYM_WEEKLY_SCHEDULE };
