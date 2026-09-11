import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import {
  startStepTracking,
  subscribeToStepCount,
  getTodaySteps,
  getWeeklyStepTotal,
  getMonthlyStepTotal,
  getStepGoal,
  setStepGoal,
  checkStepCounterAvailability,
  StepCounterStatus,
  WeeklyStepData,
  MonthlyStepData,
} from "@/services/stepCounterService";

type Props = NativeStackScreenProps<RootStackParamList, "DailyStepsDashboard">;

const NAV = [
  { icon: "home-outline", label: "Home", route: "HomeDashboard" },
  { icon: "heart-outline", label: "Health", route: "HealthDashboard" },
  { icon: "compass-outline", label: "Discover", route: "Discover" },
  { icon: "barbell", label: "Fitness", route: "FitnessDashboard", active: true },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

const PRESET_GOALS = [4000, 6000, 8000, 10000, 12000];

export default function DailyStepsDashboardScreen({ navigation }: Props) {
  const [todaySteps, setTodaySteps] = useState(0);
  const [goal, setGoal] = useState(6000);
  const [status, setStatus] = useState<StepCounterStatus>({
    isAvailable: true,
    hasPermission: true,
    isTracking: false,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyStepData>({
    total: 0,
    average: 0,
    days: [
      { day: "Mon", date: "", steps: 0, isToday: false },
      { day: "Tue", date: "", steps: 0, isToday: false },
      { day: "Wed", date: "", steps: 0, isToday: false },
      { day: "Thu", date: "", steps: 0, isToday: false },
      { day: "Fri", date: "", steps: 0, isToday: false },
      { day: "Sat", date: "", steps: 0, isToday: false },
      { day: "Sun", date: "", steps: 0, isToday: false },
    ],
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyStepData>({
    total: 0,
    count: 0,
    average: 0,
    daysRecorded: 0,
  });

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState("");

  const refreshAnalytics = useCallback(async () => {
    const [w, m, g] = await Promise.all([
      getWeeklyStepTotal(),
      getMonthlyStepTotal(),
      getStepGoal(),
    ]);
    setWeeklyData(w);
    setMonthlyData(m);
    setGoal(g);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1. Check availability
      const s = await checkStepCounterAvailability();
      if (isMounted) setStatus(s);

      // 2. Fetch initial steps & goals
      const initial = await getTodaySteps();
      if (isMounted) setTodaySteps(initial);

      await refreshAnalytics();

      // 3. Start live tracking
      await startStepTracking((liveSteps) => {
        if (isMounted) {
          setTodaySteps(liveSteps);
        }
      });
    }

    init();

    const unsub = subscribeToStepCount((steps) => {
      if (isMounted) {
        setTodaySteps(steps);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [refreshAnalytics]);

  const handleSelectGoal = async (val: number) => {
    await setStepGoal(val);
    setGoal(val);
    setGoalModalVisible(false);
    await refreshAnalytics();
  };

  const handleSaveCustomGoal = async () => {
    const parsed = parseInt(customGoalInput, 10);
    if (isNaN(parsed) || parsed < 500 || parsed > 100000) {
      Alert.alert("Invalid Goal", "Please enter a realistic step goal between 500 and 100,000.");
      return;
    }
    await handleSelectGoal(parsed);
  };

  const pct = Math.min(todaySteps / Math.max(goal, 1), 1);
  const pctDisplay = Math.round((todaySteps / Math.max(goal, 1)) * 100);
  const remainingSteps = Math.max(goal - todaySteps, 0);

  // Health standard metrics
  // Average stride distance: ~0.762m
  const distanceKm = ((todaySteps * 0.762) / 1000).toFixed(2);
  // Average calories burned: ~0.04 kcal/step
  const caloriesKcal = Math.round(todaySteps * 0.04);
  // Average walking cadence: ~100 steps/min
  const activeMinutes = Math.round(todaySteps / 100);

  const walkingKm = distanceKm;
  const cyclingKm = (Number(distanceKm) * 0.6).toFixed(1);
  const runningKm = (Number(distanceKm) * 0.4).toFixed(1);

  const maxWeeklyBar = Math.max(...weeklyData.days.map((d) => d.steps), goal, 1000);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Daily Steps</Text>
        <Pressable onPress={() => setGoalModalVisible(true)} style={s.iconBtn}>
          <Ionicons name="flag-outline" size={20} color="#60a5fa" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hardware Status Banner (if unavailable) */}
        {!status.isAvailable && (
          <View style={s.sensorNotice}>
            <Ionicons name="alert-circle" size={22} color="#f59e0b" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.sensorNoticeTitle}>Hardware Step Counter Notice</Text>
              <Text style={s.sensorNoticeText}>
                {status.unavailableReason ||
                  "Sensor.TYPE_STEP_COUNTER is not present on this device or emulator. Real steps will automatically record when tested on a physical Android phone with pedometer hardware."}
              </Text>
            </View>
          </View>
        )}

        {/* Hero Card */}
        <LinearGradient
          colors={["#1e3a8a", "#2563eb", "#0d9488"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Circle Ring */}
          <View style={s.ringWrap}>
            <View style={s.ringOuter}>
              <View style={s.ringInner}>
                <Text style={s.stepsValue}>{todaySteps.toLocaleString()}</Text>
                <Text style={s.stepsLabel}>steps</Text>
                <Pressable
                  style={s.goalPill}
                  onPress={() => setGoalModalVisible(true)}
                >
                  <Text style={s.stepsGoal}>Goal: {goal.toLocaleString()} ✎</Text>
                </Pressable>
              </View>
            </View>
            {/* Progress Arc Indicator */}
            <View style={s.progressArc}>
              <View style={[s.progressFill, { width: `${pct * 100}%` }]} />
            </View>
          </View>

          {/* Vitals Summary Row */}
          <View style={s.heroStatsRow}>
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{distanceKm}</Text>
              <Text style={s.heroStatLbl}>km</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{caloriesKcal}</Text>
              <Text style={s.heroStatLbl}>kcal</Text>
            </View>
            <View style={s.heroStatDiv} />
            <View style={s.heroStat}>
              <Text style={s.heroStatVal}>{activeMinutes}</Text>
              <Text style={s.heroStatLbl}>min</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Weekly & Monthly Analytics Row */}
        <View style={s.metricsRow}>
          <View style={s.metricCard}>
            <View style={s.metricHeader}>
              <Ionicons name="calendar-outline" size={16} color="#60a5fa" />
              <Text style={s.metricLabel}>WEEKLY TOTAL</Text>
            </View>
            <Text style={s.metricValue}>{weeklyData.total.toLocaleString()}</Text>
            <Text style={s.metricSub}>Avg: {weeklyData.average.toLocaleString()} / day</Text>
          </View>

          <View style={s.metricCard}>
            <View style={s.metricHeader}>
              <Ionicons name="trending-up-outline" size={16} color="#34d399" />
              <Text style={s.metricLabel}>MONTHLY TOTAL</Text>
            </View>
            <Text style={s.metricValue}>{monthlyData.total.toLocaleString()}</Text>
            <Text style={s.metricSub}>
              {monthlyData.daysRecorded > 0
                ? `${monthlyData.daysRecorded} active days`
                : "This month"}
            </Text>
          </View>
        </View>

        {/* Weekly 7-Day Chart */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Weekly Progress</Text>
          <Text style={s.sectionSub}>Mon - Sun</Text>
        </View>

        <View style={s.chartCard}>
          <View style={s.barChart}>
            {weeklyData.days.map((w, i) => {
              const barHeight = Math.max(4, Math.min((w.steps / maxWeeklyBar) * 110, 110));
              return (
                <View key={i} style={s.barWrap}>
                  <Text style={s.barVal}>
                    {w.steps >= 1000 ? `${(w.steps / 1000).toFixed(1)}k` : w.steps}
                  </Text>
                  <LinearGradient
                    colors={
                      w.isToday
                        ? ["#60a5fa", "#34d399"]
                        : w.steps > 0
                        ? ["#2563eb", "#0d9488"]
                        : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]
                    }
                    style={[s.bar, { height: barHeight }]}
                  />
                  <Text style={[s.barDay, w.isToday && s.barDayActive]}>{w.day}</Text>
                </View>
              );
            })}
          </View>
          <View style={s.goalLine}>
            <Text style={s.goalLineText}>Daily Target: {goal.toLocaleString()} steps</Text>
          </View>
        </View>

        {/* Today's Activity Breakdown */}
        <Text style={s.sectionTitle}>Equivalent Activity</Text>
        <View style={s.activitiesGrid}>
          {[
            { icon: "walk", label: "Walking", value: `${walkingKm} km`, color: "#2563eb" },
            { icon: "bicycle", label: "Cycling Eq.", value: `${cyclingKm} km`, color: "#10b981" },
            { icon: "fitness", label: "Jogging Eq.", value: `${runningKm} km`, color: "#e11d48" },
          ].map((a) => (
            <View key={a.label} style={[s.actCard, { borderLeftColor: a.color, borderLeftWidth: 4 }]}>
              <View style={[s.actIcon, { backgroundColor: `${a.color}22` }]}>
                <Ionicons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={s.actValue}>{a.value}</Text>
              <Text style={s.actLabel}>{a.label}</Text>
            </View>
          ))}
        </View>

        {/* Goal Achievement Card */}
        <View style={s.achieveCard}>
          <LinearGradient
            colors={pct >= 1 ? ["#065f46", "#047857"] : ["#1e3a8a", "#0d9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.achieveBadge}>
            <Ionicons name={pct >= 1 ? "trophy" : "fitness"} size={26} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.achieveTitle}>{pctDisplay}% of your goal</Text>
            <Text style={s.achieveSub}>
              {remainingSteps > 0
                ? `${remainingSteps.toLocaleString()} more steps to hit your target today.`
                : "Target completed! Outstanding dedication today!"}
            </Text>
          </View>
          <Pressable
            onPress={() => setGoalModalVisible(true)}
            style={s.achieveBtn}
          >
            <Text style={s.achieveBtnText}>Set Goal</Text>
          </Pressable>
        </View>

        {/* Leaderboard / Friend comparison */}
        <Text style={s.sectionTitle}>Daily Community Rank</Text>
        <View style={s.leaderCard}>
          {[
            { rank: 1, name: "Alex M.", steps: "10,450", you: false },
            { rank: 2, name: "You (Real Time)", steps: todaySteps.toLocaleString(), you: true },
            { rank: 3, name: "Jamie R.", steps: "6,980", you: false },
          ].map((l) => (
            <View key={l.rank} style={[s.leaderRow, l.you && s.leaderRowActive]}>
              <Text style={[s.leaderRank, l.rank === 1 && { color: "#f59e0b" }]}>#{l.rank}</Text>
              <View style={[s.leaderAvatar, l.you && s.leaderAvatarActive]}>
                <Text style={s.leaderAvatarText}>{l.name[0]}</Text>
              </View>
              <Text style={[s.leaderName, l.you && s.leaderNameActive]}>{l.name}</Text>
              <Text style={s.leaderSteps}>{l.steps}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Goal Adjustment Modal */}
      <Modal visible={goalModalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Set Daily Step Goal</Text>
              <Pressable onPress={() => setGoalModalVisible(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            <Text style={s.modalSub}>Select your daily walking target:</Text>

            <View style={s.presetGoalsRow}>
              {PRESET_GOALS.map((pg) => {
                const isSelected = goal === pg;
                return (
                  <Pressable
                    key={pg}
                    onPress={() => handleSelectGoal(pg)}
                    style={[s.presetGoalBtn, isSelected && s.presetGoalBtnActive]}
                  >
                    <Text style={[s.presetGoalText, isSelected && s.presetGoalTextActive]}>
                      {pg.toLocaleString()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[s.modalSub, { marginTop: 14 }]}>Or enter custom goal:</Text>
            <View style={s.customInputRow}>
              <TextInput
                style={s.customInput}
                placeholder="e.g. 7500"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                value={customGoalInput}
                onChangeText={setCustomGoalInput}
              />
              <Pressable style={s.customSaveBtn} onPress={handleSaveCustomGoal}>
                <Text style={s.customSaveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable
            key={n.route}
            onPress={() => navigation.navigate(n.route as any)}
            style={s.navBtn}
          >
            <Ionicons
              name={n.icon as any}
              size={22}
              color={n.active ? colors.primary : colors.text.secondary}
            />
            <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  scroll: { paddingHorizontal: 16 },

  // Sensor notice
  sensorNotice: {
    flexDirection: "row",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    alignItems: "center",
  },
  sensorNoticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fbbf24",
    marginBottom: 2,
  },
  sensorNoticeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 16,
  },

  // Hero Card
  hero: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 18,
    alignItems: "center",
    minHeight: 290,
  },
  ringWrap: { alignItems: "center", marginBottom: 20 },
  ringOuter: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  ringInner: {
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepsValue: { fontSize: 34, fontWeight: "800", color: "white" },
  stepsLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  goalPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  stepsGoal: { fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  progressArc: {
    width: 176,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: "white", borderRadius: 4 },
  heroStatsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: "space-around",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroStat: { alignItems: "center" },
  heroStatVal: { fontSize: 20, fontWeight: "700", color: "white" },
  heroStatLbl: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroStatDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },

  // Metrics (Weekly / Monthly)
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },

  // Weekly Section
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chartCard: {
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 130,
    gap: 6,
    marginBottom: 12,
  },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  barVal: { fontSize: 9, color: colors.text.secondary, fontWeight: "600" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barDay: { fontSize: 10, color: colors.text.secondary },
  barDayActive: { color: "#60a5fa", fontWeight: "700" },
  goalLine: {
    borderTopWidth: 1,
    borderTopColor: "rgba(96, 165, 250, 0.3)",
    borderStyle: "dashed",
    paddingTop: 8,
  },
  goalLineText: { fontSize: 11, color: "#60a5fa" },

  // Activity cards
  activitiesGrid: { flexDirection: "row", gap: 10, marginBottom: 20, marginTop: 10 },
  actCard: {
    flex: 1,
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 18,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  actIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  actValue: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  actLabel: { fontSize: 11, color: colors.text.secondary },

  // Achievement Card
  achieveCard: {
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  achieveBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245,158,11,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  achieveTitle: { fontSize: 15, fontWeight: "700", color: "white" },
  achieveSub: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  achieveBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  achieveBtnText: { fontSize: 12, fontWeight: "700", color: "white" },

  // Leaderboard
  leaderCard: {
    backgroundColor: colors.surface.containerHigh,
    borderRadius: 24,
    padding: 16,
    gap: 4,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
    borderRadius: 14,
    paddingHorizontal: 4,
  },
  leaderRowActive: { backgroundColor: "rgba(96, 165, 250, 0.12)" },
  leaderRank: { fontSize: 13, fontWeight: "700", color: colors.text.secondary, width: 28 },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.containerHighest,
    justifyContent: "center",
    alignItems: "center",
  },
  leaderAvatarActive: { backgroundColor: "#2563eb" },
  leaderAvatarText: { fontSize: 13, fontWeight: "700", color: "white" },
  leaderName: { flex: 1, fontSize: 13, color: colors.text.secondary },
  leaderNameActive: { color: "#60a5fa", fontWeight: "700" },
  leaderSteps: { fontSize: 13, fontWeight: "700", color: colors.text.primary },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: "#181a20",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  modalSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 },
  presetGoalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetGoalBtn: {
    backgroundColor: "#22252e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  presetGoalBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#60a5fa",
  },
  presetGoalText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  presetGoalTextActive: { color: "#ffffff", fontWeight: "700" },
  customInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  customInput: {
    flex: 1,
    backgroundColor: "#22252e",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  customSaveBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 12,
  },
  customSaveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Nav
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: colors.surface.container,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
