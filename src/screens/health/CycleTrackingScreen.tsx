import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import {
  CycleConfig,
  CycleDayLog,
  getCycleConfig,
  saveCycleConfig,
  getCycleLogs,
  saveCycleDayLog,
} from "@/services/cycleTrackingService";

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
  const [config, setConfig] = useState<CycleConfig>({
    cycleLength: 28,
    periodLength: 5,
    lutealLength: 14,
    lastPeriodStart: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0],
  });

  const [allLogs, setAllLogs] = useState<Record<string, CycleDayLog>>({});
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = today

  // Current selected day parameters
  const [selectedFlow, setSelectedFlow] = useState<string>("none");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Bloating"]);
  const [selectedMood, setSelectedMood] = useState<string>("energetic");
  const [selectedNotes, setSelectedNotes] = useState<string>("");

  // Settings Modal
  const [settingsModal, setSettingsModal] = useState(false);
  const [tempCycleLength, setTempCycleLength] = useState("28");
  const [tempPeriodLength, setTempPeriodLength] = useState("5");

  // Calculate current cycle day based on lastPeriodStart
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];

  const targetDateObj = new Date(Date.now() + selectedDayOffset * 86400000);
  const targetDateStr = targetDateObj.toISOString().split("T")[0];

  const periodStartDate = new Date(config.lastPeriodStart);
  const diffDays = Math.floor((targetDateObj.getTime() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentCycleDay = ((diffDays % config.cycleLength) + config.cycleLength) % config.cycleLength + 1;

  // Determine Phase
  let currentPhase = "Follicular";
  let conceptionChance = "Low";
  let phaseBadge = "FOLLICULAR PHASE";
  let phaseColor = "#38bdf8";

  const ovulationDay = config.cycleLength - config.lutealLength;
  const fertileStart = ovulationDay - 4;
  const fertileEnd = ovulationDay + 1;

  if (currentCycleDay <= config.periodLength) {
    currentPhase = "Menstruation";
    conceptionChance = "Very Low";
    phaseBadge = "PERIOD PHASE";
    phaseColor = "#ec4899";
  } else if (currentCycleDay === ovulationDay) {
    currentPhase = "Ovulation";
    conceptionChance = "Peak";
    phaseBadge = "OVULATION DAY";
    phaseColor = "#f43f5e";
  } else if (currentCycleDay >= fertileStart && currentCycleDay <= fertileEnd) {
    currentPhase = "Fertile Window";
    conceptionChance = "High";
    phaseBadge = "FERTILE WINDOW";
    phaseColor = "#fb923c";
  } else if (currentCycleDay > fertileEnd) {
    currentPhase = "Luteal Phase";
    conceptionChance = "Low";
    phaseBadge = "LUTEAL PHASE";
    phaseColor = "#a855f7";
  }

  const daysToNextPeriod = config.cycleLength - currentCycleDay + 1;

  // Load configuration and logs
  const loadData = useCallback(async () => {
    const [cfg, logs] = await Promise.all([getCycleConfig(), getCycleLogs()]);
    setConfig(cfg);
    setTempCycleLength(String(cfg.cycleLength));
    setTempPeriodLength(String(cfg.periodLength));
    setAllLogs(logs);

    if (logs[targetDateStr]) {
      const entry = logs[targetDateStr];
      setSelectedFlow(entry.flow || "none");
      setSelectedSymptoms(entry.symptoms || []);
      setSelectedMood(entry.mood || "energetic");
      setSelectedNotes(entry.notes || "");
    }
  }, [targetDateStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle switching date from timeline
  const handleSelectDay = (offset: number) => {
    setSelectedDayOffset(offset);
    const dateObj = new Date(Date.now() + offset * 86400000);
    const dStr = dateObj.toISOString().split("T")[0];

    if (allLogs[dStr]) {
      const entry = allLogs[dStr];
      setSelectedFlow(entry.flow || "none");
      setSelectedSymptoms(entry.symptoms || []);
      setSelectedMood(entry.mood || "energetic");
      setSelectedNotes(entry.notes || "");
    } else {
      setSelectedFlow("none");
      setSelectedSymptoms([]);
      setSelectedMood("calm");
      setSelectedNotes("");
    }
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSaveLog = async () => {
    const newLog: CycleDayLog = {
      date: targetDateStr,
      cycleDay: currentCycleDay,
      flow: selectedFlow as any,
      symptoms: selectedSymptoms,
      mood: selectedMood,
      notes: selectedNotes.trim(),
      updatedAt: Date.now(),
    };

    await saveCycleDayLog(newLog);
    setAllLogs((prev) => ({ ...prev, [targetDateStr]: newLog }));
    Alert.alert(
      "Log Saved ✨",
      `Symptoms, mood, and flow for Cycle Day ${currentCycleDay} (${targetDateStr}) have been successfully recorded.`
    );
  };

  const handleSaveSettings = async () => {
    const cLen = parseInt(tempCycleLength, 10);
    const pLen = parseInt(tempPeriodLength, 10);
    if (isNaN(cLen) || cLen < 20 || cLen > 45) {
      Alert.alert("Invalid Length", "Cycle length must be between 20 and 45 days.");
      return;
    }
    if (isNaN(pLen) || pLen < 2 || pLen > 10) {
      Alert.alert("Invalid Length", "Period length must be between 2 and 10 days.");
      return;
    }

    const updated = {
      ...config,
      cycleLength: cLen,
      periodLength: pLen,
    };
    await saveCycleConfig(updated);
    setConfig(updated);
    setSettingsModal(false);
    Alert.alert("Settings Updated", "Your cycle length and period parameters have been updated.");
  };

  // Generate 9 days for horizontal timeline around selected offset
  const timelineDays = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(Date.now() + offset * 86400000);
    const diff = Math.floor((d.getTime() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const cDay = ((diff % config.cycleLength) + config.cycleLength) % config.cycleLength + 1;
    const isToday = offset === 0;
    const isSelected = offset === selectedDayOffset;
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();

    let dotColor = "rgba(255,255,255,0.25)";
    if (cDay <= config.periodLength) dotColor = "#ec4899";
    else if (cDay === ovulationDay) dotColor = "#f43f5e";
    else if (cDay >= fertileStart && cDay <= fertileEnd) dotColor = "#38bdf8";

    return {
      offset,
      dayName,
      dayNum,
      cycleDay: cDay,
      isToday,
      isSelected,
      dotColor,
    };
  });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top Header ────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Cycle Tracking</Text>
        <Pressable style={s.iconBtn} onPress={() => setSettingsModal(true)}>
          <Ionicons name="options-outline" size={22} color="#ffffff" />
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
            <View style={s.heroGlow} />

            <View style={s.heroTopRow}>
              <View style={s.phaseBadge}>
                <Ionicons name="sparkles" size={13} color="#ffffff" />
                <Text style={s.phaseBadgeText}>
                  {phaseBadge} · DAY {currentCycleDay}
                </Text>
              </View>
              <Text style={s.cycleDaySub}>Cycle Day {currentCycleDay} of {config.cycleLength}</Text>
            </View>

            {/* Circular Cycle Dial Visual */}
            <View style={s.cycleDialWrap}>
              <View style={s.cycleDialRingOuter}>
                <View style={s.cycleDialRingInner}>
                  <MaterialCommunityIcons name="flower-tulip" size={40} color="#ffffff" />
                  <Text style={s.dialDayNum}>Day {currentCycleDay}</Text>
                  <Text style={s.dialPhaseLabel}>{currentPhase}</Text>
                </View>
              </View>
            </View>

            {/* Key cycle forecast */}
            <View style={s.forecastBox}>
              <View style={s.forecastCol}>
                <Text style={s.forecastLabel}>Conception Chance</Text>
                <Text style={s.forecastValueHighlight}>{conceptionChance}</Text>
              </View>
              <View style={s.forecastDivider} />
              <View style={s.forecastCol}>
                <Text style={s.forecastLabel}>Next Period In</Text>
                <Text style={s.forecastValue}>{daysToNextPeriod} days</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── 2. Days Strip (Cycle Timeline) ──────────────────── */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <View>
              <Text style={s.cardTitle}>Cycle Timeline</Text>
              <Text style={s.cardSub}>
                Selected: {targetDateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
              </Text>
            </View>
            {selectedDayOffset !== 0 && (
              <Pressable style={s.todayPillBtn} onPress={() => handleSelectDay(0)}>
                <Text style={s.todayPillBtnText}>Jump to Today</Text>
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timelineScroll}>
            {timelineDays.map((d) => (
              <Pressable
                key={d.offset}
                onPress={() => handleSelectDay(d.offset)}
                style={[
                  s.dayPill,
                  d.isSelected && s.dayPillSelected,
                  d.isToday && !d.isSelected && s.dayPillToday,
                ]}
              >
                <Text style={[s.dayPillDate, d.isSelected && s.dayPillTextActive]}>{d.dayName}</Text>
                <Text style={[s.dayPillNum, d.isSelected && s.dayPillTextActive]}>{d.dayNum}</Text>
                <View style={[s.dayDot, { backgroundColor: d.dotColor }]} />
              </Pressable>
            ))}
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
          <Text style={s.cardSub}>Log flow volume for Day {currentCycleDay}</Text>

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
                    name={active ? "water" : (f.icon as any)}
                    size={20}
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
          <Text style={s.cardSub}>Select any symptoms you are experiencing</Text>

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

        {/* ── 5. Mood Logger & Notes ──────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Today's Mood & State</Text>
          <Text style={s.cardSub}>How are you feeling emotionally and physically?</Text>

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

          {/* Notes input */}
          <Text style={[s.cardSub, { marginBottom: 6, marginTop: 10 }]}>Daily Journal / Notes (Optional)</Text>
          <TextInput
            style={s.notesInput}
            placeholder="Add personal notes, medications, or body sensations..."
            placeholderTextColor="#64748b"
            value={selectedNotes}
            onChangeText={setSelectedNotes}
            multiline
          />

          <Pressable style={s.saveLogBtn} onPress={handleSaveLog}>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={s.saveLogBtnText}>Save Day {currentCycleDay} Log</Text>
          </Pressable>
        </View>

        {/* ── 6. Cycle Phase Insights ─────────────────────────── */}
        <View style={s.card}>
          <View style={s.insightHeader}>
            <Ionicons name="bulb-outline" size={22} color="#f472b6" />
            <Text style={s.insightTitle}>Insights for {currentPhase}</Text>
          </View>
          <Text style={s.insightDesc}>
            {currentPhase === "Ovulation"
              ? "Your estrogen and luteinizing hormone (LH) peak around this time. Energy, focus, and social engagement are at their highest."
              : currentPhase === "Menstruation"
              ? "Your hormone levels are at their lowest baseline. Rest, warm hydration, and gentle stretching are strongly encouraged."
              : currentPhase === "Fertile Window"
              ? "Follicles are maturing rapidly. Great time for creative tasks, strength training, and collaborative activities."
              : "Progesterone is increasing. Focus on consistent sleep routines, magnesium-rich foods, and stress reduction."}
          </Text>

          <View style={s.tipBox}>
            <View style={s.tipIconWrap}>
              <Ionicons name="restaurant-outline" size={18} color="#f472b6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tipHeading}>Recommended Nutrition</Text>
              <Text style={s.tipBody}>
                {currentPhase === "Menstruation"
                  ? "Iron-rich foods like spinach, lentils, beetroot, and plenty of warm herbal tea."
                  : "Leafy greens, berries, avocados, seeds (pumpkin/flax), and lean proteins."}
              </Text>
            </View>
          </View>

          <View style={s.tipBox}>
            <View style={s.tipIconWrap}>
              <Ionicons name="fitness-outline" size={18} color="#f472b6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.tipHeading}>Movement & Workouts</Text>
              <Text style={s.tipBody}>
                {currentPhase === "Menstruation"
                  ? "Gentle yoga, slow walks, and restorative stretching."
                  : "HIIT, resistance training, running, and athletic workouts."}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 7. Cycle History ────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Cycle History</Text>
          <Text style={s.cardSub}>
            Average cycle: {config.cycleLength} days · Average period: {config.periodLength} days
          </Text>

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

      {/* ── SETTINGS MODAL ────────────────────────────────────── */}
      <Modal visible={settingsModal} transparent animationType="fade" onRequestClose={() => setSettingsModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setSettingsModal(false)}>
          <Pressable style={s.settingsSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.settingsTitle}>Cycle Configuration</Text>
            <Text style={s.settingsSub}>Adjust your cycle and period parameters</Text>

            <Text style={s.settingInputLabel}>Average Cycle Length (Days)</Text>
            <TextInput
              style={s.settingInput}
              keyboardType="number-pad"
              value={tempCycleLength}
              onChangeText={setTempCycleLength}
              placeholder="e.g. 28"
              placeholderTextColor="#64748b"
            />

            <Text style={s.settingInputLabel}>Average Period Length (Days)</Text>
            <TextInput
              style={s.settingInput}
              keyboardType="number-pad"
              value={tempPeriodLength}
              onChangeText={setTempPeriodLength}
              placeholder="e.g. 5"
              placeholderTextColor="#64748b"
            />

            <Pressable style={s.saveSettingsBtn} onPress={handleSaveSettings}>
              <Text style={s.saveSettingsBtnText}>Save Configuration</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020813" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Hero
  heroCard: {
    borderRadius: 28,
    padding: 22,
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
    marginBottom: 16,
  },
  phaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.24)",
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
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
  },

  // Dial
  cycleDialWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  cycleDialRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  cycleDialRingInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialDayNum: {
    fontSize: 19,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 2,
  },
  dialPhaseLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },

  // Forecast
  forecastBox: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.24)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  forecastCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  forecastLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
    fontWeight: "600",
  },
  forecastValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  forecastValueHighlight: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fde047",
  },
  forecastDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 10,
  },

  // Generic Card
  card: {
    backgroundColor: "#16181e",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 14,
  },
  todayPillBtn: {
    backgroundColor: "rgba(233,30,99,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(233,30,99,0.4)",
  },
  todayPillBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f472b6",
  },

  // Timeline Strip
  timelineScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  dayPill: {
    width: 52,
    paddingVertical: 12,
    borderRadius: 16,
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
  dayPillToday: {
    borderColor: "rgba(244,63,94,0.6)",
    backgroundColor: "rgba(244,63,94,0.15)",
  },
  dayPillDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    marginBottom: 2,
  },
  dayPillNum: {
    fontSize: 16,
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
    gap: 14,
    marginTop: 14,
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
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },

  // Flow Row
  flowRow: {
    flexDirection: "row",
    gap: 6,
  },
  flowBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#20232b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  chipActive: {
    backgroundColor: "#be185d",
    borderColor: "#f472b6",
  },
  chipText: {
    fontSize: 12,
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
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  moodCard: {
    width: "31%",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#20232b",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },
  moodCardActive: {
    backgroundColor: "rgba(233,30,99,0.25)",
    borderColor: "#ec4899",
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  moodLabelActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  notesInput: {
    backgroundColor: "#20232b",
    borderRadius: 14,
    padding: 12,
    color: "#ffffff",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    height: 60,
    textAlignVertical: "top",
    marginBottom: 12,
  },

  saveLogBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveLogBtnText: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: "700",
    color: "#f472b6",
  },
  insightDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
    marginBottom: 12,
  },
  tipBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#20232b",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(244,114,182,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  tipBody: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 16,
  },

  // History
  historyList: {
    marginTop: 2,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  historyMonth: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  historySub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  historyBadge: {
    alignItems: "flex-end",
  },
  historyLength: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f472b6",
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },

  // Settings Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  settingsSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  settingsTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 4 },
  settingsSub: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 20 },
  settingInputLabel: { fontSize: 13, fontWeight: "700", color: "#cbd5e1", marginBottom: 6 },
  settingInput: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 14,
  },
  saveSettingsBtn: {
    backgroundColor: "#e11d48",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveSettingsBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});
