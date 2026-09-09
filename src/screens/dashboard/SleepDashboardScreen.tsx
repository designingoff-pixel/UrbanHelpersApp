import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  PanResponder,
} from "react-native";
import Svg, { Circle, Path, G, Text as SvgText, Line } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { useAuth } from "@/context/AuthContext";
import {
  getSleepEntries,
  getSleepAlarm,
  saveSleepAlarm,
  addSleepEntry,
  formatSleepDuration,
  formatAlarmTime,
  sleepQualityLabel,
  avgSleepDuration,
  buildStageBars,
  getTodayKey,
  type SleepEntry,
  type SleepAlarmConfig,
} from "@/services/healthLogService";
import {
  cancelNotificationById,
  scheduleSleepReminder,
} from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "SleepDashboard">;

const { width: SW } = Dimensions.get("window");

// ─── Top Category Chips ────────────────────────────────────────────────────────
const CATEGORIES = ["Activity", "Sleep", "Vitals", "Food", "Together"];

// ─── Wind Down items (static educational content — intentionally not data-driven) ──
const WIND_DOWN = [
  { label: "Meditation", icon: "body" as const, bg: "#064e3b", route: "MeditationDashboard" },
  { label: "Music", icon: "musical-notes" as const, bg: "#1e3a8a" },
  { label: "Breathing", icon: "aperture" as const, bg: "#7c2d12" },
  { label: "Stories", icon: "book" as const, bg: "#4a1942" },
];

// ─── Sleep Tips (static educational content) ────────────────────────────────────
const SLEEP_TIPS = [
  { icon: "cafe" as const, title: "Avoid caffeine", desc: "No caffeine after 2 PM for better sleep onset.", c: "#431a00" },
  { icon: "phone-portrait-outline" as const, title: "Blue light", desc: "Reduce screen time 1 hour before bed.", c: "#0f172a" },
  { icon: "thermometer-outline" as const, title: "Cool room", desc: "Keep bedroom at 65–68°F for optimal rest.", c: "#042f2e" },
  { icon: "time-outline" as const, title: "Consistent schedule", desc: "Sleep and wake at the same times daily.", c: "#1c1060" },
];

// ─── Clock picker constants ───────────────────────────────────────────────────
const CLOCK_SIZE  = SW * 0.78;           // diameter of the SVG clock
const CLOCK_R     = CLOCK_SIZE / 2;      // radius to centre
const TRACK_R     = CLOCK_R * 0.72;      // arc track radius
const HANDLE_R    = 16;                  // drag handle circle radius

/** Convert hour+minute on a 24-h clock → angle in radians (0 = top = midnight) */
function timeToAngle(hour: number, minute: number): number {
  // 24 h = 2π rad.  0h00 is at the top (−π/2 in standard coords).
  const totalMins = (hour * 60 + minute) % (24 * 60);
  return (totalMins / (24 * 60)) * 2 * Math.PI - Math.PI / 2;
}

