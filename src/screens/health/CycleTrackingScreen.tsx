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
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
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

interface QuickLogCategory {
  id: string;
  label: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  iconBg: string;
}

const LOG_CATEGORIES: QuickLogCategory[] = [
  { id: "flow", label: "Flow", iconName: "water", color: "#f43f5e", iconBg: "rgba(244,63,94,0.15)" },
  { id: "symptoms", label: "Symptoms", iconName: "emoticon-sick-outline", color: "#a855f7", iconBg: "rgba(168,85,247,0.15)" },
  { id: "mood", label: "Mood", iconName: "emoticon-happy-outline", color: "#38bdf8", iconBg: "rgba(56,189,248,0.15)" },
  { id: "energy", label: "Energy", iconName: "lightning-bolt", color: "#c084fc", iconBg: "rgba(192,132,252,0.15)" },
  { id: "mucus", label: "Mucus", iconName: "waves", color: "#2dd4bf", iconBg: "rgba(45,212,191,0.15)" },
  { id: "temperature", label: "Temperature", iconName: "thermometer", color: "#94a3b8", iconBg: "rgba(148,163,184,0.15)" },
  { id: "medication", label: "Medication", iconName: "pill", color: "#60a5fa", iconBg: "rgba(96,165,250,0.15)" },
];

const FLOW_CHOICES = ["none", "spotting", "light", "medium", "heavy"];
const SYMPTOM_CHOICES = ["Cramps", "Headache", "Bloating", "Fatigue", "Backache", "Tender Breasts", "Acne", "Cravings", "Nausea", "Insomnia"];
const MOOD_CHOICES = [
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "sensitive", label: "Sensitive", emoji: "🥺" },
  { id: "irritable", label: "Irritable", emoji: "😤" },
  { id: "sad", label: "Low", emoji: "😔" },
];

