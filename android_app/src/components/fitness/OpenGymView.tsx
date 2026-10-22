import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Vibration,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Polygon, Line, Circle } from "react-native-svg";
import {
  OpenGymExercise,
  OpenGymSession,
  OpenGymRoutine,
  OpenGymBodyweightEntry,
  OPENGYM_EXERCISES,
  OPENGYM_EXERCISE_MAP,
  OPENGYM_ROUTINES,
  OPENGYM_WEEKLY_SCHEDULE,
} from "@/services/openGymData";
import {
  getActiveSession,
  startOpenGymSession,
  addExerciseToActiveSession,
  updateActiveSet,
  addSetToExercise,
  removeSetFromExercise,
  removeExerciseFromSession,
  cancelActiveSession,
  finishActiveSession,
  getCompletedSessions,
  calculateMuscleRecovery,
  MuscleRecoveryItem,
  getBodyweightHistory,
  logBodyweight,
  getAllRoutines,
  saveCustomRoutine,
} from "@/services/openGymService";
import {
  ActivityItem,
  getActivities,
  getDailyActivityTotals,
  deleteActivity,
} from "@/services/healthLogService";

const { width: SW } = Dimensions.get("window");

export type OpenGymTab = "home" | "plan" | "start" | "stats" | "exercise";

interface Props {
  onWorkoutCompleted?: () => void;
  navigation?: any;
  todayActivities?: ActivityItem[];
  dailyTotals?: { totalMins: number; totalCalories: number; totalDistanceKm: number; count: number };
  onDeleteActivity?: (id: string) => void;
  onOpenRecordModal?: () => void;
}