/** Convert angle (radians) back to { hour, minute } on 24-h clock, snapped to 15 min */
function angleToTime(angle: number): { hour: number; minute: number } {
  // Normalise to [0, 2π)
  let a = ((angle + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const totalMins = Math.round((a / (2 * Math.PI)) * 24 * 60 / 15) * 15;
  const clamped = totalMins % (24 * 60);
  return { hour: Math.floor(clamped / 60), minute: clamped % 60 };
}

/** Angle → x,y point on the track circle */
function angleToPoint(angle: number): { x: number; y: number } {
  return {
    x: CLOCK_R + TRACK_R * Math.cos(angle),
    y: CLOCK_R + TRACK_R * Math.sin(angle),
  };
}

/** Build SVG arc path string between two angles, always going clock-wise */
function arcPath(startAngle: number, endAngle: number): string {
  // Ensure we go clockwise from start → end
  let sweep = endAngle - startAngle;
  if (sweep <= 0) sweep += 2 * Math.PI;

  const s = angleToPoint(startAngle);
  const e = angleToPoint(endAngle);
  const largeArc = sweep > Math.PI ? 1 : 0;

  return `M ${s.x} ${s.y} A ${TRACK_R} ${TRACK_R} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

/** Calculate sleep duration in minutes between bedtime and wake time */
function calcSleepMins(btH: number, btM: number, wkH: number, wkM: number): number {
  const btTotal = btH * 60 + btM;
  const wkTotal = wkH * 60 + wkM;
  return wkTotal >= btTotal
    ? wkTotal - btTotal
    : 24 * 60 - btTotal + wkTotal;
}

/** Format h/m display, e.g. "8 hours" or "7 hours 30 min" */
function formatDurationLabel(mins: number): string {
  if (mins === 0) return "0 min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${h} hour${h > 1 ? "s" : ""} ${m} min`;
}

/** Format 24h hour+minute to "H:MM am/pm" for display inside the clock */
function fmt12(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "pm" : "am";
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, "0")} ${ampm}`;
}

// ─── Circular Sleep/Wake Clock Picker ────────────────────────────────────────
interface SleepClockPickerProps {
  visible: boolean;
  initialBedtimeHour: number;
  initialBedtimeMinute: number;
  initialWakeHour: number;
  initialWakeMinute: number;
  onSave: (bedH: number, bedM: number, wakeH: number, wakeM: number) => void;
  onCancel: () => void;
}

function SleepClockPicker({
  visible, initialBedtimeHour, initialBedtimeMinute,
  initialWakeHour, initialWakeMinute, onSave, onCancel,
}: SleepClockPickerProps) {
  const [bedH,  setBedH]  = useState(initialBedtimeHour);
  const [bedM,  setBedM]  = useState(initialBedtimeMinute);
  const [wakeH, setWakeH] = useState(initialWakeHour);
  const [wakeM, setWakeM] = useState(initialWakeMinute);

  // Reset draft state whenever the modal opens
  useEffect(() => {
    if (visible) {
      setBedH(initialBedtimeHour);
      setBedM(initialBedtimeMinute);
      setWakeH(initialWakeHour);
      setWakeM(initialWakeMinute);
    }
  }, [visible, initialBedtimeHour, initialBedtimeMinute, initialWakeHour, initialWakeMinute]);

  // PanResponder for bedtime handle
  const bedPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        // gs.moveX/Y are page coords — centre is CLOCK_R offset inside the modal
        const cx = gs.moveX - (SW - CLOCK_SIZE) / 2 - CLOCK_R;
        const cy = gs.moveY - 180 - CLOCK_R; // 180 = approx top offset of clock
        const angle = Math.atan2(cy, cx);
        const { hour, minute } = angleToTime(angle);
        setBedH(hour);
        setBedM(minute);
      },
    })
  ).current;

  // PanResponder for wake handle
  const wakePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const cx = gs.moveX - (SW - CLOCK_SIZE) / 2 - CLOCK_R;
        const cy = gs.moveY - 180 - CLOCK_R;
        const angle = Math.atan2(cy, cx);
        const { hour, minute } = angleToTime(angle);
        setWakeH(hour);
        setWakeM(minute);
      },
    })
  ).current;

  const bedAngle  = timeToAngle(bedH, bedM);
  const wakeAngle = timeToAngle(wakeH, wakeM);
  const sleepMins = calcSleepMins(bedH, bedM, wakeH, wakeM);
  const bedPt     = angleToPoint(bedAngle);
  const wakePt    = angleToPoint(wakeAngle);
  const arc       = arcPath(bedAngle, wakeAngle);

  // Hour tick labels (0, 6, 12, 18)
  const tickLabels = [
    { label: "0",  angle: timeToAngle(0, 0)  },
    { label: "6",  angle: timeToAngle(6, 0)  },
    { label: "12", angle: timeToAngle(12, 0) },
    { label: "18", angle: timeToAngle(18, 0) },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={cp.overlay}>
        <View style={cp.sheet}>

          {/* "Today" pill header */}
          <View style={cp.todayPill}>
            <Text style={cp.todayText}>Today</Text>
          </View>

          {/* SVG Clock */}
          <View style={cp.clockWrap}>
            <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
              {/* Outer track (grey ring) */}
              <Circle
                cx={CLOCK_R} cy={CLOCK_R} r={TRACK_R}
                stroke="rgba(255,255,255,0.1)" strokeWidth={28} fill="none"
              />

              {/* Purple arc (sleep period) */}
              <Path
                d={arc}
                stroke="#7c3aed" strokeWidth={28}
                fill="none" strokeLinecap="round"
              />

              {/* Dotted inner track decoration */}
              {Array.from({ length: 96 }).map((_, i) => {
                const a = (i / 96) * 2 * Math.PI - Math.PI / 2;
                const pr = TRACK_R - 20;
                const px = CLOCK_R + pr * Math.cos(a);
                const py = CLOCK_R + pr * Math.sin(a);
                return (
                  <Circle key={i} cx={px} cy={py} r={1}
                    fill="rgba(255,255,255,0.18)" />
                );
              })}

              {/* Hour labels: 0, 6, 12, 18 */}
              {tickLabels.map(({ label, angle }) => {
                const labelR = TRACK_R - 48;
                const lx = CLOCK_R + labelR * Math.cos(angle);
                const ly = CLOCK_R + labelR * Math.sin(angle);
                return (
                  <SvgText
                    key={label}
                    x={lx} y={ly + 5}
                    textAnchor="middle"
                    fontSize={13}
                    fill="rgba(255,255,255,0.45)"
                    fontWeight="600"
                  >
                    {label}
                  </SvgText>
                );
              })}

              {/* Centre display: bedtime + wake time */}
              <SvgText
                x={CLOCK_R} y={CLOCK_R - 18}
                textAnchor="middle" fontSize={22}
                fill="white" fontWeight="700"
              >
                🛏  {fmt12(bedH, bedM)}
              </SvgText>
              <SvgText
                x={CLOCK_R} y={CLOCK_R + 18}
                textAnchor="middle" fontSize={22}
                fill="white" fontWeight="700"
              >
                ⏰  {fmt12(wakeH, wakeM)}
              </SvgText>

              {/* Bedtime handle */}
              <G {...bedPan.panHandlers}>
                <Circle
                  cx={bedPt.x} cy={bedPt.y} r={HANDLE_R + 6}
                  fill="rgba(124,58,237,0.0)" // invisible hit area
                />
                <Circle
                  cx={bedPt.x} cy={bedPt.y} r={HANDLE_R}
                  fill="#1a1a2e" stroke="#7c3aed" strokeWidth={3}
                />
                <SvgText
                  x={bedPt.x} y={bedPt.y + 5}
                  textAnchor="middle" fontSize={11} fill="#a78bfa"
                >
                  🛏
                </SvgText>
              </G>

              {/* Wake handle */}
              <G {...wakePan.panHandlers}>
                <Circle
                  cx={wakePt.x} cy={wakePt.y} r={HANDLE_R + 6}
                  fill="rgba(124,58,237,0.0)"
                />
                <Circle
                  cx={wakePt.x} cy={wakePt.y} r={HANDLE_R}
                  fill="#1a1a2e" stroke="#a78bfa" strokeWidth={3}
                />
                <SvgText
                  x={wakePt.x} y={wakePt.y + 5}
                  textAnchor="middle" fontSize={11} fill="#e9d5ff"
                >
                  ⏰
                </SvgText>
              </G>
            </Svg>
          </View>

          {/* Sleep duration label */}
          <Text style={cp.durationLabel}>
            Sleep time: {formatDurationLabel(sleepMins)}
          </Text>

          {/* Cancel / Save */}
          <View style={cp.btnRow}>
            <Pressable style={cp.cancelBtn} onPress={onCancel}>
              <Text style={cp.cancelText}>Cancel</Text>
            </Pressable>
            <View style={cp.btnDivider} />
            <Pressable style={cp.saveBtn} onPress={() => onSave(bedH, bedM, wakeH, wakeM)}>
              <Text style={cp.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Derive dynamic insights from real data ────────────────────────────────────
function buildInsights(entries: SleepEntry[]): { icon: "alarm" | "moon" | "trending-up" | "trending-down" | "information-circle"; text: string; bg: string }[] {
  const insights: { icon: "alarm" | "moon" | "trending-up" | "trending-down" | "information-circle"; text: string; bg: string }[] = [];
  if (entries.length === 0) return insights;

  const avgMins = avgSleepDuration(entries);
  const avgH = Math.floor(avgMins / 60);
  const avgM = avgMins % 60;
  insights.push({
    icon: "moon",
    text: `Average sleep: ${avgH}h ${avgM}m over the last ${entries.length} night${entries.length > 1 ? "s" : ""}.`,
    bg: "#2d1060",
  });

  if (entries.length >= 2) {
    const latest = entries[0].durationMins;
    const prev = entries[1].durationMins;
    const diff = latest - prev;
    if (Math.abs(diff) >= 15) {
      insights.push({
        icon: diff > 0 ? "trending-up" : "trending-down",
        text: diff > 0
          ? `You slept ${formatSleepDuration(Math.abs(diff))} more than the previous night.`
          : `You slept ${formatSleepDuration(Math.abs(diff))} less than the previous night.`,
        bg: diff > 0 ? "#0a2c1a" : "#3b0a0a",
      });
    }
  }

  if (entries.length >= 7) {
    const scores = entries.slice(0, 7).map((e) => e.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    insights.push({
      icon: "information-circle",
      text: `Your 7-night average sleep score is ${avgScore} — ${sleepQualityLabel(avgScore)}.`,
      bg: "#1e1060",
    });
  }

  return insights;
}

// ─── Format day label from YYYY-MM-DD ─────────────────────────────────────────
function dayLabel(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date(dateStr + "T12:00:00");
  return days[d.getDay()];
}

export default function SleepDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();

  // ── Data state ─────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [entries, setEntries]       = useState<SleepEntry[]>([]);
  const [alarm, setAlarm]           = useState<SleepAlarmConfig>({ enabled: false, hour: 7, minute: 0, bedtimeHour: 23, bedtimeMinute: 0 });
  const [showPicker, setShowPicker] = useState(false);

  // ── Load data ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [fetchedEntries, fetchedAlarm] = await Promise.all([
        getSleepEntries(user.uid),
        getSleepAlarm(user.uid),
      ]);
      setEntries(fetchedEntries);
      setAlarm(fetchedAlarm);
    } catch (e) {
      console.error("Sleep data load error:", e);
      setError("Could not load sleep data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload every time the screen comes into focus
  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ── Alarm toggle ───────────────────────────────────────────────
  const handleAlarmToggle = async (val: boolean) => {
    if (!user) return;
    // Cancel any previously scheduled alarm notification
    if (alarm.notificationId) {
      try { await cancelNotificationById(alarm.notificationId); } catch (_) {}
    }
    let notificationId: string | undefined = undefined;
    if (val) {
      // Schedule a new daily sleep reminder at the configured time
      try {
        await scheduleSleepReminder(alarm.hour, alarm.minute);
        // expo-notifications daily triggers don't return a stable cancellable ID
        // via scheduleSleepReminder (it uses void return); mark as scheduled
        notificationId = `sleep_alarm_${alarm.hour}_${alarm.minute}`;
      } catch (e) {
        console.warn("Could not schedule alarm notification:", e);
      }
    }
    const updated: SleepAlarmConfig = { ...alarm, enabled: val, notificationId };
    setAlarm(updated);
    await saveSleepAlarm(user.uid, updated);
  };

  // ── Alarm picker save ──────────────────────────────────────────
  const handlePickerSave = async (bedH: number, bedM: number, wakeH: number, wakeM: number) => {
    if (!user) return;
    setShowPicker(false);
    const updated: SleepAlarmConfig = {
      ...alarm,
      bedtimeHour: bedH,
      bedtimeMinute: bedM,
      hour: wakeH,
      minute: wakeM,
    };
    setAlarm(updated);
    await saveSleepAlarm(user.uid, updated);
    // Re-schedule notification if alarm is on
    if (updated.enabled) {
      try { await scheduleSleepReminder(updated.hour, updated.minute); } catch (_) {}
    }
  };
  const lastNight      = entries[0] ?? null;
  const weekEntries    = entries.slice(0, 7);
  const avgMins        = avgSleepDuration(weekEntries);
  const insights       = buildInsights(entries);
  const stageBars      = lastNight?.stages
    ? buildStageBars(lastNight.stages, lastNight.durationMins)
    : [];
  const maxHistHours   = Math.max(...weekEntries.map((e) => e.durationMins / 60), 9);

  const navigateCategory = (cat: string) => {
    if (cat === "Activity") navigation.navigate("FitnessDashboard");
    else if (cat === "Sleep") { /* already here */ }
    else if (cat === "Vitals") navigation.navigate("VitalsScreen" as any);
    else if (cat === "Food") navigation.navigate("NutritionDashboard");
    else if (cat === "Together") navigation.navigate("FamilyDashboard");
  };

  // ── Log sleep helper (opens a simple alert-based flow) ─────────
  const handleLogSleep = () => {
    if (!user) { Alert.alert("Sign in required"); return; }
    Alert.alert(
      "Log Last Night's Sleep",
      "Enter your sleep details to track your progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log 7h (Good)",
          onPress: async () => {
            await addSleepEntry(user.uid, {
              date: getTodayKey(),
              bedtime: "11:00 PM",
              wakeTime: "06:00 AM",
              durationMins: 420,
              score: 78,
              stages: { awakeMins: 20, remMins: 80, lightMins: 180, deepMins: 140 },
            });
            await loadData();
          },
        },
        {
          text: "Log 8h (Excellent)",
          onPress: async () => {
            await addSleepEntry(user.uid, {
              date: getTodayKey(),
              bedtime: "10:30 PM",
              wakeTime: "06:30 AM",
              durationMins: 480,
              score: 91,
              stages: { awakeMins: 15, remMins: 100, lightMins: 195, deepMins: 170 },
            });
            await loadData();
          },
        },
      ]
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top ambient glow ── */}
      <LinearGradient
        colors={["rgba(109,40,217,0.35)", "rgba(45,18,100,0.18)", "transparent"]}
        style={s.topGlow}
        pointerEvents="none"
      />

      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(400)} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={s.pageTitle}>Sleep</Text>
        <Pressable onPress={() => navigation.navigate("Profile")} style={s.avatarBtn}>
          <LinearGradient colors={["#7c3aed", "#6d28d9"]} style={s.avatarInner}>
            <Ionicons name="person" size={14} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* ── Top Category Chips ── */}
      <Animated.View entering={FadeIn.delay(80).duration(380)} style={s.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsContent}
        >
          {CATEGORIES.map((cat) => {
            const active = cat === "Sleep";
            return (
              <Pressable
                key={cat}
                onPress={() => navigateCategory(cat)}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* ── Loading state ── */}
      {loading && (
        <View style={s.centerState}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={s.centerStateText}>Loading your sleep data…</Text>
        </View>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <View style={s.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={s.centerStateText}>{error}</Text>
          <Pressable style={s.retryBtn} onPress={loadData}>
            <Text style={s.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* ── Main content (only when loaded, no error) ── */}
      {!loading && !error && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* 1. Tonight banner */}
          <Animated.View entering={FadeInDown.delay(0).duration(380).springify()}>
            <LinearGradient
              colors={["#13084a", "#1a0f6b", "#2a1a9e"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.heroBanner}
            >
              {/* Stars */}
              <Text style={s.star1}>✦</Text>
              <Text style={s.star2}>✦</Text>
              <Text style={s.star3}>·</Text>
              <Text style={s.star4}>✦</Text>
              <Text style={s.star5}>·</Text>

              {lastNight ? (
                <View style={s.bannerRow}>
                  <View style={s.bannerLeft}>
                    <Text style={s.bannerLabel}>Last night</Text>
                    <Text style={s.bannerDuration}>{formatSleepDuration(lastNight.durationMins)}</Text>
                    <View style={s.bannerMetaRow}>
                      <View style={s.bannerMeta}>
                        <Ionicons name="bed" size={12} color="#a78bfa" />
                        <Text style={s.bannerMetaText}>{lastNight.bedtime}</Text>
                      </View>
                      <View style={s.bannerMeta}>
                        <Ionicons name="sunny" size={12} color="#fbbf24" />
                        <Text style={s.bannerMetaText}>{lastNight.wakeTime}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Score Ring */}
                  <View style={s.ringWrap}>
                    <View style={s.ringOuter}>
                      <View style={s.ringInner}>
                        <Text style={s.ringNum}>{lastNight.score}</Text>
                        <Text style={s.ringLabel}>score</Text>
                      </View>
                    </View>
                    <Text style={s.ringQuality}>{sleepQualityLabel(lastNight.score)}</Text>
                  </View>
                </View>
              ) : (
                <View style={s.noDataBanner}>
                  <Ionicons name="moon-outline" size={40} color="rgba(167,139,250,0.5)" />
                  <Text style={s.noDataBannerTitle}>No sleep logged yet</Text>
                  <Text style={s.noDataBannerSub}>Log your sleep to see your summary here</Text>
                  <Pressable style={s.logSleepBtn} onPress={handleLogSleep}>
                    <Ionicons name="add" size={16} color="#a78bfa" />
                    <Text style={s.logSleepBtnText}>Log Sleep</Text>
                  </Pressable>
                </View>
              )}

              {/* Stage legend strip */}
              <View style={s.stageLegendRow}>
                {[["#facc15", "Awake"], ["#c084fc", "REM"], ["#a78bfa", "Light"], ["#818cf8", "Deep"]].map(([c, l]) => (
                  <View key={l} style={s.stageLegendItem}>
                    <View style={[s.stageLegendDot, { backgroundColor: c }]} />
                    <Text style={s.stageLegendText}>{l}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* 2. Sleep Stages chart */}
          <Animated.View entering={FadeInDown.delay(60).duration(380).springify()}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Sleep stages</Text>
              <Text style={s.cardSub}>
                {lastNight?.stages ? "Detailed cycles from last night" : "Log sleep with stages to see this chart"}
              </Text>
              {lastNight?.stages && stageBars.length > 0 ? (
                <>
                  <View style={s.stagesChart}>
                    {stageBars.map((b, i) => (
                      <View key={i} style={s.stageBarTrack}>
                        <View style={[s.stageBarFill, { height: `${b.h}%` as any, backgroundColor: b.c }]} />
                      </View>
                    ))}
                  </View>
                  <View style={s.chartAxisRow}>
                    <Text style={s.axisLabel}>{lastNight.bedtime}</Text>
                    <Text style={s.axisLabel}>Mid-night</Text>
                    <Text style={s.axisLabel}>{lastNight.wakeTime}</Text>
                  </View>
                  {/* Totals row */}
                  <View style={s.stageTotalsRow}>
                    {[
                      { c: "#facc15", label: "Awake", val: formatSleepDuration(lastNight.stages.awakeMins) },
                      { c: "#c084fc", label: "REM",   val: formatSleepDuration(lastNight.stages.remMins) },
                      { c: "#a78bfa", label: "Light", val: formatSleepDuration(lastNight.stages.lightMins) },
                      { c: "#818cf8", label: "Deep",  val: formatSleepDuration(lastNight.stages.deepMins) },
                    ].map((st) => (
                      <View key={st.label} style={s.stageTotalItem}>
                        <View style={[s.stageTotalDot, { backgroundColor: st.c }]} />
                        <Text style={s.stageTotalLabel}>{st.label}</Text>
                        <Text style={s.stageTotalVal}>{st.val}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={s.emptyChartState}>
                  <Ionicons name="bar-chart-outline" size={36} color="rgba(167,139,250,0.3)" />
                  <Text style={s.emptyChartText}>No stage data available</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* 3. Sleep History */}
          <Animated.View entering={FadeInDown.delay(120).duration(380).springify()}>
            <View style={s.card}>
              <Text style={s.cardTitle}>Sleep history</Text>
              <Text style={s.cardSub}>
                {weekEntries.length > 0
                  ? `Last ${weekEntries.length} night${weekEntries.length > 1 ? "s" : ""} • Average ${formatSleepDuration(avgMins)}`
                  : "No history yet — start logging your sleep"}
              </Text>
              {weekEntries.length > 0 ? (
                <View style={s.histRow}>
                  {weekEntries.map((d, idx) => {
                    const isLatest = idx === 0;
                    const hoursFloat = d.durationMins / 60;
                    return (
                      <View key={d.id} style={s.histCol}>
                        <Text style={[s.histScore, isLatest && { color: "#a78bfa" }]}>{d.score}</Text>
                        <View style={s.histBarTrack}>
                          <LinearGradient
                            colors={isLatest ? ["#7c3aed", "#a78bfa"] : ["#4c1d95", "#6d28d9"]}
                            style={[s.histBarFill, { height: `${(hoursFloat / maxHistHours) * 100}%` as any }]}
                          />
                        </View>
                        <Text style={s.histHours}>{hoursFloat.toFixed(1)}h</Text>
                        <Text style={[s.histDay, isLatest && { color: "#a78bfa", fontWeight: "700" }]}>
                          {dayLabel(d.date)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={s.emptyChartState}>
                  <Ionicons name="time-outline" size={36} color="rgba(167,139,250,0.3)" />
                  <Text style={s.emptyChartText}>Log sleep nights to build your history</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* 4. Sleep Insights (derived from real data) */}
          <Animated.View entering={FadeInDown.delay(180).duration(380).springify()}>
            <Text style={s.sectionTitle}>Sleep insights</Text>
            <View style={s.insightsWrap}>
              {insights.length > 0 ? insights.map((ins, i) => (
                <View key={i} style={[s.insightRow, { backgroundColor: ins.bg }]}>
                  <View style={s.insightIcon}>
                    <Ionicons name={ins.icon} size={20} color="white" />
                  </View>
                  <Text style={s.insightText}>{ins.text}</Text>
                </View>
              )) : (
                <View style={[s.insightRow, { backgroundColor: "#1e1060" }]}>
                  <View style={s.insightIcon}>
                    <Ionicons name="moon-outline" size={20} color="white" />
                  </View>
                  <Text style={s.insightText}>Log a few nights of sleep to unlock personalised insights.</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* 5. Wind Down */}
          <Animated.View entering={FadeInDown.delay(240).duration(380).springify()}>
            <Text style={s.sectionTitle}>Wind down</Text>
            <View style={s.windGrid}>
              {WIND_DOWN.map((w) => (
                <Pressable
                  key={w.label}
                  style={[s.windCard, { backgroundColor: w.bg }]}
                  onPress={() => w.route ? navigation.navigate(w.route as any) : Alert.alert(w.label)}
                >
                  <View style={s.windIcon}>
                    <Ionicons name={w.icon} size={24} color="white" />
                  </View>
                  <Text style={s.windLabel}>{w.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* 6. Smart Alarm */}
          <Animated.View entering={FadeInDown.delay(300).duration(380).springify()}>
            <Text style={s.sectionTitle}>Smart alarm</Text>
            <View style={s.alarmCard}>
              <View style={s.alarmLeft}>
                <View style={s.alarmIconBox}>
                  <Ionicons name="alarm" size={22} color="#a78bfa" />
                </View>
                <View>
                  <Text style={s.alarmTime}>
                    {formatAlarmTime(alarm.hour, alarm.minute).split(" ")[0]}{" "}
                    <Text style={s.alarmAmPm}>{formatAlarmTime(alarm.hour, alarm.minute).split(" ")[1]}</Text>
                  </Text>
                  <View style={s.alarmMetaRow}>
                    <Ionicons name="sparkles" size={11} color="#a78bfa" />
                    <Text style={s.alarmMetaText}>
                      Smart Alarm · {alarm.enabled ? "Active" : "Off"}
                    </Text>
                  </View>
                  <Text style={s.alarmDesc}>Wakes you in lightest sleep phase ±30 min</Text>
                </View>
              </View>
              <Switch
                value={alarm.enabled}
                onValueChange={handleAlarmToggle}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "#7c3aed" }}
                thumbColor={alarm.enabled ? "#e9d5ff" : "rgba(255,255,255,0.5)"}
              />
            </View>

            {/* Set new alarm */}
            <Pressable
              style={s.setAlarmBtn}
              onPress={() => { if (user) setShowPicker(true); }}
            >
              <Ionicons name="add-circle-outline" size={18} color="#a78bfa" />
              <Text style={s.setAlarmText}>Set a new alarm</Text>
            </Pressable>
          </Animated.View>

          {/* 7. Sleep tips (static educational content) */}
          <Animated.View entering={FadeInDown.delay(360).duration(380).springify()}>
            <Text style={s.sectionTitle}>Sleep tips</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tipsScroll}>
              {SLEEP_TIPS.map((tip, i) => (
                <View key={i} style={[s.tipCard, { backgroundColor: tip.c }]}>
                  <View style={s.tipIconBox}>
                    <Ionicons name={tip.icon} size={22} color="white" />
                  </View>
                  <Text style={s.tipTitle}>{tip.title}</Text>
                  <Text style={s.tipDesc}>{tip.desc}</Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Log sleep FAB at bottom */}
          {lastNight && (
            <Pressable style={s.logFab} onPress={handleLogSleep}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={s.logFabText}>Log Sleep</Text>
            </Pressable>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* ── Sleep Clock Picker Modal ── */}
      <SleepClockPicker
        visible={showPicker}
        initialBedtimeHour={alarm.bedtimeHour ?? 23}
        initialBedtimeMinute={alarm.bedtimeMinute ?? 0}
        initialWakeHour={alarm.hour}
        initialWakeMinute={alarm.minute}
        onSave={handlePickerSave}
        onCancel={() => setShowPicker(false)}
      />

      {/* ── Bottom Nav ── */}
      <SamsungBottomNav activeRoute="HomeDashboard" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#09061e" },

  topGlow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 200,
  },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  pageTitle: { flex: 1, fontSize: 24, fontWeight: "800", color: "white" },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
  avatarInner: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Category Chips
  chipsWrap: { paddingBottom: 4 },
  chipsContent: { paddingHorizontal: 16, gap: 8, flexDirection: "row" },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  chipActive: {
    backgroundColor: "rgba(124,58,237,0.25)",
    borderColor: "#7c3aed",
  },
  chipText: { fontSize: 13.5, fontWeight: "600", color: "rgba(255,255,255,0.55)" },
  chipTextActive: { color: "#e9d5ff", fontWeight: "700" },

  scroll: { paddingHorizontal: 16, paddingTop: 12 },

  // ─── Hero Banner ──────────────────────────────────────────────
  heroBanner: {
    borderRadius: 28, padding: 22, marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.25)",
    overflow: "hidden",
  },
  star1: { position: "absolute", top: 14, right: 24, color: "#a78bfa", fontSize: 12 },
  star2: { position: "absolute", top: 30, right: 50, color: "#a78bfa", fontSize: 8 },
  star3: { position: "absolute", top: 20, right: 38, color: "#c4b5fd", fontSize: 18 },
  star4: { position: "absolute", top: 60, left: 20, color: "#a78bfa", fontSize: 9 },
  star5: { position: "absolute", top: 12, left: 55, color: "#c4b5fd", fontSize: 16 },

  bannerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  bannerLeft: {},
  bannerLabel: { fontSize: 12, color: "#c4b5fd", fontWeight: "600", marginBottom: 4, letterSpacing: 0.5 },
  bannerDuration: { fontSize: 44, fontWeight: "800", color: "white", lineHeight: 52 },
  bannerMetaRow: { flexDirection: "row", gap: 14, marginTop: 6 },
  bannerMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  bannerMetaText: { fontSize: 12.5, color: "rgba(255,255,255,0.65)" },

  ringWrap: { alignItems: "center" },
  ringOuter: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 5, borderColor: "#7c3aed",
    backgroundColor: "rgba(124,58,237,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  ringInner: { alignItems: "center" },
  ringNum: { fontSize: 30, fontWeight: "800", color: "#e9d5ff" },
  ringLabel: { fontSize: 10, color: "#a78bfa", fontWeight: "600", letterSpacing: 0.5 },
  ringQuality: { fontSize: 11.5, color: "#c4b5fd", fontWeight: "700", marginTop: 6 },

  stageLegendRow: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  stageLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  stageLegendDot: { width: 8, height: 8, borderRadius: 4 },
  stageLegendText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },

  // ─── Generic Card ─────────────────────────────────────────────
  card: {
    backgroundColor: "#120f30", borderRadius: 24, padding: 20,
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(124,58,237,0.18)",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 3 },
  cardSub: { fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginBottom: 16 },

  // ─── Sleep Stages ────────────────────────────────────────────
  stagesChart: {
    flexDirection: "row", alignItems: "flex-end", height: 90,
    gap: 3, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 4, marginBottom: 8,
  },
  stageBarTrack: { flex: 1, height: "100%", justifyContent: "flex-end" },
  stageBarFill: { borderRadius: 3 },
  chartAxisRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  axisLabel: { fontSize: 10, color: "rgba(255,255,255,0.35)" },
  stageTotalsRow: {
    flexDirection: "row", gap: 8, borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)", paddingTop: 12, flexWrap: "wrap",
  },
  stageTotalItem: { alignItems: "center", gap: 4, minWidth: "22%" },
  stageTotalDot: { width: 10, height: 10, borderRadius: 5 },
  stageTotalLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  stageTotalVal: { fontSize: 13, fontWeight: "700", color: "white" },

  // ─── 7-Day History ────────────────────────────────────────────
  histRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  histCol: { flex: 1, alignItems: "center", gap: 4 },
  histScore: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.45)" },
  histBarTrack: {
    width: "100%", height: 80, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "flex-end", overflow: "hidden",
  },
  histBarFill: { borderRadius: 8 },
  histHours: { fontSize: 9, color: "rgba(255,255,255,0.4)" },
  histDay: { fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: "500" },

  // ─── Insights ─────────────────────────────────────────────────
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "white", marginBottom: 12 },
  insightsWrap: { gap: 8, marginBottom: 22 },
  insightRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  insightIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  insightText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 19 },

  // ─── Wind Down ────────────────────────────────────────────────
  windGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 },
  windCard: {
    width: (SW - 32 - 10) / 2, borderRadius: 20, padding: 18,
    alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  windIcon: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  windLabel: { fontSize: 14, color: "white", fontWeight: "600" },

  // ─── Smart Alarm ──────────────────────────────────────────────
  alarmCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#120f30", borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.2)", marginBottom: 10,
  },
  alarmLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  alarmIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(124,58,237,0.18)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(124,58,237,0.3)",
  },
  alarmTime: { fontSize: 30, fontWeight: "800", color: "white" },
  alarmAmPm: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  alarmMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  alarmMetaText: { fontSize: 12, color: "rgba(255,255,255,0.55)" },
  alarmDesc: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 },

  setAlarmBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    justifyContent: "center", paddingVertical: 12,
    backgroundColor: "rgba(124,58,237,0.1)",
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(124,58,237,0.2)",
    marginBottom: 22,
  },
  setAlarmText: { fontSize: 14, fontWeight: "600", color: "#a78bfa" },

  // ─── Sleep Tips carousel ──────────────────────────────────────
  tipsScroll: { marginHorizontal: -16, marginBottom: 8 },
  tipCard: {
    width: SW * 0.6, borderRadius: 20, padding: 18, marginLeft: 16,
    gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  tipIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  tipTitle: { fontSize: 15, fontWeight: "700", color: "white" },
  tipDesc: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 18 },

  // ─── Loading / Empty / Error states ──────────────────────────
  centerState: {
    flex: 1, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 32, gap: 14,
  },
  centerStateText: {
    fontSize: 14, color: "rgba(255,255,255,0.55)",
    textAlign: "center", lineHeight: 20,
  },
  retryBtn: {
    marginTop: 4, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: "rgba(124,58,237,0.25)",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
  },
  retryBtnText: { fontSize: 14, fontWeight: "600", color: "#a78bfa" },

  // ─── No-data banner state (inside heroBanner when no sleep logged) ──
  noDataBanner: {
    alignItems: "center", paddingVertical: 16, gap: 8,
  },
  noDataBannerTitle: {
    fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.75)",
  },
  noDataBannerSub: {
    fontSize: 12.5, color: "rgba(255,255,255,0.45)", textAlign: "center",
  },
  logSleepBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 6, paddingHorizontal: 18, paddingVertical: 9,
    backgroundColor: "rgba(124,58,237,0.22)",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(124,58,237,0.35)",
  },
  logSleepBtnText: { fontSize: 13, fontWeight: "600", color: "#a78bfa" },

  // ─── Empty chart placeholder ──────────────────────────────────
  emptyChartState: {
    alignItems: "center", paddingVertical: 24, gap: 8,
  },
  emptyChartText: {
    fontSize: 12.5, color: "rgba(255,255,255,0.35)", textAlign: "center",
  },

  // ─── Log Sleep FAB ────────────────────────────────────────────
  logFab: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginHorizontal: 0, marginTop: 4, marginBottom: 14,
    paddingVertical: 13,
    backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(124,58,237,0.3)",
  },
  logFabText: { fontSize: 14, fontWeight: "600", color: "#a78bfa" },
});

// ─── Clock Picker Styles ───────────────────────────────────────────────────────
const cp = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  sheet: {
    backgroundColor: "#111118",
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingBottom: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.22)",
  },
  todayPill: {
    marginTop: 20, marginBottom: 16,
    paddingHorizontal: 32, paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 30,
  },
  todayText: { fontSize: 16, fontWeight: "700", color: "white" },
  clockWrap: {
    width: CLOCK_SIZE, height: CLOCK_SIZE,
    alignItems: "center", justifyContent: "center",
  },
  durationLabel: {
    fontSize: 17, fontWeight: "700", color: "#7c3aed",
    marginTop: 18, marginBottom: 28,
  },
  btnRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 30, overflow: "hidden",
    marginHorizontal: 24, width: SW - 48,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 16, alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.65)" },
  btnDivider: {
    width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.15)",
  },
  saveBtn: {
    flex: 1, paddingVertical: 16, alignItems: "center",
  },
  saveText: { fontSize: 16, fontWeight: "700", color: "white" },
});