export default function CycleTrackingScreen({ navigation }: Props) {
  const [config, setConfig] = useState<CycleConfig>({
    cycleLength: 28,
    periodLength: 5,
    lutealLength: 14,
    lastPeriodStart: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0],
  });

  const [allLogs, setAllLogs] = useState<Record<string, CycleDayLog>>({});
  const [selectedDayNumber, setSelectedDayNumber] = useState(18); // default to Sep 18 (Today)
  const [selectedMonth, setSelectedMonth] = useState({ month: 8, year: 2026 }); // September 2026

  // Active Logging Dialog
  const [activeLogModal, setActiveLogModal] = useState<string | null>(null);

  // Today's log items for currently selected calendar day
  const [currentLog, setCurrentLog] = useState<{
    flow: string;
    symptoms: string[];
    mood: string;
    energy: string;
    mucus: string;
    temperature: string;
    medication: string;
    notes: string;
  }>({
    flow: "none",
    symptoms: ["Bloating"],
    mood: "energetic",
    energy: "High",
    mucus: "Watery",
    temperature: "98.4 °F",
    medication: "None",
    notes: "",
  });

  // Settings modal
  const [settingsModal, setSettingsModal] = useState(false);
  const [tempCycleLength, setTempCycleLength] = useState("28");
  const [tempPeriodLength, setTempPeriodLength] = useState("5");

  // Load persistent configuration and logs
  const loadData = useCallback(async () => {
    const [cfg, logs] = await Promise.all([getCycleConfig(), getCycleLogs()]);
    setConfig(cfg);
    setTempCycleLength(String(cfg.cycleLength));
    setTempPeriodLength(String(cfg.periodLength));
    setAllLogs(logs);

    const dateKey = `2026-09-${String(selectedDayNumber).padStart(2, "0")}`;
    if (logs[dateKey]) {
      const entry = logs[dateKey];
      setCurrentLog({
        flow: entry.flow || "none",
        symptoms: entry.symptoms || [],
        mood: entry.mood || "energetic",
        energy: "Normal",
        mucus: "Clear",
        temperature: "98.4 °F",
        medication: "None",
        notes: entry.notes || "",
      });
    }
  }, [selectedDayNumber]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectCalendarDay = (day: number) => {
    setSelectedDayNumber(day);
    const dateKey = `2026-09-${String(day).padStart(2, "0")}`;
    if (allLogs[dateKey]) {
      const entry = allLogs[dateKey];
      setCurrentLog({
        flow: entry.flow || "none",
        symptoms: entry.symptoms || [],
        mood: entry.mood || "calm",
        energy: "Normal",
        mucus: "Clear",
        temperature: "98.4 °F",
        medication: "None",
        notes: entry.notes || "",
      });
    }
  };

  const handleSaveLogForDay = async (updatedFields: Partial<typeof currentLog>) => {
    const nextLog = { ...currentLog, ...updatedFields };
    setCurrentLog(nextLog);

    const dateKey = `2026-09-${String(selectedDayNumber).padStart(2, "0")}`;
    const logItem: CycleDayLog = {
      date: dateKey,
      cycleDay: ((selectedDayNumber - 4 + 28) % 28) + 1,
      flow: nextLog.flow as any,
      symptoms: nextLog.symptoms,
      mood: nextLog.mood,
      notes: nextLog.notes,
      updatedAt: Date.now(),
    };

    await saveCycleDayLog(logItem);
    setAllLogs((prev) => ({ ...prev, [dateKey]: logItem }));
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

    const updated = { ...config, cycleLength: cLen, periodLength: pLen };
    await saveCycleConfig(updated);
    setConfig(updated);
    setSettingsModal(false);
    Alert.alert("Settings Updated", "Your cycle length and period parameters have been updated.");
  };

  // Calendar Day classification
  // Month: September 2026 starts on Tuesday (day index 1 for Mon=0)
  // Days 1..5: Logged Period
  // Days 8, 9: Predicted Period
  // Days 14, 15, 16, 21..26: Fertile Window
  // Day 18: Today
  const isPeriodLogged = (d: number) => [1, 2, 3, 4, 5].includes(d);
  const isPeriodPredicted = (d: number) => [8, 9].includes(d);
  const isFertile = (d: number) => [14, 15, 16, 21, 22, 23, 24, 25, 26].includes(d);
  const isToday = (d: number) => d === 18;

  // Render 35 cells for September 2026 (Aug 31 is offset 0)
  const calendarDays: Array<{ dayNum: number | string; inMonth: boolean }> = [
    { dayNum: 31, inMonth: false },
    ...Array.from({ length: 30 }, (_, i) => ({ dayNum: i + 1, inMonth: true })),
    { dayNum: 1, inMonth: false },
    { dayNum: 2, inMonth: false },
    { dayNum: 3, inMonth: false },
    { dayNum: 4, inMonth: false },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#07090e" />

      {/* ── Top Header ────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>

        <View style={s.headerTitleWrap}>
          <Text style={s.headerTitle}>Cycle Tracking</Text>
          <Text style={s.headerSubtitle}>Your cycle  •  Your health  •  Your way</Text>
        </View>

        <Pressable style={s.iconBtn} onPress={() => setSettingsModal(true)}>
          <Ionicons name="settings-outline" size={21} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── 1. Top Hero Cycle Status Card ───────────────────── */}
        <LinearGradient
          colors={["#2a1435", "#1c0d29", "#13091e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          {/* Subtle floral silhouette on right */}
          <View style={s.foliageGraphicWrap}>
            <MaterialCommunityIcons name="flower-tulip-outline" size={130} color="rgba(244, 114, 182, 0.12)" />
          </View>

          <View style={s.heroMainRow}>
            {/* Left Circular Ring */}
            <View style={s.dialWrap}>
              <Svg width={110} height={110} viewBox="0 0 110 110">
                {/* Background Ring Track */}
                <Circle
                  cx="55"
                  cy="55"
                  r="46"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Pink Arc (50% progress for Day 14 of 28) */}
                <Circle
                  cx="55"
                  cy="55"
                  r="46"
                  stroke="#f43f5e"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 46 * 0.52} ${2 * Math.PI * 46 * 0.48}`}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 55 55)"
                />
              </Svg>

              <View style={s.dialTextCenter}>
                <Text style={s.dialSmallLabel}>Cycle Day</Text>
                <Text style={s.dialDayNumber}>14</Text>
                <Text style={s.dialOfTotal}>of 28</Text>
              </View>
            </View>

            {/* Right Info Column */}
            <View style={s.heroRightCol}>
              {/* Today */}
              <View style={s.heroInfoRow}>
                <Ionicons name="calendar-outline" size={17} color="#a855f7" style={{ marginRight: 8 }} />
                <View>
                  <Text style={s.heroInfoLabel}>Today</Text>
                  <Text style={s.heroInfoVal}>Fri, Sep 18</Text>
                </View>
              </View>

              <View style={s.heroDivider} />

              {/* Next Period */}
              <View style={s.heroInfoRow}>
                <Ionicons name="water" size={17} color="#f43f5e" style={{ marginRight: 8 }} />
                <View>
                  <Text style={s.heroInfoLabel}>Next Period</Text>
                  <Text style={s.heroInfoVal}>Oct 2  •  in 14 days</Text>
                </View>
              </View>

              {/* Fertile Window */}
              <View style={[s.heroInfoRow, { marginTop: 6 }]}>
                <MaterialCommunityIcons name="sprout" size={17} color="#2dd4bf" style={{ marginRight: 8 }} />
                <View>
                  <Text style={s.heroInfoLabel}>Fertile Window</Text>
                  <Text style={s.heroInfoVal}>Sep 21 – Sep 26</Text>
                </View>
              </View>

              {/* Log Period Button */}
              <Pressable
                style={s.logPeriodBtn}
                onPress={() => setActiveLogModal("flow")}
              >
                <Ionicons name="pencil" size={14} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={s.logPeriodBtnText}>Log Period</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* ── 2. Full Month Calendar Card ─────────────────────── */}
        <View style={s.calendarCard}>
          <View style={s.calHeaderRow}>
            <Text style={s.calMonthTitle}>September 2026</Text>
            <View style={s.calNavArrows}>
              <Pressable style={s.calArrowBtn} onPress={() => Alert.alert("Calendar", "Showing September 2026")}>
                <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.7)" />
              </Pressable>
              <Pressable style={s.calArrowBtn} onPress={() => Alert.alert("Calendar", "Showing September 2026")}>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>
          </View>

          {/* Days of week header */}
          <View style={s.calWeekdaysRow}>
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((w) => (
              <Text key={w} style={s.calWeekdayText}>{w}</Text>
            ))}
          </View>

          {/* Days 5x7 Grid */}
          <View style={s.calDaysGrid}>
            {calendarDays.map((item, idx) => {
              if (typeof item.dayNum === "string" || !item.inMonth) {
                return (
                  <View key={idx} style={s.calDayCell}>
                    <Text style={s.calDayMuted}>{item.dayNum}</Text>
                  </View>
                );
              }

              const d = item.dayNum as number;
              const isPeriod = isPeriodLogged(d);
              const isPred = isPeriodPredicted(d);
              const isFert = isFertile(d);
              const isCurrentDay = isToday(d);
              const isSelected = selectedDayNumber === d;

              return (
                <Pressable
                  key={idx}
                  onPress={() => handleSelectCalendarDay(d)}
                  style={[
                    s.calDayCell,
                    isPeriod && s.cellPeriod,
                    isPred && s.cellPredicted,
                    isFert && s.cellFertile,
                    isCurrentDay && s.cellToday,
                    isSelected && s.cellSelectedBorder,
                  ]}
                >
                  <Text
                    style={[
                      s.calDayText,
                      (isPeriod || isFert || isCurrentDay || isSelected) && s.calDayTextWhite,
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Calendar Legend */}
          <View style={s.calLegendRow}>
            <View style={s.legendItem}>
              <View style={s.dotPeriod} />
              <Text style={s.legendLabel}>Period (logged)</Text>
            </View>

            <View style={s.legendItem}>
              <View style={s.ringPredicted} />
              <Text style={s.legendLabel}>Predicted period</Text>
            </View>

            <View style={s.legendItem}>
              <View style={s.dotFertile} />
              <Text style={s.legendLabel}>Fertile window</Text>
            </View>

            <View style={s.legendItem}>
              <View style={s.ringToday} />
              <Text style={s.legendLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* ── 3. Today's Log Card ─────────────────────────────── */}
        <View style={s.logCard}>
          <Pressable
            style={s.logCardHeader}
            onPress={() => setActiveLogModal("flow")}
          >
            <View>
              <Text style={s.logCardTitle}>Today's Log</Text>
              <Text style={s.logCardSub}>How are you feeling today?</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
          </Pressable>

          {/* 7 Quick Log Icons Horizontal Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickLogScroll}>
            {LOG_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveLogModal(cat.id)}
                style={s.quickLogItem}
              >
                <View style={[s.quickLogIconBox, { backgroundColor: cat.iconBg }]}>
                  <MaterialCommunityIcons name={cat.iconName} size={22} color={cat.color} />
                </View>
                <Text style={s.quickLogLabel}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── 4. Cycle Summary Card ───────────────────────────── */}
        <View style={s.summaryCard}>
          <View style={s.summaryHeader}>
            <View style={s.summaryHeaderIconWrap}>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#a855f7" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.summaryTitle}>Cycle Summary</Text>
              <Text style={s.summarySub}>Your average cycle length and period</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
          </View>

          <View style={s.summaryMetricsRow}>
            {/* 28 days */}
            <View style={s.metricCol}>
              <Text style={[s.metricValue, { color: "#f43f5e" }]}>{config.cycleLength} days</Text>
              <Text style={s.metricLabel}>Average cycle</Text>
            </View>

            <View style={s.metricDivider} />

            {/* 5 days */}
            <View style={s.metricCol}>
              <Text style={[s.metricValue, { color: "#a855f7" }]}>{config.periodLength} days</Text>
              <Text style={s.metricLabel}>Average period</Text>
            </View>

            <View style={s.metricDivider} />

            {/* ±2 days */}
            <View style={s.metricCol}>
              <Text style={[s.metricValue, { color: "#2dd4bf" }]}>±2 days</Text>
              <Text style={s.metricLabel}>Variation</Text>
            </View>

            <View style={s.metricDivider} />

            {/* Mostly regular */}
            <View style={s.metricCol}>
              <Text style={[s.metricValue, { color: "#4ade80" }]}>Mostly regular</Text>
              <Text style={s.metricLabel}>Regularity</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── QUICK LOG MODAL ───────────────────────────────────── */}
      <Modal visible={activeLogModal !== null} transparent animationType="slide" onRequestClose={() => setActiveLogModal(null)}>
        <Pressable style={s.modalOverlay} onPress={() => setActiveLogModal(null)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>
              {activeLogModal === "flow"
                ? "Menstrual Flow"
                : activeLogModal === "symptoms"
                ? "Daily Symptoms"
                : activeLogModal === "mood"
                ? "Mood Check-in"
                : `Log ${activeLogModal?.toUpperCase()}`}
            </Text>
            <Text style={s.modalSub}>Recording for Sep {selectedDayNumber}, 2026</Text>

            {/* Flow Options */}
            {activeLogModal === "flow" && (
              <View style={s.optionsWrap}>
                {FLOW_CHOICES.map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      handleSaveLogForDay({ flow: opt });
                      setActiveLogModal(null);
                      Alert.alert("Flow Logged", `Set flow to ${opt.toUpperCase()}`);
                    }}
                    style={[s.optionPill, currentLog.flow === opt && s.optionPillActive]}
                  >
                    <Ionicons name="water" size={16} color={currentLog.flow === opt ? "#ffffff" : "#f43f5e"} />
                    <Text style={[s.optionText, currentLog.flow === opt && s.optionTextActive]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Symptoms Options */}
            {activeLogModal === "symptoms" && (
              <View style={s.optionsWrap}>
                {SYMPTOM_CHOICES.map((sym) => {
                  const active = currentLog.symptoms.includes(sym);
                  return (
                    <Pressable
                      key={sym}
                      onPress={() => {
                        const updated = active
                          ? currentLog.symptoms.filter((s) => s !== sym)
                          : [...currentLog.symptoms, sym];
                        handleSaveLogForDay({ symptoms: updated });
                      }}
                      style={[s.optionPill, active && s.optionPillActivePurple]}
                    >
                      <Ionicons
                        name={active ? "checkmark-circle" : "add-circle-outline"}
                        size={16}
                        color={active ? "#ffffff" : "#a855f7"}
                      />
                      <Text style={[s.optionText, active && s.optionTextActive]}>{sym}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Mood Options */}
            {activeLogModal === "mood" && (
              <View style={s.optionsWrap}>
                {MOOD_CHOICES.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      handleSaveLogForDay({ mood: m.id });
                      setActiveLogModal(null);
                      Alert.alert("Mood Recorded", `Feeling ${m.label} today.`);
                    }}
                    style={[s.optionPill, currentLog.mood === m.id && s.optionPillActiveBlue]}
                  >
                    <Text style={{ fontSize: 16 }}>{m.emoji}</Text>
                    <Text style={[s.optionText, currentLog.mood === m.id && s.optionTextActive]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Other categories */}
            {activeLogModal !== "flow" && activeLogModal !== "symptoms" && activeLogModal !== "mood" && (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 12 }}>
                  Log {activeLogModal} notes or values for today:
                </Text>
                <TextInput
                  style={s.settingsInput}
                  placeholder={`Enter ${activeLogModal} details...`}
                  placeholderTextColor="#64748b"
                  defaultValue={
                    activeLogModal === "energy"
                      ? currentLog.energy
                      : activeLogModal === "temperature"
                      ? currentLog.temperature
                      : activeLogModal === "medication"
                      ? currentLog.medication
                      : currentLog.mucus
                  }
                  onChangeText={(val) => handleSaveLogForDay({ [activeLogModal!]: val } as any)}
                />
                <Pressable style={s.saveModalCloseBtn} onPress={() => setActiveLogModal(null)}>
                  <Text style={s.saveModalCloseBtnText}>Done</Text>
                </Pressable>
              </View>
            )}

            <Pressable style={s.closeSheetBtn} onPress={() => setActiveLogModal(null)}>
              <Text style={s.closeSheetText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── SETTINGS MODAL ────────────────────────────────────── */}
      <Modal visible={settingsModal} transparent animationType="fade" onRequestClose={() => setSettingsModal(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setSettingsModal(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Cycle Configuration</Text>
            <Text style={s.modalSub}>Adjust your personal cycle parameters</Text>

            <Text style={s.inputLabel}>Average Cycle Length (Days)</Text>
            <TextInput
              style={s.settingsInput}
              keyboardType="number-pad"
              value={tempCycleLength}
              onChangeText={setTempCycleLength}
              placeholder="28"
              placeholderTextColor="#64748b"
            />

            <Text style={s.inputLabel}>Average Period Length (Days)</Text>
            <TextInput
              style={s.settingsInput}
              keyboardType="number-pad"
              value={tempPeriodLength}
              onChangeText={setTempPeriodLength}
              placeholder="5"
              placeholderTextColor="#64748b"
            />

            <Pressable style={s.saveSettingsBtn} onPress={handleSaveSettings}>
              <Text style={s.saveSettingsBtnText}>Save Settings</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#07090e",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
  },

  // 1. Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  foliageGraphicWrap: {
    position: "absolute",
    right: -20,
    bottom: -10,
    opacity: 0.8,
  },
  heroMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dialWrap: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dialTextCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  dialSmallLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  dialDayNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 32,
  },
  dialOfTotal: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  heroRightCol: {
    flex: 1,
    marginLeft: 18,
  },
  heroInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroInfoLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
  heroInfoVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 6,
  },
  logPeriodBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f472b6",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  logPeriodBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },

  // 2. Calendar Card
  calendarCard: {
    backgroundColor: "#11141f",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  calHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calMonthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  calNavArrows: {
    flexDirection: "row",
    gap: 8,
  },
  calArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  calWeekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  calWeekdayText: {
    width: (SW - 64) / 7,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.45)",
  },
  calDaysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: 14,
  },
  calDayCell: {
    width: (SW - 64 - 24) / 7,
    height: 34,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  calDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  calDayTextWhite: {
    color: "#ffffff",
    fontWeight: "800",
  },
  calDayMuted: {
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
  },

  // Cell Styles Matching Image 2
  cellPeriod: {
    backgroundColor: "#e11d48", // solid rose pill
  },
  cellPredicted: {
    borderWidth: 1.5,
    borderColor: "#f43f5e",
    borderStyle: "dashed",
    backgroundColor: "rgba(244,63,94,0.08)",
  },
  cellFertile: {
    backgroundColor: "#0d9488", // teal/green pill
  },
  cellToday: {
    borderWidth: 2,
    borderColor: "#a855f7",
    backgroundColor: "rgba(168,85,247,0.2)",
  },
  cellSelectedBorder: {
    shadowColor: "#f43f5e",
    shadowRadius: 6,
    shadowOpacity: 0.6,
  },

  // Calendar Legend
  calLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dotPeriod: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f43f5e",
  },
  ringPredicted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f43f5e",
  },
  dotFertile: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0d9488",
  },
  ringToday: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#a855f7",
  },
  legendLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },

  // 3. Today's Log Card
  logCard: {
    backgroundColor: "#11141f",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  logCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  logCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  logCardSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },
  quickLogScroll: {
    gap: 12,
    paddingVertical: 2,
  },
  quickLogItem: {
    alignItems: "center",
    width: 58,
  },
  quickLogIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  quickLogLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },

  // 4. Cycle Summary Card
  summaryCard: {
    backgroundColor: "#11141f",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  summaryHeaderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  summarySub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  summaryMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  metricCol: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    textAlign: "center",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 2 },
  modalSub: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 16 },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionPillActive: {
    backgroundColor: "#e11d48",
    borderColor: "#f43f5e",
  },
  optionPillActivePurple: {
    backgroundColor: "#7e22ce",
    borderColor: "#a855f7",
  },
  optionPillActiveBlue: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  optionTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  closeSheetBtn: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 6,
  },
  closeSheetText: { fontSize: 14, fontWeight: "700", color: "#94a3b8" },

  inputLabel: { fontSize: 12, fontWeight: "700", color: "#cbd5e1", marginBottom: 6 },
  settingsInput: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  saveSettingsBtn: {
    backgroundColor: "#ec4899",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 6,
  },
  saveSettingsBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  saveModalCloseBtn: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 6,
  },
  saveModalCloseBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});