export default function OpenGymView({
  onWorkoutCompleted,
  navigation,
  todayActivities,
  dailyTotals,
  onDeleteActivity,
  onOpenRecordModal,
}: Props) {
  const [activeTab, setActiveTab] = useState<OpenGymTab>("home");

  // Active workout state
  const [activeSession, setActiveSession] = useState<OpenGymSession | null>(null);
  const [sessionDurationSec, setSessionDurationSec] = useState(0);

  // Rest Timer state
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerTotal, setRestTimerTotal] = useState(60);
  const [restTimerPaused, setRestTimerPaused] = useState(false);

  // Exercise Library state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [detailExercise, setDetailExercise] = useState<OpenGymExercise | null>(null);
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);

  // Routine Planner state
  const [allRoutinesList, setAllRoutinesList] = useState<OpenGymRoutine[]>(OPENGYM_ROUTINES);
  const [selectedRoutineDetail, setSelectedRoutineDetail] = useState<OpenGymRoutine | null>(null);
  const [createRoutineModalVisible, setCreateRoutineModalVisible] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineMuscles, setNewRoutineMuscles] = useState("");
  const [newRoutineCategory, setNewRoutineCategory] = useState("Split");
  const [newRoutineSelectedExIds, setNewRoutineSelectedExIds] = useState<string[]>([]);

  // Stats & Muscle Recovery state
  const [muscleRecovery, setMuscleRecovery] = useState<MuscleRecoveryItem[]>([]);
  const [completedSessions, setCompletedSessions] = useState<OpenGymSession[]>([]);
  const [bodyweightList, setBodyweightList] = useState<OpenGymBodyweightEntry[]>([]);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [weightModalVisible, setWeightModalVisible] = useState(false);

  // Finish Workout modal
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");

  // Internal activity fallback (if parent didn't supply them)
  const [internalActivities, setInternalActivities] = useState<ActivityItem[]>([]);
  const [internalTotals, setInternalTotals] = useState({ totalMins: 0, totalCalories: 0, totalDistanceKm: 0, count: 0 });

  // Load initial data
  const loadData = async () => {
    const act = await getActiveSession();
    setActiveSession(act);
    if (act) {
      const elapsed = Math.floor((Date.now() - act.startTime) / 1000);
      setSessionDurationSec(elapsed);
    }

    const recovery = await calculateMuscleRecovery();
    setMuscleRecovery(recovery);

    const past = await getCompletedSessions();
    setCompletedSessions(past);

    const bw = await getBodyweightHistory();
    setBodyweightList(bw);

    const rList = await getAllRoutines();
    setAllRoutinesList(rList);

    if (!todayActivities) {
      const acts = await getActivities();
      const tots = await getDailyActivityTotals();
      setInternalActivities(acts);
      setInternalTotals(tots);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer loop for active session elapsed time
  useEffect(() => {
    let interval: any = null;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionDurationSec((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionDurationSec(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  // Timer loop for Rest Countdown
  useEffect(() => {
    let interval: any = null;
    if (restTimerSeconds !== null && restTimerSeconds > 0 && !restTimerPaused) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            Vibration.vibrate([0, 400, 200, 400]);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimerSeconds, restTimerPaused]);

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Trigger rest timer
  const triggerRestTimer = (seconds: number = 60) => {
    setRestTimerTotal(seconds);
    setRestTimerSeconds(seconds);
    setRestTimerPaused(false);
  };

  // Handle set completion toggle
  const handleToggleSet = async (exIdx: number, setIdx: number) => {
    if (!activeSession) return;
    const currentCompleted = activeSession.exercises[exIdx]?.sets[setIdx]?.completed;
    const nextCompleted = !currentCompleted;

    const updated = await updateActiveSet(exIdx, setIdx, { completed: nextCompleted });
    if (updated) {
      setActiveSession({ ...updated });
      if (nextCompleted) {
        triggerRestTimer(60);
      }
    }
  };

  // Step weight (+ / -)
  const handleStepWeight = async (exIdx: number, setIdx: number, delta: number) => {
    if (!activeSession) return;
    const cur = activeSession.exercises[exIdx]?.sets[setIdx]?.weightKg || 0;
    const nextWeight = Math.max(0, Math.round((cur + delta) * 10) / 10);
    const updated = await updateActiveSet(exIdx, setIdx, { weightKg: nextWeight });
    if (updated) setActiveSession({ ...updated });
  };

  // Step reps (+ / -)
  const handleStepReps = async (exIdx: number, setIdx: number, delta: number) => {
    if (!activeSession) return;
    const cur = activeSession.exercises[exIdx]?.sets[setIdx]?.reps || 10;
    const nextReps = Math.max(1, cur + delta);
    const updated = await updateActiveSet(exIdx, setIdx, { reps: nextReps });
    if (updated) setActiveSession({ ...updated });
  };

  // Add set to exercise
  const handleAddSet = async (exIdx: number) => {
    const updated = await addSetToExercise(exIdx);
    if (updated) setActiveSession({ ...updated });
  };

  // Remove set
  const handleRemoveSet = async (exIdx: number, setIdx: number) => {
    const updated = await removeSetFromExercise(exIdx, setIdx);
    if (updated) setActiveSession({ ...updated });
  };

  // Remove exercise from session
  const handleRemoveExercise = (exIdx: number) => {
    Alert.alert("Remove Exercise", "Remove this exercise from your active session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updated = await removeExerciseFromSession(exIdx);
          if (updated) setActiveSession({ ...updated });
        },
      },
    ]);
  };

  // Start workout from routine
  const handleStartWorkout = async (routineId?: string) => {
    const session = await startOpenGymSession(routineId);
    setActiveSession(session);
    setSessionDurationSec(0);
    setActiveTab("start");
  };

  // Finish session
  const handleConfirmFinish = async () => {
    setFinishModalVisible(false);
    const res = await finishActiveSession(workoutNotes);
    if (res) {
      setActiveSession(null);
      setRestTimerSeconds(null);
      setWorkoutNotes("");
      await loadData();
      if (onWorkoutCompleted) onWorkoutCompleted();
      setActiveTab("home");
      Alert.alert(
        "Workout Logged! 🎉",
        `Fantastic job! You completed ${res.session.totalSetsCompleted} sets and lifted ${res.session.totalVolumeKg.toLocaleString()} kg in ${res.session.durationMins} minutes.\n\n~${res.session.caloriesBurned} calories burned!`
      );
    }
  };

  // Cancel session
  const handleCancelWorkout = () => {
    Alert.alert("Discard Workout", "Are you sure you want to discard this workout?", [
      { text: "No, Continue", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: async () => {
          await cancelActiveSession();
          setActiveSession(null);
          setRestTimerSeconds(null);
        },
      },
    ]);
  };

  // Filtered exercises for catalogue
  const filteredExercises = useMemo(() => {
    return OPENGYM_EXERCISES.filter((ex) => {
      const matchBp = selectedBodyPart === "all" || ex.bodyPart === selectedBodyPart;
      const matchEq =
        selectedEquipment === "all" ||
        ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase());
      const matchSearch =
        !searchQuery.trim() ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBp && matchEq && matchSearch;
    });
  }, [selectedBodyPart, selectedEquipment, searchQuery]);

  // Today's scheduled routine
  const todayDayIdx = new Date().getDay();
  const todaySchedule = OPENGYM_WEEKLY_SCHEDULE.find((s) => s.dayIndex === todayDayIdx);
  const todayRoutine = todaySchedule?.routineId
    ? allRoutinesList.find((r) => r.id === todaySchedule.routineId) ||
      OPENGYM_ROUTINES.find((r) => r.id === todaySchedule.routineId)
    : null;

  // Active activities & totals (props or internal)
  const currentActivities = todayActivities || internalActivities;
  const currentTotals = dailyTotals || internalTotals;

  // Save new custom routine
  const handleSaveRoutine = async () => {
    if (!newRoutineName.trim()) {
      Alert.alert("Routine Name", "Please enter a routine name.");
      return;
    }
    if (newRoutineSelectedExIds.length === 0) {
      Alert.alert("Select Exercises", "Please pick at least one exercise for this routine.");
      return;
    }
    const created: OpenGymRoutine = {
      id: `custom_${Date.now()}`,
      name: newRoutineName.trim(),
      category: newRoutineCategory || "Split",
      color: "#10b981",
      targetMuscles: newRoutineMuscles.trim() || "Full Body",
      description: "Custom user training plan",
      exerciseIds: newRoutineSelectedExIds,
      estimatedMinutes: newRoutineSelectedExIds.length * 8,
    };
    await saveCustomRoutine(created);
    setNewRoutineName("");
    setNewRoutineMuscles("");
    setNewRoutineSelectedExIds([]);
    setCreateRoutineModalVisible(false);
    const updatedRoutines = await getAllRoutines();
    setAllRoutinesList(updatedRoutines);
    Alert.alert("Routine Created", `"${created.name}" is now ready in your plan catalogue!`);
  };

  // Toggle exercise selection in custom routine creation
  const toggleSelectExerciseForRoutine = (id: string) => {
    setNewRoutineSelectedExIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 5 Tab items config
  const TABS: { id: OpenGymTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "home", label: "Home", icon: "home" },
    { id: "plan", label: "Plan", icon: "calendar" },
    { id: "start", label: "Start", icon: "play-circle" },
    { id: "stats", label: "Stats", icon: "stats-chart" },
    { id: "exercise", label: "Exercise", icon: "barbell" },
  ];

  return (
    <View style={s.container}>
      {/* ── Segmented 5-Tab Bar (Home, Plan, Start, Stats, Exercise) ── */}
      <View style={s.tabsBarContainer}>
        <View style={s.tabsRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isStart = tab.id === "start";
            const showLiveDot = isStart && activeSession !== null;
            return (
              <Pressable
                key={tab.id}
                style={[s.tabBtn, isActive && s.tabBtnActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={s.tabIconWrap}>
                  <Ionicons
                    name={isActive ? tab.icon : (`${tab.icon}-outline` as any)}
                    size={17}
                    color={isActive ? "#4ade80" : "rgba(255,255,255,0.55)"}
                  />
                  {showLiveDot && <View style={s.tabLiveDot} />}
                </View>
                <Text style={[s.tabText, isActive && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Active Rest Timer Floating Banner (visible across tabs) ── */}
      {restTimerSeconds !== null && (
        <View style={s.restTimerBar}>
          <View style={s.restTimerLeft}>
            <Ionicons name="timer-outline" size={20} color="#f59e0b" />
            <View style={{ marginLeft: 8 }}>
              <Text style={s.restTimerLabel}>AUTO REST TIMER</Text>
              <Text style={s.restTimerDigits}>{formatTime(restTimerSeconds)}</Text>
            </View>
          </View>
          <View style={s.restTimerActions}>
            <Pressable
              style={s.restTimerBtn}
              onPress={() => setRestTimerSeconds((prev) => (prev !== null ? prev + 15 : 15))}
            >
              <Text style={s.restTimerBtnText}>+15s</Text>
            </Pressable>
            <Pressable
              style={s.restTimerBtn}
              onPress={() => setRestTimerPaused((prev) => !prev)}
            >
              <Ionicons
                name={restTimerPaused ? "play" : "pause"}
                size={14}
                color="#ffffff"
              />
            </Pressable>
            <Pressable
              style={[s.restTimerBtn, { backgroundColor: "rgba(239,68,68,0.2)" }]}
              onPress={() => setRestTimerSeconds(null)}
            >
              <Ionicons name="close" size={14} color="#f87171" />
            </Pressable>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: HOME (FEED, STREAK, TODAY'S TARGET, RADAR, RECENT)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "home" && (
        <View style={s.tabContent}>
          {/* Welcome & Streak Card */}
          <LinearGradient
            colors={["#161f2e", "#0e1522"]}
            style={s.welcomeCard}
          >
            <View style={s.welcomeTopRow}>
              <View>
                <Text style={s.welcomeGreeting}>Welcome Back, Athlete</Text>
                <Text style={s.welcomeDate}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </Text>
              </View>
              <View style={s.streakPill}>
                <Ionicons name="flame" size={16} color="#f97316" />
                <Text style={s.streakText}>5 Day Streak</Text>
              </View>
            </View>

            <View style={s.readinessRow}>
              <View style={s.readinessBadge}>
                <View style={s.readinessDot} />
                <Text style={s.readinessBadgeText}>RECOVERY READINESS: 92%</Text>
              </View>
              <Text style={s.readinessHint}>Optimal muscle state · Prime day to train</Text>
            </View>
          </LinearGradient>

          {/* Active Workout Resume Card (if running) */}
          {activeSession ? (
            <Pressable
              style={s.activeResumeCard}
              onPress={() => setActiveTab("start")}
            >
              <LinearGradient
                colors={["rgba(16, 185, 129, 0.25)", "rgba(6, 78, 59, 0.3)"]}
                style={s.activeResumeGradient}
              >
                <View style={s.activeResumeLeft}>
                  <View style={s.liveGreenDot} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.activeResumeTag}>WORKOUT IN PROGRESS</Text>
                    <Text style={s.activeResumeTitle}>{activeSession.routineName}</Text>
                    <Text style={s.activeResumeMeta}>
                      {formatTime(sessionDurationSec)} · {activeSession.totalSetsCompleted} sets · {activeSession.totalVolumeKg.toLocaleString()} kg
                    </Text>
                  </View>
                </View>
                <View style={s.resumeActionBtn}>
                  <Text style={s.resumeActionBtnText}>Resume</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0f172a" />
                </View>
              </LinearGradient>
            </Pressable>
          ) : (
            /* Today's Target Routine Card */
            todayRoutine && (
              <View style={s.todayRoutineCard}>
                <LinearGradient
                  colors={[todayRoutine.color, `${todayRoutine.color}44`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.todayRoutineGradient}
                >
                  <View style={s.todayRoutineBadge}>
                    <Ionicons name="calendar" size={13} color="#ffffff" />
                    <Text style={s.todayRoutineBadgeText}>
                      TODAY'S TARGET ({todaySchedule?.day.toUpperCase()})
                    </Text>
                  </View>

                  <Text style={s.todayRoutineTitle}>{todayRoutine.name}</Text>
                  <Text style={s.todayRoutineSub}>{todayRoutine.targetMuscles}</Text>

                  <View style={s.routineExercisesPills}>
                    {todayRoutine.exerciseIds.slice(0, 4).map((id) => {
                      const ex = OPENGYM_EXERCISE_MAP[id];
                      return (
                        <View key={id} style={s.routineExPill}>
                          <Text style={s.routineExPillText}>{ex ? ex.name : id}</Text>
                        </View>
                      );
                    })}
                    {todayRoutine.exerciseIds.length > 4 && (
                      <View style={s.routineExPill}>
                        <Text style={s.routineExPillText}>
                          +{todayRoutine.exerciseIds.length - 4} more
                        </Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    style={s.startTodayBtn}
                    onPress={() => handleStartWorkout(todayRoutine.id)}
                  >
                    <Ionicons name="play" size={18} color="#0f172a" />
                    <Text style={s.startTodayBtnText}>Start {todayRoutine.name}</Text>
                  </Pressable>
                </LinearGradient>
              </View>
            )
          )}

          {/* Signature 5-Axis Fitness Radar Chart */}
          <View style={s.fitnessIndexCard}>
            <View style={s.fitnessIndexTextCol}>
              <View style={s.fitnessIndexHeaderRow}>
                <Text style={s.fitnessIndexTitle}>Fitness Index</Text>
                <View style={s.indexBadge}>
                  <Text style={s.indexBadgeText}>OPTIMAL</Text>
                </View>
              </View>
              <Text style={s.fitnessIndexDesc}>
                5-Axis analysis: Strength, Endurance, Recovery, Mobility & Consistency.
              </Text>
              <View style={s.dailyMetricStrip}>
                <View style={s.dailyMetricCol}>
                  <Text style={s.dailyMetricVal}>{currentTotals.totalMins}m</Text>
                  <Text style={s.dailyMetricLbl}>Active</Text>
                </View>
                <View style={s.dailyMetricDiv} />
                <View style={s.dailyMetricCol}>
                  <Text style={s.dailyMetricVal}>{currentTotals.totalCalories}</Text>
                  <Text style={s.dailyMetricLbl}>kcal</Text>
                </View>
                <View style={s.dailyMetricDiv} />
                <View style={s.dailyMetricCol}>
                  <Text style={s.dailyMetricVal}>{currentActivities.length}</Text>
                  <Text style={s.dailyMetricLbl}>Sessions</Text>
                </View>
              </View>
              {onOpenRecordModal && (
                <Pressable style={s.recordWorkoutBtn} onPress={onOpenRecordModal}>
                  <Ionicons name="add-circle" size={16} color="#4ade80" />
                  <Text style={s.recordWorkoutBtnText}>Record Activity</Text>
                </Pressable>
              )}
            </View>

            {/* Radar Pentagon Graphic */}
            <View style={s.radarWrap}>
              <Svg width={110} height={110} viewBox="0 0 110 110">
                <Polygon
                  points="55,10 97,41 81,89 29,89 13,41"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.2"
                />
                <Polygon
                  points="55,24 84,45 73,78 37,78 26,45"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
                <Polygon
                  points="55,38 72,50 65,70 45,70 38,50"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
                <Line x1="55" y1="55" x2="55" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <Line x1="55" y1="55" x2="97" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <Line x1="55" y1="55" x2="81" y2="89" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <Line x1="55" y1="55" x2="29" y2="89" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <Line x1="55" y1="55" x2="13" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <Polygon
                  points="55,16 90,44 76,82 34,75 22,46"
                  fill="rgba(74, 222, 128, 0.38)"
                  stroke="#4ade80"
                  strokeWidth="2"
                />
                <Circle cx="55" cy="16" r="3" fill="#86efac" />
                <Circle cx="90" cy="44" r="3" fill="#86efac" />
                <Circle cx="76" cy="82" r="3" fill="#86efac" />
                <Circle cx="34" cy="75" r="3" fill="#86efac" />
                <Circle cx="22" cy="46" r="3" fill="#86efac" />
              </Svg>
            </View>
          </View>

          {/* Today's Logged Activities (if any) */}
          {currentActivities.length > 0 && (
            <View style={s.loggedSection}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Today's Logged Workouts</Text>
                <Text style={s.statsSummary}>
                  {currentTotals.totalMins} min · {currentTotals.totalCalories} kcal
                </Text>
              </View>
              <View style={s.loggedList}>
                {currentActivities.map((act) => (
                  <View key={act.id} style={s.loggedCard}>
                    <View style={s.loggedLeft}>
                      <View style={s.loggedIconWrap}>
                        <Ionicons
                          name={
                            act.type === "running"
                              ? "fitness"
                              : act.type === "cycling"
                              ? "bicycle"
                              : act.type === "gym"
                              ? "barbell"
                              : act.type === "yoga"
                              ? "body"
                              : act.type === "pilates"
                              ? "sparkles"
                              : "walk"
                          }
                          size={18}
                          color="#4ade80"
                        />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={s.loggedTitle}>{act.title}</Text>
                        <Text style={s.loggedMeta}>
                          {act.durationMins} mins · {act.caloriesBurned} kcal
                          {act.distanceKm ? ` · ${act.distanceKm} km` : ""}
                        </Text>
                      </View>
                    </View>
                    {onDeleteActivity && (
                      <Pressable onPress={() => onDeleteActivity(act.id)} style={s.deleteBtn}>
                        <Ionicons name="trash-outline" size={17} color="rgba(255,255,255,0.4)" />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Weekly Schedule Mini Overview */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Weekly Schedule</Text>
            <Pressable onPress={() => setActiveTab("plan")}>
              <Text style={s.sectionLink}>Full Plan →</Text>
            </Pressable>
          </View>
          <View style={s.scheduleWeekRow}>
            {OPENGYM_WEEKLY_SCHEDULE.map((sch) => {
              const isToday = sch.dayIndex === todayDayIdx;
              const r = sch.routineId
                ? allRoutinesList.find((item) => item.id === sch.routineId) ||
                  OPENGYM_ROUTINES.find((item) => item.id === sch.routineId)
                : null;
              return (
                <Pressable
                  key={sch.day}
                  style={[s.scheduleDayCol, isToday && s.scheduleDayColActive]}
                  onPress={() => setActiveTab("plan")}
                >
                  <Text style={[s.scheduleDayName, isToday && s.scheduleDayNameActive]}>
                    {sch.day.slice(0, 3)}
                  </Text>
                  <View
                    style={[
                      s.scheduleDot,
                      { backgroundColor: r ? r.color : "rgba(255,255,255,0.2)" },
                    ]}
                  />
                  <Text style={s.scheduleRoutineMini} numberOfLines={1}>
                    {r ? r.name.split(" ")[0] : "Rest"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Recent Completed Sessions Feed */}
          <View style={[s.sectionHeader, { marginTop: 22 }]}>
            <Text style={s.sectionTitle}>Recent Workouts</Text>
            <Pressable onPress={() => setActiveTab("stats")}>
              <Text style={s.sectionLink}>View All Stats →</Text>
            </Pressable>
          </View>
          {completedSessions.length === 0 ? (
            <View style={s.emptyFeedCard}>
              <Ionicons name="barbell-outline" size={32} color="rgba(255,255,255,0.3)" />
              <Text style={s.emptyFeedTitle}>No Workouts Yet</Text>
              <Text style={s.emptyFeedSub}>
                Start your first session from the Start tab to log sets, volume, and muscle recovery!
              </Text>
              <Pressable
                style={s.emptyFeedBtn}
                onPress={() => setActiveTab("start")}
              >
                <Ionicons name="play" size={16} color="#0f172a" />
                <Text style={s.emptyFeedBtnText}>Go to Start</Text>
              </Pressable>
            </View>
          ) : (
            completedSessions.slice(0, 3).map((sItem) => (
              <View key={sItem.id} style={s.completedSessionRow}>
                <View style={s.completedIconWrap}>
                  <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.completedSessionTitle}>{sItem.routineName}</Text>
                  <Text style={s.completedSessionMeta}>
                    {sItem.durationMins} mins · {sItem.totalSetsCompleted} sets ·{" "}
                    {sItem.totalVolumeKg.toLocaleString()} kg · {sItem.caloriesBurned} kcal
                  </Text>
                </View>
                <Pressable
                  style={s.reRunBtn}
                  onPress={() => handleStartWorkout(sItem.routineId)}
                >
                  <Ionicons name="reload" size={13} color="#4ade80" />
                  <Text style={s.reRunBtnText}>Re-run</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: PLAN (WEEKLY SPLIT, ROUTINES CATALOGUE, CUSTOM BUILDER)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "plan" && (
        <View style={s.tabContent}>
          {/* Top Plan Header & Action */}
          <View style={s.planHeaderRow}>
            <View>
              <Text style={s.sectionTitle}>Training Split & Plans</Text>
              <Text style={s.statsSubtitle}>7-day split & intelligent routine library</Text>
            </View>
            <Pressable
              style={s.createRoutineBtn}
              onPress={() => setCreateRoutineModalVisible(true)}
            >
              <Ionicons name="add" size={16} color="#0f172a" />
              <Text style={s.createRoutineBtnText}>New Routine</Text>
            </Pressable>
          </View>

          {/* Weekly Schedule Strip */}
          <Text style={[s.subSectionLabel, { marginTop: 12 }]}>Weekly Routine Schedule</Text>
          <View style={s.scheduleWeekRow}>
            {OPENGYM_WEEKLY_SCHEDULE.map((sch) => {
              const isToday = sch.dayIndex === todayDayIdx;
              const r = sch.routineId
                ? allRoutinesList.find((item) => item.id === sch.routineId) ||
                  OPENGYM_ROUTINES.find((item) => item.id === sch.routineId)
                : null;
              return (
                <View
                  key={sch.day}
                  style={[s.scheduleDayCol, isToday && s.scheduleDayColActive]}
                >
                  <Text style={[s.scheduleDayName, isToday && s.scheduleDayNameActive]}>
                    {sch.day.slice(0, 3)}
                  </Text>
                  <View
                    style={[
                      s.scheduleDot,
                      { backgroundColor: r ? r.color : "rgba(255,255,255,0.2)" },
                    ]}
                  />
                  <Text style={s.scheduleRoutineMini} numberOfLines={1}>
                    {r ? r.name.split(" ")[0] : "Rest"}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Available Routines Catalogue */}
          <Text style={[s.subSectionLabel, { marginTop: 22 }]}>
            Available Routines ({allRoutinesList.length})
          </Text>

          {allRoutinesList.map((routine) => (
            <View key={routine.id} style={s.routineDetailCard}>
              <View style={s.routineDetailTop}>
                <View style={[s.routineColorTag, { backgroundColor: routine.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.routineDetailName}>{routine.name}</Text>
                  <Text style={s.routineDetailCategory}>
                    {routine.category} · {routine.estimatedMinutes || routine.exerciseIds.length * 8} mins
                  </Text>
                </View>
                <Pressable
                  style={s.startRoutineBtnSmall}
                  onPress={() => handleStartWorkout(routine.id)}
                >
                  <Ionicons name="play" size={14} color="#0f172a" />
                  <Text style={s.startRoutineBtnSmallText}>Start</Text>
                </Pressable>
              </View>

              <Text style={s.routineDetailDescription}>{routine.description}</Text>
              <Text style={s.routineMusclesTag}>Targets: {routine.targetMuscles}</Text>

              {/* Exercises in routine preview */}
              <View style={s.routineExerciseList}>
                {routine.exerciseIds.slice(0, 5).map((exId, idx) => {
                  const ex = OPENGYM_EXERCISE_MAP[exId];
                  return (
                    <Pressable
                      key={exId}
                      style={s.routineExRow}
                      onPress={() => {
                        if (ex) setDetailExercise(ex);
                      }}
                    >
                      <Text style={s.routineExIndex}>{idx + 1}</Text>
                      <Text style={s.routineExName}>{ex ? ex.name : exId}</Text>
                      <Text style={s.routineExEquip}>{ex ? ex.equipment : ""}</Text>
                    </Pressable>
                  );
                })}
                {routine.exerciseIds.length > 5 && (
                  <Text style={s.routineMoreExText}>
                    +{routine.exerciseIds.length - 5} more exercises
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: START (DEDICATED RUNNER WHEN ACTIVE OR LAUNCHPAD)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "start" && (
        <View style={s.tabContent}>
          {activeSession ? (
            /* ── Active Workout In Progress ──────────────────────── */
            <View style={s.activeWorkoutWrap}>
              {/* Active Session Header Card */}
              <LinearGradient
                colors={["#1e293b", "#0f172a"]}
                style={s.activeSessionHero}
              >
                <View style={s.activeSessionTopRow}>
                  <View style={s.livePulseWrap}>
                    <View style={s.liveGreenDot} />
                    <Text style={s.livePulseText}>LIVE WORKOUT RUNNING</Text>
                  </View>
                  <Text style={s.activeSessionTimer}>{formatTime(sessionDurationSec)}</Text>
                </View>

                <Text style={s.activeSessionTitle}>{activeSession.routineName}</Text>

                {/* Session Live Metrics */}
                <View style={s.activeMetricsRow}>
                  <View style={s.metricItem}>
                    <Text style={s.metricVal}>{activeSession.totalSetsCompleted}</Text>
                    <Text style={s.metricLbl}>Sets Done</Text>
                  </View>
                  <View style={s.metricDiv} />
                  <View style={s.metricItem}>
                    <Text style={s.metricVal}>
                      {activeSession.totalVolumeKg.toLocaleString()}
                    </Text>
                    <Text style={s.metricLbl}>kg Volume</Text>
                  </View>
                  <View style={s.metricDiv} />
                  <View style={s.metricItem}>
                    <Text style={s.metricVal}>{activeSession.exercises.length}</Text>
                    <Text style={s.metricLbl}>Exercises</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* List of exercises in active session */}
              {activeSession.exercises.map((ex, exIdx) => (
                <View key={`${ex.exerciseId}_${exIdx}`} style={s.exerciseRunnerCard}>
                  {/* Exercise Header */}
                  <View style={s.exerciseRunnerHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.exerciseRunnerName}>{ex.name}</Text>
                      <View style={s.exerciseRunnerMeta}>
                        <View style={s.metaBadge}>
                          <Text style={s.metaBadgeText}>{ex.equipment}</Text>
                        </View>
                        <Text style={s.exerciseRunnerBp}>· {ex.bodyPart}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Pressable
                        style={s.exerciseRunnerAction}
                        onPress={() => {
                          const original = OPENGYM_EXERCISE_MAP[ex.exerciseId];
                          if (original) setDetailExercise(original);
                        }}
                      >
                        <Ionicons name="information-circle-outline" size={20} color="#4ade80" />
                      </Pressable>
                      <Pressable
                        style={s.exerciseRunnerAction}
                        onPress={() => handleRemoveExercise(exIdx)}
                      >
                        <Ionicons name="trash-outline" size={17} color="rgba(255,255,255,0.4)" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Sets Table Header */}
                  <View style={s.setTableHeader}>
                    <Text style={[s.setColText, { width: 34, textAlign: "center" }]}>SET</Text>
                    <Text style={[s.setColText, { width: 60, textAlign: "center" }]}>PREV</Text>
                    <Text style={[s.setColText, { flex: 1, textAlign: "center" }]}>KG</Text>
                    <Text style={[s.setColText, { flex: 1, textAlign: "center" }]}>REPS</Text>
                    <Text style={[s.setColText, { width: 44, textAlign: "center" }]}>✓</Text>
                  </View>

                  {/* Sets Rows */}
                  {ex.sets.map((set, setIdx) => {
                    const isDone = set.completed;
                    return (
                      <View
                        key={`set_${set.setNumber}_${setIdx}`}
                        style={[s.setRow, isDone && s.setRowDone]}
                      >
                        {/* Set Number */}
                        <Text style={[s.setNumberText, isDone && s.setNumberTextDone]}>
                          {set.setNumber}
                        </Text>

                        {/* Previous Placeholder */}
                        <Text style={s.setPrevText}>
                          {set.weightKg ? `${set.weightKg}k` : "—"}
                        </Text>

                        {/* Weight Stepper */}
                        <View style={s.stepperWrap}>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepWeight(exIdx, setIdx, -2.5)}
                          >
                            <Ionicons name="remove" size={12} color="#ffffff" />
                          </Pressable>
                          <Text style={[s.stepperValText, isDone && s.stepperValTextDone]}>
                            {set.weightKg}
                          </Text>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepWeight(exIdx, setIdx, 2.5)}
                          >
                            <Ionicons name="add" size={12} color="#ffffff" />
                          </Pressable>
                        </View>

                        {/* Reps Stepper */}
                        <View style={s.stepperWrap}>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepReps(exIdx, setIdx, -1)}
                          >
                            <Ionicons name="remove" size={12} color="#ffffff" />
                          </Pressable>
                          <Text style={[s.stepperValText, isDone && s.stepperValTextDone]}>
                            {set.reps}
                          </Text>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepReps(exIdx, setIdx, 1)}
                          >
                            <Ionicons name="add" size={12} color="#ffffff" />
                          </Pressable>
                        </View>

                        {/* Checkmark Button */}
                        <Pressable
                          style={[s.setCheckBtn, isDone && s.setCheckBtnDone]}
                          onPress={() => handleToggleSet(exIdx, setIdx)}
                        >
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={isDone ? "#0f172a" : "rgba(255,255,255,0.4)"}
                          />
                        </Pressable>
                      </View>
                    );
                  })}

                  {/* Add / Remove Set Row */}
                  <View style={s.setRowActions}>
                    <Pressable style={s.addSetRowBtn} onPress={() => handleAddSet(exIdx)}>
                      <Ionicons name="add" size={16} color="#4ade80" />
                      <Text style={s.addSetRowText}>Add Set</Text>
                    </Pressable>
                    {ex.sets.length > 1 && (
                      <Pressable
                        style={s.removeSetRowBtn}
                        onPress={() => handleRemoveSet(exIdx, ex.sets.length - 1)}
                      >
                        <Text style={s.removeSetRowText}>Remove Last Set</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}

              {/* Workout Runner Action Buttons */}
              <View style={s.workoutActionsWrap}>
                <Pressable
                  style={s.addExToWorkoutBtn}
                  onPress={() => setAddExerciseModalVisible(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#4ade80" />
                  <Text style={s.addExToWorkoutText}>Add Exercise</Text>
                </Pressable>

                <Pressable
                  style={s.finishWorkoutBtn}
                  onPress={() => setFinishModalVisible(true)}
                >
                  <Ionicons name="checkmark-done" size={20} color="#0f172a" />
                  <Text style={s.finishWorkoutBtnText}>Finish Workout</Text>
                </Pressable>

                <Pressable style={s.cancelWorkoutBtn} onPress={handleCancelWorkout}>
                  <Text style={s.cancelWorkoutBtnText}>Discard Workout</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* ── Idle State: Launchpad ───────────────────────────── */
            <View style={s.noActiveWrap}>
              {/* Hero "Start Empty Workout" */}
              <Pressable
                style={s.startEmptyHeroCard}
                onPress={() => handleStartWorkout()}
              >
                <LinearGradient
                  colors={["#1e293b", "#0f172a"]}
                  style={s.startEmptyHeroGradient}
                >
                  <View style={s.startEmptyHeroLeft}>
                    <View style={s.startEmptyHeroIconWrap}>
                      <Ionicons name="flash" size={24} color="#4ade80" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={s.startEmptyHeroTitle}>Start Empty Workout</Text>
                      <Text style={s.startEmptyHeroSub}>
                        Build a custom session and log sets as you lift
                      </Text>
                    </View>
                  </View>
                  <View style={s.startEmptyHeroBtn}>
                    <Ionicons name="play" size={18} color="#0f172a" />
                    <Text style={s.startEmptyHeroBtnText}>Start</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Today's Routine Card (if any scheduled) */}
              {todayRoutine && (
                <View style={s.quickRoutineCard}>
                  <View style={s.quickRoutineTop}>
                    <View style={s.quickRoutineBadge}>
                      <Ionicons name="calendar" size={13} color="#4ade80" />
                      <Text style={s.quickRoutineBadgeText}>
                        TODAY'S SCHEDULE ({todaySchedule?.day.toUpperCase()})
                      </Text>
                    </View>
                    <Pressable
                      style={s.quickLaunchBtn}
                      onPress={() => handleStartWorkout(todayRoutine.id)}
                    >
                      <Ionicons name="play" size={14} color="#0f172a" />
                      <Text style={s.quickLaunchBtnText}>Start Routine</Text>
                    </Pressable>
                  </View>
                  <Text style={s.quickRoutineTitle}>{todayRoutine.name}</Text>
                  <Text style={s.quickRoutineSub}>{todayRoutine.targetMuscles}</Text>
                </View>
              )}

              {/* Quick Launch Routine Selector */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Quick Launch Routines</Text>
                <Pressable onPress={() => setActiveTab("plan")}>
                  <Text style={s.sectionLink}>View All ({allRoutinesList.length})</Text>
                </Pressable>
              </View>

              {allRoutinesList.slice(0, 4).map((routine) => (
                <Pressable
                  key={routine.id}
                  style={s.routineListItem}
                  onPress={() => handleStartWorkout(routine.id)}
                >
                  <View style={[s.routineDot, { backgroundColor: routine.color }]} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.routineListName}>{routine.name}</Text>
                    <Text style={s.routineListSub}>{routine.targetMuscles}</Text>
                  </View>
                  <View style={s.routineStartBadge}>
                    <Ionicons name="play" size={13} color="#4ade80" />
                    <Text style={s.routineStartBadgeText}>Start</Text>
                  </View>
                </Pressable>
              ))}

              {/* Exercise Library Shortcut */}
              <Pressable
                style={s.freestyleCard}
                onPress={() => setActiveTab("exercise")}
              >
                <View style={s.freestyleLeft}>
                  <View style={s.freestyleIconWrap}>
                    <Ionicons name="search-outline" size={22} color="#4ade80" />
                  </View>
                  <View>
                    <Text style={s.freestyleTitle}>Search 300+ Exercise Library</Text>
                    <Text style={s.freestyleSub}>Browse form cues, barbell, machine & dumbbell lifts</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 4: STATS (RECOVERY HEATMAP, BODYWEIGHT, TRAINING STATS)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "stats" && (
        <View style={s.tabContent}>
          {/* Lifetime Training Metrics */}
          <View style={s.statsSummaryGrid}>
            <View style={s.statsSummaryCard}>
              <Text style={s.statsSummaryVal}>{completedSessions.length}</Text>
              <Text style={s.statsSummaryLbl}>Workouts</Text>
            </View>
            <View style={s.statsSummaryCard}>
              <Text style={s.statsSummaryVal}>
                {(completedSessions.reduce((acc, c) => acc + (c.totalVolumeKg || 0), 0) / 1000).toFixed(1)}t
              </Text>
              <Text style={s.statsSummaryLbl}>Volume (ton)</Text>
            </View>
            <View style={s.statsSummaryCard}>
              <Text style={s.statsSummaryVal}>
                {completedSessions.reduce((acc, c) => acc + (c.totalSetsCompleted || 0), 0)}
              </Text>
              <Text style={s.statsSummaryLbl}>Sets Done</Text>
            </View>
            <View style={s.statsSummaryCard}>
              <Text style={s.statsSummaryVal}>
                {completedSessions.length > 0
                  ? Math.round(
                      completedSessions.reduce((acc, c) => acc + (c.durationMins || 0), 0) /
                        completedSessions.length
                    )
                  : 0}m
              </Text>
              <Text style={s.statsSummaryLbl}>Avg Duration</Text>
            </View>
          </View>

          {/* Muscle Recovery Heatmap Breakdown */}
          <View style={[s.statsCard, { marginTop: 14 }]}>
            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Muscle Recovery Heatmap</Text>
                <Text style={s.statsSubtitle}>
                  Calculated based on training volume & 72h recovery decay
                </Text>
              </View>
            </View>

            {muscleRecovery.map((muscle) => (
              <View key={muscle.name} style={s.muscleRow}>
                <View style={s.muscleRowLeft}>
                  <Text style={s.muscleName}>{muscle.name}</Text>
                  <Text
                    style={[
                      s.muscleStatusTag,
                      {
                        color:
                          muscle.status === "Fresh"
                            ? "#4ade80"
                            : muscle.status === "Optimal"
                            ? "#60a5fa"
                            : muscle.status === "Recovering"
                            ? "#f59e0b"
                            : "#f87171",
                      },
                    ]}
                  >
                    {muscle.status}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={s.muscleBarWrap}>
                  <View style={s.muscleBarBg}>
                    <View
                      style={[
                        s.muscleBarFill,
                        {
                          width: `${muscle.recoveryPct}%`,
                          backgroundColor: muscle.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.musclePctText}>{muscle.recoveryPct}%</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Bodyweight Tracker */}
          <View style={[s.statsCard, { marginTop: 16 }]}>
            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Bodyweight Log</Text>
                <Text style={s.statsSubtitle}>Track weight changes alongside strength</Text>
              </View>
              <Pressable
                style={s.logWeightBtn}
                onPress={() => setWeightModalVisible(true)}
              >
                <Ionicons name="add" size={16} color="#4ade80" />
                <Text style={s.logWeightBtnText}>Log</Text>
              </Pressable>
            </View>

            {bodyweightList.length === 0 ? (
              <Text style={s.emptyStatsText}>
                No bodyweight recorded yet. Tap "+ Log" to record your weight today.
              </Text>
            ) : (
              bodyweightList.slice(-4).reverse().map((entry) => (
                <View key={entry.id} style={s.bwRow}>
                  <View style={s.bwLeft}>
                    <Ionicons name="scale-outline" size={18} color="#4ade80" />
                    <Text style={s.bwDate}>{entry.date}</Text>
                  </View>
                  <Text style={s.bwVal}>{entry.weightKg} kg</Text>
                </View>
              ))
            )}
          </View>

          {/* All Completed Sessions History */}
          <View style={[s.statsCard, { marginTop: 16 }]}>
            <Text style={s.sectionTitle}>Workout History ({completedSessions.length})</Text>
            {completedSessions.length === 0 ? (
              <Text style={s.emptyStatsText}>
                No workouts finished yet. Start a session today to build your history!
              </Text>
            ) : (
              completedSessions.map((sItem) => (
                <View key={sItem.id} style={s.completedSessionRow}>
                  <View style={s.completedIconWrap}>
                    <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.completedSessionTitle}>{sItem.routineName}</Text>
                    <Text style={s.completedSessionMeta}>
                      {sItem.durationMins} mins · {sItem.totalSetsCompleted} sets ·{" "}
                      {sItem.totalVolumeKg.toLocaleString()} kg · {sItem.caloriesBurned} kcal
                    </Text>
                    {sItem.notes ? (
                      <Text style={s.sessionNotesPreview}>"{sItem.notes}"</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 5: EXERCISE (300+ LIBRARY, SEARCH, MUSCLE FILTERS, FORM)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "exercise" && (
        <View style={s.tabContent}>
          {/* Search Box */}
          <View style={s.searchBar}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={s.searchInput}
              placeholder="Search by exercise, muscle, or equipment..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
              </Pressable>
            )}
          </View>

          {/* Muscle Body Part Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipsRow}
          >
            {[
              { id: "all", label: "All Muscles" },
              { id: "chest", label: "Chest" },
              { id: "back", label: "Back" },
              { id: "shoulders", label: "Shoulders" },
              { id: "arms", label: "Arms" },
              { id: "legs", label: "Legs" },
              { id: "core", label: "Core" },
              { id: "cardio", label: "Cardio" },
            ].map((chip) => {
              const active = selectedBodyPart === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setSelectedBodyPart(chip.id)}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{chip.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Equipment Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.chipsRow, { marginTop: 6 }]}
          >
            {[
              { id: "all", label: "All Equipment" },
              { id: "barbell", label: "Barbell" },
              { id: "dumbbell", label: "Dumbbell" },
              { id: "machine", label: "Machine" },
              { id: "cable", label: "Cable" },
              { id: "body weight", label: "Bodyweight" },
            ].map((chip) => {
              const active = selectedEquipment === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  style={[s.chipSmall, active && s.chipSmallActive]}
                  onPress={() => setSelectedEquipment(chip.id)}
                >
                  <Text style={[s.chipSmallText, active && s.chipSmallTextActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Results Count Meta */}
          <View style={s.resultsMetaRow}>
            <Text style={s.resultsMetaText}>
              Showing {filteredExercises.length} exercises from OpenGym Database
            </Text>
          </View>

          {/* Exercise Items List */}
          <View style={s.libraryList}>
            {filteredExercises.map((ex) => (
              <Pressable
                key={ex.id}
                style={s.libraryCard}
                onPress={() => setDetailExercise(ex)}
              >
                <View style={s.libraryCardLeft}>
                  <View style={s.libraryIconCircle}>
                    <Ionicons
                      name={
                        ex.bodyPart === "chest"
                          ? "barbell-outline"
                          : ex.bodyPart === "back"
                          ? "fitness-outline"
                          : ex.bodyPart === "legs"
                          ? "walk-outline"
                          : ex.bodyPart === "cardio"
                          ? "heart-outline"
                          : "body-outline"
                      }
                      size={20}
                      color="#4ade80"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.libraryExName}>{ex.name}</Text>
                    <Text style={s.libraryExMeta}>
                      Target: {ex.target} · {ex.equipment}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {activeSession ? (
                    <Pressable
                      style={s.quickAddExBtn}
                      onPress={async () => {
                        await addExerciseToActiveSession(ex.id);
                        const updated = await getActiveSession();
                        setActiveSession(updated);
                        Alert.alert("Added to Workout", `"${ex.name}" added to current session!`);
                      }}
                    >
                      <Ionicons name="add" size={16} color="#0f172a" />
                      <Text style={s.quickAddExBtnText}>Add</Text>
                    </Pressable>
                  ) : null}
                  <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.4)" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EXERCISE FORM & INSTRUCTIONS DETAIL
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={!!detailExercise}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailExercise(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {detailExercise && (
              <>
                <View style={s.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.modalTitle}>{detailExercise.name}</Text>
                    <Text style={s.modalSubtitle}>
                      {detailExercise.target} · {detailExercise.equipment}
                    </Text>
                  </View>
                  <Pressable
                    style={s.modalCloseBtn}
                    onPress={() => setDetailExercise(null)}
                  >
                    <Ionicons name="close" size={22} color="#ffffff" />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
                  {/* Secondary muscles */}
                  {detailExercise.secondaryMuscles.length > 0 && (
                    <View style={s.modalSecMusclesWrap}>
                      <Text style={s.modalSectionHead}>Secondary Muscles:</Text>
                      <Text style={s.modalSecMusclesText}>
                        {detailExercise.secondaryMuscles.join(", ")}
                      </Text>
                    </View>
                  )}

                  {/* Instructions */}
                  <Text style={[s.modalSectionHead, { marginTop: 14 }]}>
                    Execution Instructions (OpenGym Guide):
                  </Text>
                  {detailExercise.instructions.map((step, idx) => (
                    <View key={idx} style={s.instructionStepRow}>
                      <View style={s.stepNumberBadge}>
                        <Text style={s.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={s.stepInstructionText}>{step}</Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Add to Active Workout Button */}
                {activeSession ? (
                  <Pressable
                    style={s.modalAddBtn}
                    onPress={async () => {
                      await addExerciseToActiveSession(detailExercise.id);
                      setDetailExercise(null);
                      const act = await getActiveSession();
                      setActiveSession(act);
                      setActiveTab("start");
                    }}
                  >
                    <Ionicons name="add" size={18} color="#0f172a" />
                    <Text style={s.modalAddBtnText}>Add to Active Session</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={s.modalAddBtn}
                    onPress={async () => {
                      const session = await startOpenGymSession();
                      await addExerciseToActiveSession(detailExercise.id);
                      setDetailExercise(null);
                      const act = await getActiveSession();
                      setActiveSession(act);
                      setActiveTab("start");
                    }}
                  >
                    <Ionicons name="play" size={18} color="#0f172a" />
                    <Text style={s.modalAddBtnText}>Start Workout with This Lift</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD EXERCISE TO ACTIVE WORKOUT
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={addExerciseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddExerciseModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { height: "80%" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Exercise to Session</Text>
              <Pressable
                style={s.modalCloseBtn}
                onPress={() => setAddExerciseModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <View style={[s.searchBar, { marginBottom: 12 }]}>
              <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={s.searchInput}
                placeholder="Search exercise..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredExercises.slice(0, 40).map((ex) => (
                <Pressable
                  key={ex.id}
                  style={s.addExItem}
                  onPress={async () => {
                    await addExerciseToActiveSession(ex.id);
                    setAddExerciseModalVisible(false);
                    const act = await getActiveSession();
                    setActiveSession(act);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.addExItemName}>{ex.name}</Text>
                    <Text style={s.addExItemMeta}>
                      {ex.target} · {ex.equipment}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#4ade80" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: CREATE CUSTOM ROUTINE
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={createRoutineModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateRoutineModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { height: "85%" }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create New Routine</Text>
              <Pressable
                style={s.modalCloseBtn}
                onPress={() => setCreateRoutineModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.modalSectionHead}>Routine Name:</Text>
              <TextInput
                style={s.inputBox}
                placeholder="e.g. Chest & Tricep Power, Full Body Hypertrophy"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={newRoutineName}
                onChangeText={setNewRoutineName}
              />

              <Text style={[s.modalSectionHead, { marginTop: 12 }]}>Target Muscles:</Text>
              <TextInput
                style={s.inputBox}
                placeholder="e.g. Chest, Triceps, Anterior Delts"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={newRoutineMuscles}
                onChangeText={setNewRoutineMuscles}
              />

              <Text style={[s.modalSectionHead, { marginTop: 14 }]}>
                Pick Exercises ({newRoutineSelectedExIds.length} selected):
              </Text>
              <View style={[s.searchBar, { marginBottom: 10 }]}>
                <Ionicons name="search" size={16} color="rgba(255,255,255,0.5)" />
                <TextInput
                  style={s.searchInput}
                  placeholder="Filter exercises..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {filteredExercises.slice(0, 30).map((ex) => {
                const selected = newRoutineSelectedExIds.includes(ex.id);
                return (
                  <Pressable
                    key={ex.id}
                    style={[s.selectExRow, selected && s.selectExRowActive]}
                    onPress={() => toggleSelectExerciseForRoutine(ex.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.selectExName}>{ex.name}</Text>
                      <Text style={s.selectExMeta}>{ex.target} · {ex.equipment}</Text>
                    </View>
                    <Ionicons
                      name={selected ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={selected ? "#4ade80" : "rgba(255,255,255,0.3)"}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable style={s.confirmFinishBtn} onPress={handleSaveRoutine}>
              <Ionicons name="save" size={18} color="#0f172a" />
              <Text style={s.confirmFinishBtnText}>Save Routine to Catalogue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: FINISH WORKOUT CONFIRMATION
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={finishModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFinishModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Finish Workout? 💪</Text>
              <Pressable
                style={s.modalCloseBtn}
                onPress={() => setFinishModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <Text style={s.finishPromptText}>
              Great work! Your session stats will be logged to your daily fitness totals and muscle recovery profile.
            </Text>

            <View style={s.finishStatsSummary}>
              <View style={s.finishStatCol}>
                <Text style={s.finishStatVal}>{formatTime(sessionDurationSec)}</Text>
                <Text style={s.finishStatLbl}>Duration</Text>
              </View>
              <View style={s.finishStatCol}>
                <Text style={s.finishStatVal}>{activeSession?.totalSetsCompleted || 0}</Text>
                <Text style={s.finishStatLbl}>Sets Completed</Text>
              </View>
              <View style={s.finishStatCol}>
                <Text style={s.finishStatVal}>
                  {(activeSession?.totalVolumeKg || 0).toLocaleString()} kg
                </Text>
                <Text style={s.finishStatLbl}>Volume</Text>
              </View>
            </View>

            <Text style={[s.modalSectionHead, { marginTop: 16 }]}>Workout Notes (Optional):</Text>
            <TextInput
              style={s.notesInput}
              placeholder="e.g. Felt great on bench press, increased weight..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              multiline
            />

            <Pressable style={s.confirmFinishBtn} onPress={handleConfirmFinish}>
              <Ionicons name="checkmark-done" size={20} color="#0f172a" />
              <Text style={s.confirmFinishBtnText}>Log & Complete Workout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: LOG BODYWEIGHT
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Log Bodyweight</Text>
              <Pressable
                style={s.modalCloseBtn}
                onPress={() => setWeightModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <Text style={s.modalSectionHead}>Weight in Kilograms (kg):</Text>
            <TextInput
              style={s.weightInput}
              placeholder="75.0"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              value={newWeightInput}
              onChangeText={setNewWeightInput}
            />

            <Pressable
              style={s.confirmFinishBtn}
              onPress={async () => {
                const w = parseFloat(newWeightInput);
                if (w > 20 && w < 300) {
                  await logBodyweight(w);
                  setNewWeightInput("");
                  setWeightModalVisible(false);
                  const updated = await getBodyweightHistory();
                  setBodyweightList(updated);
                } else {
                  Alert.alert("Invalid Weight", "Please enter a realistic weight in kg.");
                }
              }}
            >
              <Text style={s.confirmFinishBtnText}>Save Entry</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 20,
  },

  /* ── 5-Tab Segmented Switcher Bar ────────────────────────────── */
  tabsBarContainer: {
    backgroundColor: "rgba(18, 24, 38, 0.95)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: "rgba(74, 222, 128, 0.16)",
  },
  tabIconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tabLiveDot: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 2,
  },
  tabTextActive: {
    color: "#4ade80",
    fontWeight: "800",
  },
  tabContent: {
    marginTop: 4,
  },

  /* ── Rest Timer Bar ────────────────────────────────────────── */
  restTimerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1b4b",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  restTimerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  restTimerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: 0.5,
  },
  restTimerDigits: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  restTimerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  restTimerBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  restTimerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  /* ── TAB 1: HOME STYLES ─────────────────────────────────────── */
  welcomeCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  welcomeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  welcomeDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  streakText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f97316",
  },
  readinessRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readinessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readinessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  readinessBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4ade80",
    letterSpacing: 0.5,
  },
  readinessHint: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },

  /* Active Resume Card */
  activeResumeCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  activeResumeGradient: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeResumeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activeResumeTag: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4ade80",
    letterSpacing: 0.5,
  },
  activeResumeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 1,
  },
  activeResumeMeta: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  resumeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4ade80",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resumeActionBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },

  /* Fitness Index Card & Radar */
  fitnessIndexCard: {
    backgroundColor: "#161f2e",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  fitnessIndexTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  fitnessIndexHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fitnessIndexTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  indexBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  indexBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#4ade80",
  },
  fitnessIndexDesc: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 4,
    lineHeight: 15,
  },
  dailyMetricStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  dailyMetricCol: {
    flex: 1,
    alignItems: "center",
  },
  dailyMetricVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  dailyMetricLbl: {
    fontSize: 9,
    color: "rgba(255,255,255,0.45)",
    marginTop: 1,
  },
  dailyMetricDiv: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  recordWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.25)",
  },
  recordWorkoutBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ade80",
  },
  radarWrap: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Logged Section */
  loggedSection: {
    marginBottom: 16,
  },
  loggedList: {
    gap: 8,
  },
  loggedCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  loggedLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  loggedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  loggedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  loggedMeta: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },

  /* Empty feed card */
  emptyFeedCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  emptyFeedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 8,
  },
  emptyFeedSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
  },
  emptyFeedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4ade80",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  emptyFeedBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  reRunBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  reRunBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ade80",
  },

  /* ── TAB 2: PLAN STYLES ─────────────────────────────────────── */
  planHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createRoutineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4ade80",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  createRoutineBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  subSectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  routineDetailCard: {
    backgroundColor: "#161f2e",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  routineDetailTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineColorTag: {
    width: 4,
    height: 34,
    borderRadius: 2,
    marginRight: 10,
  },
  routineDetailName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  routineDetailCategory: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 1,
  },
  startRoutineBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4ade80",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  startRoutineBtnSmallText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  routineDetailDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 8,
    lineHeight: 16,
  },
  routineMusclesTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#86efac",
    marginTop: 4,
  },
  routineExerciseList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    gap: 6,
  },
  routineExRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineExIndex: {
    width: 20,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.4)",
  },
  routineExName: {
    flex: 1,
    fontSize: 13,
    color: "#e2e8f0",
  },
  routineExEquip: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },
  routineMoreExText: {
    fontSize: 11,
    color: "#4ade80",
    marginTop: 4,
    fontWeight: "600",
  },

  /* ── TAB 3: START RUNNER STYLES ─────────────────────────────── */
  activeWorkoutWrap: {
    gap: 12,
  },
  activeSessionHero: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  activeSessionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  livePulseWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    marginRight: 6,
  },
  livePulseText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4ade80",
    letterSpacing: 0.5,
  },
  activeSessionTimer: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    fontVariant: ["tabular-nums"],
  },
  activeSessionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
  },
  activeMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  metricLbl: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  metricDiv: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  /* Exercise Runner Card */
  exerciseRunnerCard: {
    backgroundColor: "#161f2e",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  exerciseRunnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  exerciseRunnerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  exerciseRunnerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  metaBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  metaBadgeText: {
    fontSize: 10,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  exerciseRunnerBp: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  exerciseRunnerAction: {
    padding: 6,
  },

  /* Sets Table */
  setTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    marginBottom: 8,
  },
  setColText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  setRowDone: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderColor: "rgba(74, 222, 128, 0.3)",
    borderWidth: 1,
  },
  setNumberText: {
    width: 34,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  setNumberTextDone: {
    color: "#4ade80",
  },
  setPrevText: {
    width: 60,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
  },
  stepperWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    minWidth: 32,
    textAlign: "center",
  },
  stepperValTextDone: {
    color: "#86efac",
  },
  setCheckBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  setCheckBtnDone: {
    backgroundColor: "#4ade80",
  },
  setRowActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  addSetRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(74, 222, 128, 0.08)",
  },
  addSetRowText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
    marginLeft: 4,
  },
  removeSetRowBtn: {
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  removeSetRowText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },

  /* Workout Runner Action Buttons */
  workoutActionsWrap: {
    gap: 10,
    marginTop: 6,
  },
  addExToWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161f2e",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
    gap: 6,
  },
  addExToWorkoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4ade80",
  },
  finishWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ade80",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  finishWorkoutBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  cancelWorkoutBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelWorkoutBtnText: {
    fontSize: 13,
    color: "rgba(239, 68, 68, 0.8)",
    fontWeight: "600",
  },

  /* Idle Start State */
  noActiveWrap: {
    gap: 12,
  },
  startEmptyHeroCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  startEmptyHeroGradient: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  startEmptyHeroLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  startEmptyHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  startEmptyHeroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  startEmptyHeroSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    lineHeight: 16,
  },
  startEmptyHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#4ade80",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  startEmptyHeroBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },

  quickRoutineCard: {
    backgroundColor: "#161f2e",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  quickRoutineTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quickRoutineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  quickRoutineBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#4ade80",
    letterSpacing: 0.5,
  },
  quickLaunchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#4ade80",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickLaunchBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  quickRoutineTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  quickRoutineSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },

  routineListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f2e",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  routineDot: {
    width: 8,
    height: 32,
    borderRadius: 4,
  },
  routineListName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  routineListSub: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  routineStartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  routineStartBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
  },

  freestyleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161f2e",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  freestyleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  freestyleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  freestyleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  freestyleSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },

  /* ── TAB 4: STATS STYLES ─────────────────────────────────────── */
  statsSummaryGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statsSummaryCard: {
    flex: 1,
    backgroundColor: "#161f2e",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statsSummaryVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  statsSummaryLbl: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: "#161f2e",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statsSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  muscleRow: {
    marginTop: 12,
  },
  muscleRowLeft: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  muscleName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  muscleStatusTag: {
    fontSize: 11,
    fontWeight: "700",
  },
  muscleBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  muscleBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  muscleBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  musclePctText: {
    width: 36,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },

  logWeightBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logWeightBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
  },
  bwRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  bwLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bwDate: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
  },
  bwVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  completedSessionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  completedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  completedSessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  completedSessionMeta: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  sessionNotesPreview: {
    fontSize: 11,
    fontStyle: "italic",
    color: "rgba(74, 222, 128, 0.8)",
    marginTop: 3,
  },
  emptyStatsText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    marginTop: 10,
  },

  /* ── TAB 5: EXERCISE LIBRARY STYLES ─────────────────────────── */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161f2e",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#ffffff",
    marginLeft: 8,
    padding: 0,
  },
  chipsRow: {
    gap: 6,
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  chipActive: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  chipTextActive: {
    color: "#0f172a",
    fontWeight: "800",
  },
  chipSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipSmallActive: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    borderColor: "#4ade80",
    borderWidth: 1,
  },
  chipSmallText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },
  chipSmallTextActive: {
    color: "#4ade80",
    fontWeight: "700",
  },
  resultsMetaRow: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  resultsMetaText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },
  libraryList: {
    gap: 8,
  },
  libraryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#161f2e",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  libraryCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  libraryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  libraryExName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  libraryExMeta: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
    textTransform: "capitalize",
  },
  quickAddExBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#4ade80",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickAddExBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },

  /* ── SHARED STYLES ──────────────────────────────────────────── */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
  },
  statsSummary: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  todayRoutineCard: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
  },
  todayRoutineGradient: {
    padding: 18,
    borderRadius: 18,
  },
  todayRoutineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  todayRoutineBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  todayRoutineTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  todayRoutineSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    marginTop: 2,
  },
  routineExercisesPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  routineExPill: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routineExPillText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  startTodayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  startTodayBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },

  scheduleWeekRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  scheduleDayCol: {
    flex: 1,
    backgroundColor: "#161f2e",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  scheduleDayColActive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderColor: "#4ade80",
  },
  scheduleDayName: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  scheduleDayNameActive: {
    color: "#4ade80",
    fontWeight: "800",
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginVertical: 6,
  },
  scheduleRoutineMini: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.5)",
  },

  /* ── MODALS STYLES ──────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#ffffff",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    textTransform: "capitalize",
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalSectionHead: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4ade80",
    marginBottom: 6,
  },
  modalSecMusclesWrap: {
    marginBottom: 10,
  },
  modalSecMusclesText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "capitalize",
  },
  instructionStepRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4ade80",
  },
  stepInstructionText: {
    flex: 1,
    fontSize: 12,
    color: "#cbd5e1",
    lineHeight: 18,
  },
  modalAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    marginTop: 16,
  },
  modalAddBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },

  addExItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  addExItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  addExItemMeta: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
    textTransform: "capitalize",
  },

  /* Custom routine builder modal styles */
  inputBox: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#ffffff",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  selectExRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  selectExRowActive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  selectExName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  selectExMeta: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 1,
  },

  /* Finish Modal */
  finishPromptText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 18,
    marginBottom: 14,
  },
  finishStatsSummary: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 14,
  },
  finishStatCol: {
    flex: 1,
    alignItems: "center",
  },
  finishStatVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  finishStatLbl: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  notesInput: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    padding: 12,
    color: "#ffffff",
    fontSize: 13,
    height: 70,
    textAlignVertical: "top",
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  confirmFinishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  confirmFinishBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },

  /* Bodyweight modal */
  weightInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
