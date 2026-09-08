import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "CycleTracking">;
const { width: SW } = Dimensions.get("window");

const FLOW_OPTIONS = [
  { id: "none", label: "None", icon: "water-off-outline" },
  { id: "spotting", label: "Spotting", icon: "water-outline" },
  { id: "light", label: "Light", icon: "water" },
  { id: "medium", label: "Medium", icon: "water" },
  { id: "heavy", label: "Heavy", icon: "water-sharp" },
];

const SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Fatigue",
  "Backache",
  "Tender Breasts",
  "Acne",
  "Cravings",
  "Nausea",
  "Insomnia",
];

const MOODS = [
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "sensitive", label: "Sensitive", emoji: "🥺" },
  { id: "irritable", label: "Irritable", emoji: "😤" },
  { id: "sad", label: "Low", emoji: "😔" },
];

const PAST_CYCLES = [
  { month: "August 2026", length: "28 days", period: "5 days", status: "Regular" },
  { month: "July 2026", length: "29 days", period: "5 days", status: "Regular" },
  { month: "June 2026", length: "28 days", period: "4 days", status: "Regular" },
  { month: "May 2026", length: "27 days", period: "5 days", status: "Regular" },
];

export default function CycleTrackingScreen({ navigation }: Props) {
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedFlow, setSelectedFlow] = useState<string>("none");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Bloating"]);
  const [selectedMood, setSelectedMood] = useState<string>("energetic");

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSaveLog = () => {
    Alert.alert("Logged Successfully", "Your symptoms and daily cycle notes have been updated.");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top Header ────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Cycle Tracking</Text>
        <Pressable
          style={s.iconBtn}
          onPress={() => Alert.alert("Cycle Settings", "Cycle length: 28 days\nPeriod length: 5 days\nLuteal phase: 14 days")}
        >
          <Ionicons name="calendar-outline" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── 1. Hero Cycle Status Card ───────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={["#d81b60", "#e91e63", "#f06292"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroCard}
          >
            {/* Background decorative glow */}
            <View style={s.heroGlow} />

            <View style={s.heroTopRow}>
              <View style={s.phaseBadge}>
                <Ionicons name="sparkles" size={13} color="#ffffff" />
                <Text style={s.phaseBadgeText}>FERTILE WINDOW · DAY 14</Text>
              </View>
              <Text style={s.cycleDaySub}>Cycle Day 14 of 28</Text>
            </View>

            {/* Circular Cycle Dial Visual */}
            <View style={s.cycleDialWrap}>
              <View style={s.cycleDialRingOuter}>
                <View style={s.cycleDialRingInner}>
                  <MaterialCommunityIcons name="flower-tulip" size={42} color="#ffffff" />
                  <Text style={s.dialDayNum}>Day 14</Text>
                  <Text style={s.dialPhaseLabel}>Ovulation</Text>
                </View>
              </View>
            </View>

            {/* Key cycle forecast */}
            <View style={s.forecastBox}>
              <View style={s.forecastCol}>
                <Text style={s.forecastLabel}>Chances of Conception</Text>
                <Text style={s.forecastValueHighlight}>High</Text>
              </View>
              <View style={s.forecastDivider} />
              <View style={s.forecastCol}>
                <Text style={s.forecastLabel}>Next Period In</Text>
                <Text style={s.forecastValue}>14 days</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── 2. Days Strip (Cycle Timeline) ──────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Cycle Timeline</Text>
          <Text style={s.cardSub}>September 2026</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timelineScroll}>
            {[
              { dayNum: 10, cycleDay: 10, phase: "follicular", date: "Wed" },
              { dayNum: 11, cycleDay: 11, phase: "follicular", date: "Thu" },
              { dayNum: 12, cycleDay: 12, phase: "fertile", date: "Fri" },
              { dayNum: 13, cycleDay: 13, phase: "fertile", date: "Sat" },
              { dayNum: 14, cycleDay: 14, phase: "ovulation", date: "Sun", current: true },
              { dayNum: 15, cycleDay: 15, phase: "fertile", date: "Mon" },
              { dayNum: 16, cycleDay: 16, phase: "luteal", date: "Tue" },
              { dayNum: 17, cycleDay: 17, phase: "luteal", date: "Wed" },
              { dayNum: 18, cycleDay: 18, phase: "luteal", date: "Thu" },
            ].map((d) => {
              const isSelected = selectedDay === d.cycleDay;
              const isOvulation = d.phase === "ovulation";
              const isFertile = d.phase === "fertile";

              return (
                <Pressable
                  key={d.dayNum}
                  onPress={() => setSelectedDay(d.cycleDay)}
                  style={[
                    s.dayPill,
                    isSelected && s.dayPillSelected,
                    isOvulation && !isSelected && s.dayPillOvulation,
                  ]}
                >
                  <Text style={[s.dayPillDate, isSelected && s.dayPillTextActive]}>{d.date}</Text>
                  <Text style={[s.dayPillNum, isSelected && s.dayPillTextActive]}>{d.dayNum}</Text>
                  <View
                    style={[
                      s.dayDot,
                      isOvulation
                        ? { backgroundColor: "#f43f5e" }
                        : isFertile
                        ? { backgroundColor: "#38bdf8" }
                        : { backgroundColor: "rgba(255,255,255,0.2)" },
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Phase legend */}
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#f43f5e" }]} />
              <Text style={s.legendText}>Ovulation</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#38bdf8" }]} />
              <Text style={s.legendText}>Fertile window</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: "#ec4899" }]} />
              <Text style={s.legendText}>Period</Text>
            </View>
          </View>
        </View>

        {/* ── 3. Flow Level Logging ───────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Menstrual Flow</Text>
          <Text style={s.cardSub}>Track flow for Day {selectedDay}</Text>

          <View style={s.flowRow}>
            {FLOW_OPTIONS.map((f) => {
              const active = selectedFlow === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setSelectedFlow(f.id)}
                  style={[s.flowBtn, active && s.flowBtnActive]}
                >
                  <Ionicons
                    name={active ? "water" : "water-outline"}
                    size={22}
                    color={active ? "#ffffff" : "rgba(255,255,255,0.5)"}
                  />
                  <Text style={[s.flowLabel, active && s.flowLabelActive]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── 4. Symptoms Logger ──────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Daily Symptoms</Text>
          <Text style={s.cardSub}>Select symptoms you are experiencing today</Text>

          <View style={s.chipsWrap}>
            {SYMPTOMS.map((sym) => {
              const active = selectedSymptoms.includes(sym);
              return (
                <Pressable
                  key={sym}
                  onPress={() => toggleSymptom(sym)}
                  style={[s.chip, active && s.chipActive]}
                >
                  <Ionicons
                    name={active ? "checkmark-circle" : "add-circle-outline"}
                    size={16}
                    color={active ? "#ffffff" : "rgba(255,255,255,0.6)"}
                  />
                  <Text style={[s.chipText, active && s.chipTextActive]}>{sym}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── 5. Mood Logger ─────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Today's Mood</Text>
          <Text style={s.cardSub}>How are you feeling right now?</Text>

          <View style={s.moodGrid}>
            {MOODS.map((m) => {
              const active = selectedMood === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setSelectedMood(m.id)}
                  style={[s.moodCard, active && s.moodCardActive]}
                >
                  <Text style={s.moodEmoji}>{m.emoji}</Text>
                  <Text style={[s.moodLabel, active && s.moodLabelActive]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={s.saveLogBtn} onPress={handleSaveLog}>
            <Ionicons name="checkmark" size={20} color="#ffffff" />
            <Text style={s.saveLogBtnText}>Save Today's Log</Text>
          </Pressable>
        </View>

        {/* ── 6. Cycle Phase Insights ─────────────────────────── */}
        <View style={s.card}>
          <View style={s.insightHeader}>
            <Ionicons name="bulb-outline" size={22} color="#f472b6" />
            <Text style={s.insightTitle}>Insights for Ovulation Phase</Text>
          </View>
          <Text style={s.insightDesc}>
            Your estrogen and luteinizing hormone (LH) peak around this time. Energy, focus, and social engagement are naturally higher.
          </Text>

          <View style={s.tipBox}>
            <View style={s.tipIconWrap}>
              <Ionicons name="restaurant-outline" size={18} color="#f472b6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tipHeading}>Nutrition</Text>
              <Text style={s.tipBody}>
                Include leafy greens, berries, and healthy fats like avocado to support hormone balance.
              </Text>
            </View>
          </View>

          <View style={s.tipBox}>
            <View style={s.tipIconWrap}>
              <Ionicons name="barbell-outline" size={18} color="#f472b6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tipHeading}>Movement & Workouts</Text>
              <Text style={s.tipBody}>
                Great time for high-intensity training (HIIT), strength workouts, and outdoor runs.
              </Text>
            </View>
          </View>
        </View>

        {/* ── 7. Cycle History ────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Cycle History</Text>
          <Text style={s.cardSub}>Average cycle: 28 days · Average period: 5 days</Text>

          <View style={s.historyList}>
            {PAST_CYCLES.map((c, i) => (
              <View key={c.month} style={[s.historyItem, i < PAST_CYCLES.length - 1 && s.historyItemBorder]}>
                <View>
                  <Text style={s.historyMonth}>{c.month}</Text>
                  <Text style={s.historySub}>{c.period} period</Text>
                </View>
                <View style={s.historyBadge}>
                  <Text style={s.historyLength}>{c.length}</Text>
                  <Text style={s.historyStatus}>{c.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Hero
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  cycleDaySub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },

  // Dial
  cycleDialWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  cycleDialRingOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cycleDialRingInner: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialDayNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 4,
  },
  dialPhaseLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },

  // Forecast
  forecastBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.24)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 18,
  },
  forecastCol: {
    flex: 1,
    alignItems: "center",
  },
  forecastLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  forecastValueHighlight: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fde047",
  },
  forecastDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 10,
  },

  // Generic Card
  card: {
    backgroundColor: "#16181e",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 16,
  },

  // Timeline Strip
  timelineScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  dayPill: {
    width: 54,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#20232b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  dayPillSelected: {
    backgroundColor: "#e11d48",
    borderColor: "#f43f5e",
  },
  dayPillOvulation: {
    borderColor: "rgba(244,63,94,0.4)",
  },
  dayPillDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    marginBottom: 2,
  },
  dayPillNum: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  dayPillTextActive: {
    color: "#ffffff",
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  // Flow Row
  flowRow: {
    flexDirection: "row",
    gap: 8,
  },
  flowBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#20232b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },
  flowBtnActive: {
    backgroundColor: "#e11d48",
    borderColor: "#f43f5e",
  },
  flowLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  flowLabelActive: {
    color: "#ffffff",
  },

  // Symptoms Chips
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#20232b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  chipActive: {
    backgroundColor: "#be185d",
    borderColor: "#f472b6",
  },
  chipText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Mood Grid
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  moodCard: {
    width: (SW - 32 - 40 - 20) / 3,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#20232b",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 6,
  },
  moodCardActive: {
    backgroundColor: "rgba(233,30,99,0.25)",
    borderColor: "#ec4899",
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  moodLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  saveLogBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 4,
  },
  saveLogBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Insights
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f472b6",
  },
  insightDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
    marginBottom: 14,
  },
  tipBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#20232b",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(244,114,182,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  tipBody: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 17,
  },

  // History
  historyList: {
    marginTop: 4,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  historyMonth: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  historySub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
  },
  historyBadge: {
    alignItems: "flex-end",
  },
  historyLength: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f472b6",
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
});
