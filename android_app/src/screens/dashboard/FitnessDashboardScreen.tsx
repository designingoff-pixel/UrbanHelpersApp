import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import {
  ActivityItem,
  ActivityType,
  addActivity,
  getActivities,
  getDailyActivityTotals,
  deleteActivity,
} from "@/services/healthLogService";
import { getTodayStepCount } from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "FitnessDashboard">;
const { width: SW } = Dimensions.get("window");

// ── Essential Workout Categories ───────────────────────────────────────────
interface QuickWorkoutMode {
  id: ActivityType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  calPerMin: number;
  gradient: [string, string];
  accentColor: string;
}

const QUICK_MODES: QuickWorkoutMode[] = [
  {
    id: "running",
    title: "Running & Walk",
    subtitle: "Outdoor / Treadmill",
    icon: "fitness-outline",
    calPerMin: 9.5,
    gradient: ["#1e3a8a", "#0284c7"],
    accentColor: "#38bdf8",
  },
  {
    id: "gym",
    title: "Strength & Gym",
    subtitle: "Weights & Conditioning",
    icon: "barbell-outline",
    calPerMin: 7.0,
    gradient: ["#0f766e", "#059669"],
    accentColor: "#34d399",
  },
  {
    id: "yoga",
    title: "Yoga & Stretch",
    subtitle: "Flexibility & Recovery",
    icon: "body-outline",
    calPerMin: 4.5,
    gradient: ["#581c87", "#7e22ce"],
    accentColor: "#c084fc",
  },
  {
    id: "cycling",
    title: "Cycling & Cardio",
    subtitle: "Pace & Endurance",
    icon: "bicycle-outline",
    calPerMin: 8.0,
    gradient: ["#c2410c", "#ea580c"],
    accentColor: "#fb923c",
  },
];

// ── Curated Essential Routines ──────────────────────────────────────────────
interface CuratedRoutine {
  id: string;
  name: string;
  durationMins: number;
  estCalories: number;
  intensity: "Easy" | "Medium" | "High";
  icon: keyof typeof Ionicons.glyphMap;
  exercises: string[];
}

const CURATED_ROUTINES: CuratedRoutine[] = [
  {
    id: "hiit_quick",
    name: "15-Min Quick HIIT",
    durationMins: 15,
    estCalories: 140,
    intensity: "High",
    icon: "flash-outline",
    exercises: ["Jumping Jacks (45s)", "High Knees (45s)", "Bodyweight Squats (45s)", "Mountain Climbers (45s)", "Plank Hold (60s)"],
  },
  {
    id: "core_blast",
    name: "Core & Abs Blast",
    durationMins: 12,
    estCalories: 95,
    intensity: "Medium",
    icon: "shield-checkmark-outline",
    exercises: ["Bicycle Crunches (20 reps)", "Leg Raises (15 reps)", "Plank Rotations (12 reps)", "Russian Twists (25 reps)"],
  },
  {
    id: "mobility_stretch",
    name: "Evening Mobility & Stretch",
    durationMins: 10,
    estCalories: 45,
    intensity: "Easy",
    icon: "leaf-outline",
    exercises: ["Cat-Cow Flow (60s)", "Downward Dog Stretch (45s)", "Child's Pose (60s)", "Hip Flexor Stretch (45s)"],
  },
];

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "running", label: "Run", icon: "fitness" },
  { type: "walking", label: "Walk", icon: "walk" },
  { type: "gym", label: "Gym", icon: "barbell" },
  { type: "yoga", label: "Yoga", icon: "body" },
  { type: "cycling", label: "Cycle", icon: "bicycle" },
  { type: "swimming", label: "Swim", icon: "water" },
  { type: "other", label: "Other", icon: "sparkles" },
];

