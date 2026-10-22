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
} from "@/services/openGymService";

const { width: SW } = Dimensions.get("window");

interface Props {
  onWorkoutCompleted?: () => void;
  navigation?: any;
}

type OpenGymTab = "workout" | "library" | "routines" | "stats";

export default function OpenGymView({ onWorkoutCompleted, navigation }: Props) {
  const [activeTab, setActiveTab] = useState<OpenGymTab>("workout");

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
  const [detailExercise, setDetailExercise] = useState<OpenGymExercise | null>(null);
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);

  // Routine Planner state
  const [selectedRoutine, setSelectedRoutine] = useState<OpenGymRoutine | null>(null);

  // Stats & Muscle Recovery state
  const [muscleRecovery, setMuscleRecovery] = useState<MuscleRecoveryItem[]>([]);
  const [completedSessions, setCompletedSessions] = useState<OpenGymSession[]>([]);
  const [bodyweightList, setBodyweightList] = useState<OpenGymBodyweightEntry[]>([]);
  const [newWeightInput, setNewWeightInput] = useState("");
  const [weightModalVisible, setWeightModalVisible] = useState(false);

  // Finish Workout modal
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");

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
            // Timer finished! Buzz device
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

  // Start rest timer
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
        // Automatically start 60-second rest countdown
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
    setActiveTab("workout");
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
      Alert.alert(
        "Workout Logged! 🎉",
        `Fantastic job! You completed ${res.session.totalSetsCompleted} sets and lifted ${res.session.totalVolumeKg.toLocaleString()} kg in ${res.session.durationMins} minutes.\n\n~${res.session.caloriesBurned} calories burned!`
      );
    }
  };

  // Cancel session
  const handleCancelWorkout = () => {
    Alert.alert("Cancel Workout", "Are you sure you want to discard this workout?", [
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
      const matchSearch =
        !searchQuery.trim() ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBp && matchSearch;
    });
  }, [selectedBodyPart, searchQuery]);

  // Today's scheduled routine
  const todayDayIdx = new Date().getDay();
  const todaySchedule = OPENGYM_WEEKLY_SCHEDULE.find((s) => s.dayIndex === todayDayIdx);
  const todayRoutine = todaySchedule?.routineId
    ? OPENGYM_ROUTINES.find((r) => r.id === todaySchedule.routineId)
    : null;

  return (
    <View style={s.container}>
      {/* ── OpenGym Header & Navigation Tabs ─────────────────────── */}
      <View style={s.openGymHeader}>
        <View style={s.brandRow}>
          <View style={s.brandIconWrap}>
            <Ionicons name="barbell" size={20} color="#4ade80" />
          </View>
          <View>
            <View style={s.brandTitleRow}>
              <Text style={s.brandTitle}>OpenGym</Text>
              <View style={s.badgePro}>
                <Text style={s.badgeProText}>LIVE</Text>
              </View>
            </View>
            <Text style={s.brandSubtitle}>Intelligent Workout & Strength Engine</Text>
          </View>
        </View>

        {/* 4 Tabs: Workout | Library | Routines | Stats */}
        <View style={s.tabsRow}>
          <Pressable
            style={[s.tabBtn, activeTab === "workout" && s.tabBtnActive]}
            onPress={() => setActiveTab("workout")}
          >
            <Ionicons
              name="flash"
              size={15}
              color={activeTab === "workout" ? "#4ade80" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[s.tabText, activeTab === "workout" && s.tabTextActive]}>
              Workout{activeSession ? " ●" : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[s.tabBtn, activeTab === "library" && s.tabBtnActive]}
            onPress={() => setActiveTab("library")}
          >
            <Ionicons
              name="search"
              size={15}
              color={activeTab === "library" ? "#4ade80" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[s.tabText, activeTab === "library" && s.tabTextActive]}>Library</Text>
          </Pressable>

          <Pressable
            style={[s.tabBtn, activeTab === "routines" && s.tabBtnActive]}
            onPress={() => setActiveTab("routines")}
          >
            <Ionicons
              name="calendar"
              size={15}
              color={activeTab === "routines" ? "#4ade80" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[s.tabText, activeTab === "routines" && s.tabTextActive]}>Plans</Text>
          </Pressable>

          <Pressable
            style={[s.tabBtn, activeTab === "stats" && s.tabBtnActive]}
            onPress={() => setActiveTab("stats")}
          >
            <Ionicons
              name="analytics"
              size={15}
              color={activeTab === "stats" ? "#4ade80" : "rgba(255,255,255,0.5)"}
            />
            <Text style={[s.tabText, activeTab === "stats" && s.tabTextActive]}>Recovery</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Active Rest Timer Floating Banner ──────────────────────── */}
      {restTimerSeconds !== null && (
        <View style={s.restTimerBar}>
          <View style={s.restTimerLeft}>
            <Ionicons name="timer-outline" size={20} color="#f59e0b" />
            <View style={{ marginLeft: 8 }}>
              <Text style={s.restTimerLabel}>REST TIMER</Text>
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
          TAB 1: WORKOUT (ACTIVE RUNNER OR TODAY'S SCHEDULE)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "workout" && (
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
                    <Text style={s.livePulseText}>TRAINING IN PROGRESS</Text>
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
                    <Pressable
                      style={s.exerciseRunnerAction}
                      onPress={() => handleRemoveExercise(exIdx)}
                    >
                      <Ionicons name="trash-outline" size={17} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                  </View>

                  {/* Sets Table Header */}
                  <View style={s.setTableHeader}>
                    <Text style={[s.setColText, { width: 38 }]}>SET</Text>
                    <Text style={[s.setColText, { flex: 1, textAlign: "center" }]}>WEIGHT (KG)</Text>
                    <Text style={[s.setColText, { flex: 1, textAlign: "center" }]}>REPS</Text>
                    <Text style={[s.setColText, { width: 44, textAlign: "center" }]}>DONE</Text>
                  </View>

                  {/* Sets Rows */}
                  {ex.sets.map((set, setIdx) => {
                    const isDone = set.completed;
                    return (
                      <View
                        key={`set_${exIdx}_${setIdx}`}
                        style={[s.setRow, isDone && s.setRowDone]}
                      >
                        {/* Set Number */}
                        <Text style={[s.setNumberText, isDone && s.setNumberTextDone]}>
                          {set.setNumber}
                        </Text>

                        {/* Weight Stepper */}
                        <View style={s.stepperWrap}>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepWeight(exIdx, setIdx, -2.5)}
                          >
                            <Ionicons name="remove" size={14} color="#ffffff" />
                          </Pressable>
                          <Text style={[s.stepperValText, isDone && s.stepperValTextDone]}>
                            {set.weightKg}
                          </Text>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepWeight(exIdx, setIdx, 2.5)}
                          >
                            <Ionicons name="add" size={14} color="#ffffff" />
                          </Pressable>
                        </View>

                        {/* Reps Stepper */}
                        <View style={s.stepperWrap}>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepReps(exIdx, setIdx, -1)}
                          >
                            <Ionicons name="remove" size={14} color="#ffffff" />
                          </Pressable>
                          <Text style={[s.stepperValText, isDone && s.stepperValTextDone]}>
                            {set.reps}
                          </Text>
                          <Pressable
                            style={s.stepperBtn}
                            onPress={() => handleStepReps(exIdx, setIdx, 1)}
                          >
                            <Ionicons name="add" size={14} color="#ffffff" />
                          </Pressable>
                        </View>

                        {/* Complete Checkbox */}
                        <Pressable
                          style={[s.setCheckBtn, isDone && s.setCheckBtnDone]}
                          onPress={() => handleToggleSet(exIdx, setIdx)}
                        >
                          <Ionicons
                            name={isDone ? "checkmark" : "checkmark-outline"}
                            size={18}
                            color={isDone ? "#0f172a" : "rgba(255,255,255,0.4)"}
                          />
                        </Pressable>
                      </View>
                    );
                  })}

                  {/* Add Set Button */}
                  <Pressable style={s.addSetRowBtn} onPress={() => handleAddSet(exIdx)}>
                    <Ionicons name="add" size={16} color="#4ade80" />
                    <Text style={s.addSetRowText}>Add Set</Text>
                  </Pressable>
                </View>
              ))}

              {/* Bottom Action Buttons */}
              <View style={s.workoutActionsWrap}>
                <Pressable
                  style={s.addExToWorkoutBtn}
                  onPress={() => setAddExerciseModalVisible(true)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#4ade80" />
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
            /* ── No Active Session: Start Today's Routine ───────── */
            <View style={s.noActiveWrap}>
              {/* Today's Scheduled Routine Card */}
              {todayRoutine ? (
                <View style={s.todayRoutineCard}>
                  <LinearGradient
                    colors={[todayRoutine.color, `${todayRoutine.color}44`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.todayRoutineGradient}
                  >
                    <View style={s.todayRoutineBadge}>
                      <Ionicons name="today" size={13} color="#ffffff" />
                      <Text style={s.todayRoutineBadgeText}>
                        TODAY'S SCHEDULE ({todaySchedule?.day.toUpperCase()})
                      </Text>
                    </View>

                    <Text style={s.todayRoutineTitle}>{todayRoutine.name}</Text>
                    <Text style={s.todayRoutineSub}>{todayRoutine.targetMuscles}</Text>
                    <Text style={s.todayRoutineDesc}>{todayRoutine.description}</Text>

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
              ) : (
                <View style={s.restDayCard}>
                  <Ionicons name="bed-outline" size={32} color="#4ade80" />
                  <Text style={s.restDayTitle}>Scheduled Rest Day</Text>
                  <Text style={s.restDaySub}>
                    Muscles grow and recover during rest. But you can start any routine below if you want to train today!
                  </Text>
                </View>
              )}

              {/* Quick Freestyle Start */}
              <Pressable
                style={s.freestyleCard}
                onPress={() => handleStartWorkout()}
              >
                <View style={s.freestyleLeft}>
                  <View style={s.freestyleIconWrap}>
                    <Ionicons name="flash-outline" size={22} color="#4ade80" />
                  </View>
                  <View>
                    <Text style={s.freestyleTitle}>Freestyle Session</Text>
                    <Text style={s.freestyleSub}>Build your own workout as you lift</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </Pressable>

              {/* Quick Preset Routines List */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>OpenGym Preset Routines</Text>
                <Pressable onPress={() => setActiveTab("routines")}>
                  <Text style={s.sectionLink}>View All ({OPENGYM_ROUTINES.length})</Text>
                </Pressable>
              </View>

              {OPENGYM_ROUTINES.map((routine) => (
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
            </View>
          )}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: EXERCISE LIBRARY (SEARCH & FULL FORM CUES)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "library" && (
        <View style={s.tabContent}>
          {/* Search Box */}
          <View style={s.searchBar}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={s.searchInput}
              placeholder="Search by exercise, muscle, or barbell..."
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
              { id: "all", label: "All" },
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

          {/* Results Count */}
          <View style={s.resultsMetaRow}>
            <Text style={s.resultsMetaText}>
              Showing {filteredExercises.length} exercises from OpenGym Catalogue
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
                <Ionicons name="information-circle-outline" size={20} color="rgba(255,255,255,0.4)" />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: ROUTINES (WEEKLY PLANNER)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "routines" && (
        <View style={s.tabContent}>
          {/* Weekly Schedule Strip */}
          <Text style={s.sectionTitle}>Weekly Schedule</Text>
          <View style={s.scheduleWeekRow}>
            {OPENGYM_WEEKLY_SCHEDULE.map((sch) => {
              const isToday = sch.dayIndex === todayDayIdx;
              const r = sch.routineId ? OPENGYM_ROUTINES.find((item) => item.id === sch.routineId) : null;
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

          {/* Routine Cards List */}
          <Text style={[s.sectionTitle, { marginTop: 20 }]}>Available Routines</Text>
          {OPENGYM_ROUTINES.map((routine) => (
            <View key={routine.id} style={s.routineDetailCard}>
              <View style={s.routineDetailTop}>
                <View style={[s.routineColorTag, { backgroundColor: routine.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.routineDetailName}>{routine.name}</Text>
                  <Text style={s.routineDetailCategory}>{routine.category}</Text>
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

              {/* Exercises in routine */}
              <View style={s.routineExerciseList}>
                {routine.exerciseIds.map((exId, idx) => {
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
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 4: RECOVERY & STATS (FATIGUE MAP & BODYWEIGHT)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "stats" && (
        <View style={s.tabContent}>
          {/* Muscle Recovery Heatmap Breakdown */}
          <View style={s.statsCard}>
            <View style={s.sectionHeader}>
              <View>
                <Text style={s.sectionTitle}>Muscle Recovery Map</Text>
                <Text style={s.statsSubtitle}>
                  Calculated based on training volume & set recovery decay
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

            {bodyweightList.slice(-4).reverse().map((entry) => (
              <View key={entry.id} style={s.bwRow}>
                <View style={s.bwLeft}>
                  <Ionicons name="scale-outline" size={18} color="#4ade80" />
                  <Text style={s.bwDate}>{entry.date}</Text>
                </View>
                <Text style={s.bwVal}>{entry.weightKg} kg</Text>
              </View>
            ))}
          </View>

          {/* Recent Completed Workouts */}
          <View style={[s.statsCard, { marginTop: 16 }]}>
            <Text style={s.sectionTitle}>Completed Sessions</Text>
            {completedSessions.length === 0 ? (
              <Text style={s.emptyStatsText}>
                No workouts finished yet. Start a session today to build your history!
              </Text>
            ) : (
              completedSessions.slice(0, 5).map((sItem) => (
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
                </View>
              ))
            )}
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
                      setActiveTab("workout");
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
    marginTop: 18,
    marginBottom: 20,
  },
  openGymHeader: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  brandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  badgePro: {
    backgroundColor: "#4ade80",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeProText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#0f172a",
  },
  brandSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 1,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 9,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.55)",
  },
  tabTextActive: {
    color: "#4ade80",
    fontWeight: "800",
  },
  tabContent: {
    marginTop: 14,
  },

  /* ── Rest Timer Bar ────────────────────────────────────────── */
  restTimerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1b4b",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
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

  /* ── Active Workout ─────────────────────────────────────────── */
  activeWorkoutWrap: {
    gap: 12,
  },
  activeSessionHero: {
    borderRadius: 18,
    padding: 18,
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
    marginBottom: 14,
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

  /* ── Exercise Runner Card ────────────────────────────────────── */
  exerciseRunnerCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  exerciseRunnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  setRowDone: {
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderColor: "rgba(74, 222, 128, 0.3)",
    borderWidth: 1,
  },
  setNumberText: {
    width: 30,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  setNumberTextDone: {
    color: "#4ade80",
  },
  stepperWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    minWidth: 34,
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
    marginLeft: 6,
  },
  setCheckBtnDone: {
    backgroundColor: "#4ade80",
  },
  addSetRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: "rgba(74, 222, 128, 0.08)",
  },
  addSetRowText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
    marginLeft: 4,
  },

  /* Workout Action Buttons */
  workoutActionsWrap: {
    gap: 10,
    marginTop: 6,
  },
  addExToWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
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

  /* ── No Active Session View ─────────────────────────────────── */
  noActiveWrap: {
    gap: 12,
  },
  todayRoutineCard: {
    borderRadius: 18,
    overflow: "hidden",
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
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  todayRoutineSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    marginTop: 2,
  },
  todayRoutineDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    lineHeight: 17,
  },
  routineExercisesPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
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
    borderRadius: 12,
    paddingVertical: 13,
    gap: 8,
  },
  startTodayBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  restDayCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 10,
  },
  restDaySub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  freestyleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  freestyleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  freestyleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  sectionLink: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "700",
  },
  routineListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  routineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routineListName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  routineListSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  routineStartBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  routineStartBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
  },

  /* ── Tab 2: Exercise Library ─────────────────────────────────── */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#ffffff",
    marginLeft: 8,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  chipActive: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  chipTextActive: {
    color: "#0f172a",
    fontWeight: "800",
  },
  resultsMetaRow: {
    marginBottom: 8,
  },
  resultsMetaText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  libraryList: {
    gap: 8,
  },
  libraryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  libraryCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  libraryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
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
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    textTransform: "capitalize",
  },

  /* ── Tab 3: Routines ─────────────────────────────────────────── */
  scheduleWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  scheduleDayCol: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    flex: 1,
  },
  scheduleDayColActive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
  },
  scheduleDayName: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
  },
  scheduleDayNameActive: {
    color: "#4ade80",
    fontWeight: "900",
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginVertical: 6,
  },
  scheduleRoutineMini: {
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  routineDetailCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  routineDetailTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  routineColorTag: {
    width: 4,
    height: 36,
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
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },
  startRoutineBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  startRoutineBtnSmallText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  routineDetailDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginVertical: 8,
    lineHeight: 17,
  },
  routineExerciseList: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 8,
    gap: 6,
  },
  routineExRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  routineExIndex: {
    width: 20,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
  },
  routineExName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  routineExEquip: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },

  /* ── Tab 4: Recovery & Stats ─────────────────────────────────── */
  statsCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statsSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
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
    backgroundColor: "rgba(255,255,255,0.08)",
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
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  logWeightBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logWeightBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
    marginLeft: 2,
  },
  bwRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  bwLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bwDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  bwVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptyStatsText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginTop: 8,
    lineHeight: 18,
  },
  completedSessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  completedIconWrap: {
    width: 32,
    alignItems: "center",
  },
  completedSessionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  completedSessionMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },

  /* ── Modals ──────────────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    textTransform: "capitalize",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSectionHead: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
  },
  modalSecMusclesWrap: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 10,
    padding: 10,
  },
  modalSecMusclesText: {
    fontSize: 12,
    color: "#e2e8f0",
  },
  instructionStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4ade80",
  },
  stepInstructionText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
  modalAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ade80",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    gap: 6,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  addExItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  addExItemMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    textTransform: "capitalize",
  },
  finishPromptText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
    marginBottom: 14,
  },
  finishStatsSummary: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-around",
  },
  finishStatCol: {
    alignItems: "center",
  },
  finishStatVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4ade80",
  },
  finishStatLbl: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  notesInput: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#ffffff",
    height: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  confirmFinishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ade80",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    gap: 6,
  },
  confirmFinishBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  weightInput: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 10,
  },
});