export default function FitnessDashboardScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [loggedActivities, setLoggedActivities] = useState<ActivityItem[]>([]);
  const [totals, setTotals] = useState({ totalMins: 0, totalCalories: 0, totalDistanceKm: 0, count: 0 });
  const [todaySteps, setTodaySteps] = useState(0);

  // Manual Log Modal
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logType, setLogType] = useState<ActivityType>("running");
  const [logTitle, setLogTitle] = useState("");
  const [logDuration, setLogDuration] = useState("30");
  const [logDistance, setLogDistance] = useState("3.0");
  const [logCalories, setLogCalories] = useState("200");

  // Active Live Workout Session Modal
  const [activeWorkout, setActiveWorkout] = useState<QuickWorkoutMode | null>(null);
  const [workoutElapsedSecs, setWorkoutElapsedSecs] = useState(0);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Routine Preview Modal
  const [previewRoutine, setPreviewRoutine] = useState<CuratedRoutine | null>(null);

  const loadData = async () => {
    try {
      const list = await getActivities();
      const tot = await getDailyActivityTotals();
      const stepData = await getTodayStepCount();
      const count = typeof stepData === "number" ? stepData : (stepData?.steps || 0);
      setLoggedActivities(list);
      setTotals(tot);
      setTodaySteps(count);
    } catch (e) {
      console.warn("Error loading fitness data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer Effect for Live Workout
  useEffect(() => {
    if (activeWorkout && !isWorkoutPaused) {
      timerRef.current = setInterval(() => {
        setWorkoutElapsedSecs((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeWorkout, isWorkoutPaused]);

  // Start Live Workout
  const handleStartQuickWorkout = (mode: QuickWorkoutMode) => {
    setActiveWorkout(mode);
    setWorkoutElapsedSecs(0);
    setIsWorkoutPaused(false);
  };

  // Finish Live Workout
  const handleFinishLiveWorkout = async () => {
    if (!activeWorkout) return;
    const durationMins = Math.max(1, Math.round(workoutElapsedSecs / 60));
    const caloriesBurned = Math.round(durationMins * activeWorkout.calPerMin);

    try {
      await addActivity({
        type: activeWorkout.id,
        title: `${activeWorkout.title} Session`,
        durationMins,
        caloriesBurned,
      });
      setActiveWorkout(null);
      setWorkoutElapsedSecs(0);
      await loadData();
      Alert.alert(
        "🎉 Workout Completed!",
        `Great job! You crushed ${durationMins} min of ${activeWorkout.title} and burned ~${caloriesBurned} kcal.`
      );
    } catch (e) {
      console.warn("Failed to save live workout:", e);
      setActiveWorkout(null);
    }
  };

  // Cancel Live Workout
  const handleCancelLiveWorkout = () => {
    Alert.alert("Discard Workout?", "Are you sure you want to exit without saving this session?", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          setActiveWorkout(null);
          setWorkoutElapsedSecs(0);
        },
      },
    ]);
  };

  // Save Manual Activity
  const handleSaveManualActivity = async () => {
    const mins = parseInt(logDuration, 10) || 0;
    const dist = parseFloat(logDistance) || 0;
    const cals = parseInt(logCalories, 10) || 0;

    if (mins <= 0 && cals <= 0) {
      Alert.alert("Invalid Input", "Please enter duration or calories burned.");
      return;
    }

    const defaultTitle = ACTIVITY_TYPES.find((t) => t.type === logType)?.label || "Workout";
    await addActivity({
      type: logType,
      title: logTitle.trim() || `${defaultTitle} Session`,
      durationMins: mins,
      distanceKm: dist > 0 ? dist : undefined,
      caloriesBurned: cals,
    });

    setLogTitle("");
    setLogDuration("30");
    setLogDistance("");
    setLogCalories("200");
    setLogModalVisible(false);
    await loadData();
  };

  // Delete Logged Activity
  const handleDeleteActivity = (id: string) => {
    Alert.alert("Delete Activity", "Are you sure you want to remove this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteActivity(id);
          await loadData();
        },
      },
    ]);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Target Goals
  const targetMins = 60;
  const progressRatio = Math.min(1, totals.totalMins / targetMins);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Fitness</Text>
          <Text style={s.headerSubtitle}>Stay active, track workouts & goals</Text>
        </View>

        <Pressable
          style={s.logPillBtn}
          onPress={() => setLogModalVisible(true)}
        >
          <Ionicons name="add" size={18} color="#041423" />
          <Text style={s.logPillBtnText}>Log Workout</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── 1. Daily Activity Vitals Hero Card ──────────────────── */}
        <View style={s.vitalsCard}>
          <View style={s.vitalsHeader}>
            <View style={s.vitalsTitleWrap}>
              <Ionicons name="pulse" size={20} color={colors.secondary} />
              <Text style={s.vitalsTitle}>Today's Activity</Text>
            </View>
            <View style={s.goalBadge}>
              <Text style={s.goalBadgeText}>{Math.round(progressRatio * 100)}% of Goal</Text>
            </View>
          </View>

          {/* 3 Metric Pills */}
          <View style={s.metricGrid}>
            <View style={s.metricBox}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={s.metricVal}>{totals.totalMins}</Text>
              <Text style={s.metricUnit}>Active mins</Text>
            </View>

            <View style={s.metricBox}>
              <Ionicons name="flame" size={18} color="#fb923c" />
              <Text style={s.metricVal}>{totals.totalCalories}</Text>
              <Text style={s.metricUnit}>Calories (kcal)</Text>
            </View>

            <View style={s.metricBox}>
              <Ionicons name="footsteps" size={18} color={colors.secondary} />
              <Text style={s.metricVal}>{todaySteps.toLocaleString()}</Text>
              <Text style={s.metricUnit}>Steps today</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={s.progressBarTrack}>
            <LinearGradient
              colors={["#0284c7", "#38bdf8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressBarFill, { width: `${Math.max(6, progressRatio * 100)}%` }]}
            />
          </View>
          <View style={s.progressLabels}>
            <Text style={s.progressLabelText}>{totals.totalMins} min done</Text>
            <Text style={s.progressLabelText}>{targetMins} min daily goal</Text>
          </View>
        </View>

        {/* ── 2. Quick-Start Workout Modes (One Tap Start) ────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Start Workout</Text>
          <Text style={s.sectionSub}>Tap to start live tracking</Text>
        </View>

        <View style={s.modesGrid}>
          {QUICK_MODES.map((mode) => (
            <Pressable
              key={mode.id}
              style={({ pressed }) => [s.modeCard, pressed && s.cardPressed]}
              onPress={() => handleStartQuickWorkout(mode)}
            >
              <LinearGradient
                colors={mode.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.modeGrad}
              >
                <View style={s.modeTopRow}>
                  <View style={s.modeIconCircle}>
                    <Ionicons name={mode.icon} size={22} color="#ffffff" />
                  </View>
                  <View style={s.playIconPill}>
                    <Ionicons name="play" size={14} color="#ffffff" />
                  </View>
                </View>

                <Text style={s.modeTitle}>{mode.title}</Text>
                <Text style={s.modeSubtitle}>{mode.subtitle}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* ── 3. Curated Quick Routines (Essential & Clean) ───────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Featured Routines</Text>
          <Text style={s.sectionSub}>Guided quick sets</Text>
        </View>

        <View style={s.routinesList}>
          {CURATED_ROUTINES.map((routine) => (
            <Pressable
              key={routine.id}
              style={({ pressed }) => [s.routineCard, pressed && s.cardPressed]}
              onPress={() => setPreviewRoutine(routine)}
            >
              <View style={s.routineIconBox}>
                <Ionicons name={routine.icon} size={22} color={colors.primary} />
              </View>

              <View style={s.routineInfo}>
                <Text style={s.routineName}>{routine.name}</Text>
                <View style={s.routineMetaRow}>
                  <Text style={s.routineMetaText}>⏱️ {routine.durationMins} mins</Text>
                  <Text style={s.routineMetaDot}>•</Text>
                  <Text style={s.routineMetaText}>🔥 ~{routine.estCalories} kcal</Text>
                </View>
              </View>

              <View style={s.routineBadge}>
                <Text style={s.routineBadgeText}>{routine.intensity}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── 4. Today's Completed Workouts ──────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today's Log</Text>
          <Text style={s.sectionSub}>{loggedActivities.length} sessions</Text>
        </View>

        {loggedActivities.length === 0 ? (
          <View style={s.emptyLogCard}>
            <Ionicons name="barbell-outline" size={32} color={colors.text.muted} />
            <Text style={s.emptyLogTitle}>No Workouts Logged Today</Text>
            <Text style={s.emptyLogSub}>
              Tap any workout above to begin or tap "+ Log Workout" to add an entry manually.
            </Text>
          </View>
        ) : (
          loggedActivities.map((act) => (
            <View key={act.id} style={s.logItemCard}>
              <View style={s.logItemLeft}>
                <View style={s.logIconCircle}>
                  <Ionicons
                    name={
                      act.type === "running"
                        ? "fitness"
                        : act.type === "gym"
                        ? "barbell"
                        : act.type === "yoga"
                        ? "body"
                        : act.type === "cycling"
                        ? "bicycle"
                        : "walk"
                    }
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={s.logItemInfo}>
                  <Text style={s.logItemTitle}>{act.title}</Text>
                  <Text style={s.logItemMeta}>
                    {act.time} • {act.durationMins} mins • {act.caloriesBurned} kcal
                    {act.distanceKm ? ` • ${act.distanceKm} km` : ""}
                  </Text>
                </View>
              </View>

              <Pressable
                style={s.deleteBtn}
                onPress={() => handleDeleteActivity(act.id)}
              >
                <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Samsung Bottom Navigation ─────────────────────────────── */}
      <SamsungBottomNav activeRoute="FitnessDashboard" />

      {/* ── 5. Live Workout Active Screen Modal ────────────────────── */}
      <Modal visible={!!activeWorkout} transparent animationType="fade">
        <View style={s.liveModalOverlay}>
          <View style={s.liveModalContent}>
            {/* Header */}
            <View style={s.liveHeader}>
              <View>
                <Text style={s.liveModeBadge}>LIVE WORKOUT</Text>
                <Text style={s.liveTitle}>{activeWorkout?.title}</Text>
              </View>
              <Pressable onPress={handleCancelLiveWorkout} style={s.liveCloseBtn}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>

            {/* Big Live Digital Timer */}
            <View style={s.liveTimerContainer}>
              <Text style={s.liveTimerDigits}>{formatTimer(workoutElapsedSecs)}</Text>
              <Text style={s.liveTimerLabel}>
                {isWorkoutPaused ? "PAUSED" : "ACTIVE SESSION"}
              </Text>
            </View>

            {/* Live Stats */}
            <View style={s.liveStatsGrid}>
              <View style={s.liveStatBox}>
                <Ionicons name="flame" size={22} color="#fb923c" />
                <Text style={s.liveStatVal}>
                  {Math.round((workoutElapsedSecs / 60) * (activeWorkout?.calPerMin || 7))}
                </Text>
                <Text style={s.liveStatUnit}>Est. Calories</Text>
              </View>

              <View style={s.liveStatBox}>
                <Ionicons name="heart" size={22} color="#f43f5e" />
                <Text style={s.liveStatVal}>{isWorkoutPaused ? "--" : "138"}</Text>
                <Text style={s.liveStatUnit}>Avg BPM</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={s.liveActionsRow}>
              <Pressable
                style={[s.livePauseBtn, isWorkoutPaused && s.liveResumeBtn]}
                onPress={() => setIsWorkoutPaused(!isWorkoutPaused)}
              >
                <Ionicons
                  name={isWorkoutPaused ? "play" : "pause"}
                  size={24}
                  color="#ffffff"
                />
                <Text style={s.livePauseBtnText}>
                  {isWorkoutPaused ? "Resume" : "Pause"}
                </Text>
              </Pressable>

              <Pressable
                style={s.liveFinishBtn}
                onPress={handleFinishLiveWorkout}
              >
                <Ionicons name="checkmark-circle" size={22} color="#041423" />
                <Text style={s.liveFinishBtnText}>Finish Workout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 6. Curated Routine Preview Modal ──────────────────────── */}
      <Modal visible={!!previewRoutine} transparent animationType="slide">
        <View style={s.routineModalOverlay}>
          <View style={s.routineModalContent}>
            <View style={s.routineModalHeader}>
              <View>
                <Text style={s.routineModalTitle}>{previewRoutine?.name}</Text>
                <Text style={s.routineModalSub}>
                  {previewRoutine?.durationMins} mins • ~{previewRoutine?.estCalories} kcal • {previewRoutine?.intensity}
                </Text>
              </View>
              <Pressable onPress={() => setPreviewRoutine(null)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>

            <Text style={s.routineExerciseHeader}>Exercises in this set:</Text>
            {previewRoutine?.exercises.map((ex, i) => (
              <View key={i} style={s.routineExRow}>
                <View style={s.routineExIndex}>
                  <Text style={s.routineExIndexText}>{i + 1}</Text>
                </View>
                <Text style={s.routineExName}>{ex}</Text>
              </View>
            ))}

            <Pressable
              style={s.startRoutineBtn}
              onPress={() => {
                const routine = previewRoutine;
                setPreviewRoutine(null);
                if (routine) {
                  handleStartQuickWorkout(QUICK_MODES[1]); // Gym / strength runner
                }
              }}
            >
              <Ionicons name="play" size={20} color="#041423" />
              <Text style={s.startRoutineBtnText}>Start This Routine</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── 7. Manual Record Workout Modal ────────────────────────── */}
      <Modal visible={logModalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Log Workout</Text>
              <Pressable onPress={() => setLogModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>

            {/* Activity Type Picker */}
            <Text style={s.inputLabel}>Activity Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll}>
              {ACTIVITY_TYPES.map((t) => (
                <Pressable
                  key={t.type}
                  onPress={() => setLogType(t.type)}
                  style={[s.typeChip, logType === t.type && s.typeChipActive]}
                >
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={logType === t.type ? "#041423" : colors.text.secondary}
                  />
                  <Text style={[s.typeChipText, logType === t.type && s.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={s.inputLabel}>Title (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Evening Run, Leg Day"
              placeholderTextColor={colors.text.muted}
              value={logTitle}
              onChangeText={setLogTitle}
            />

            <View style={s.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.inputLabel}>Duration (mins)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={colors.text.muted}
                  value={logDuration}
                  onChangeText={setLogDuration}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.inputLabel}>Calories (kcal)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="200"
                  placeholderTextColor={colors.text.muted}
                  value={logCalories}
                  onChangeText={setLogCalories}
                />
              </View>
            </View>

            {["running", "cycling", "walking"].includes(logType) && (
              <>
                <Text style={s.inputLabel}>Distance (km)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="decimal-pad"
                  placeholder="3.0"
                  placeholderTextColor={colors.text.muted}
                  value={logDistance}
                  onChangeText={setLogDistance}
                />
              </>
            )}

            <Pressable style={s.saveBtn} onPress={handleSaveManualActivity}>
              <Text style={s.saveBtnText}>Save Workout Entry</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.dim, // #041423
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: colors.surface.dim,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  logPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  logPillBtnText: {
    color: "#041423",
    fontWeight: "700",
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },

  // 1. Vitals Card
  vitalsCard: {
    backgroundColor: colors.surface.container, // #112130
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  vitalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vitalsTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vitalsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  goalBadge: {
    backgroundColor: "rgba(79, 219, 200, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  metricGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    marginTop: 6,
  },
  metricUnit: {
    fontSize: 10.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabelText: {
    fontSize: 11,
    color: colors.text.muted,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.text.muted,
  },

  // 2. Modes Grid
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  modeCard: {
    width: (SW - 36 - 12) / 2,
    borderRadius: 18,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  modeGrad: {
    padding: 16,
    borderRadius: 18,
    minHeight: 120,
    justifyContent: "space-between",
  },
  modeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 14,
  },
  modeSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },

  // 3. Curated Routines
  routinesList: {
    gap: 10,
    marginBottom: 22,
  },
  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  routineIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(180, 197, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.text.primary,
  },
  routineMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  routineMetaText: {
    fontSize: 11.5,
    color: colors.text.muted,
  },
  routineMetaDot: {
    fontSize: 11.5,
    color: colors.text.muted,
    marginHorizontal: 6,
  },
  routineBadge: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  routineBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.text.secondary,
  },

  // 4. Logged Activities
  emptyLogCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 20,
  },
  emptyLogTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 10,
  },
  emptyLogSub: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  logItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface.container,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  logItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(180, 197, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logItemInfo: {
    flex: 1,
  },
  logItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  logItemMeta: {
    fontSize: 11.5,
    color: colors.text.muted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },

  // 5. Live Workout Modal
  liveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 20, 35, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  liveModalContent: {
    width: "100%",
    backgroundColor: colors.surface.container,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  liveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  liveModeBadge: {
    fontSize: 10.5,
    fontWeight: "900",
    color: colors.secondary,
    letterSpacing: 1,
  },
  liveTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginTop: 2,
  },
  liveCloseBtn: {
    padding: 4,
  },
  liveTimerContainer: {
    backgroundColor: colors.surface.dim,
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 20,
  },
  liveTimerDigits: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.text.primary,
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },
  liveTimerLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.secondary,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  liveStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  liveStatBox: {
    flex: 1,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  liveStatVal: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
    marginTop: 4,
  },
  liveStatUnit: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  liveActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  livePauseBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    borderRadius: 16,
  },
  liveResumeBtn: {
    backgroundColor: "#059669",
  },
  livePauseBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  liveFinishBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  liveFinishBtnText: {
    color: "#041423",
    fontWeight: "800",
    fontSize: 14,
  },

  // 6. Routine Preview Modal
  routineModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  routineModalContent: {
    backgroundColor: colors.surface.container,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  routineModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  routineModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  routineModalSub: {
    fontSize: 12.5,
    color: colors.text.muted,
    marginTop: 3,
  },
  routineExerciseHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.secondary,
    marginBottom: 10,
    marginTop: 4,
  },
  routineExRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  routineExIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  routineExIndexText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  routineExName: {
    fontSize: 13.5,
    color: colors.text.primary,
    fontWeight: "600",
  },
  startRoutineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  startRoutineBtnText: {
    color: "#041423",
    fontWeight: "800",
    fontSize: 14,
  },

  // 7. Manual Log Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface.container,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.muted,
    marginBottom: 6,
    marginTop: 10,
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface.containerHigh,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  typeChipTextActive: {
    color: "#041423",
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.surface.dim,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: {
    color: "#041423",
    fontSize: 14.5,
    fontWeight: "800",
  },
});
