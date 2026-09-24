import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import Svg, { Line, Rect, Circle, Text as SvgText, G } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import {
  getSleepEntries,
  addSleepEntry,
  getTodayKey,
  SleepEntry,
} from "@/services/healthLogService";
import AddSleepRecordModal from "@/components/AddSleepRecordModal";

type Props = NativeStackScreenProps<RootStackParamList, "SleepDashboard">;

const { width: SW } = Dimensions.get("window");
const CARD_WIDTH = SW - 32;

export default function SleepDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = Today, -1 = Yesterday, etc.

  // Load sleep entries
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSleepEntries(user.uid);
      setEntries(data);
    } catch (e) {
      console.warn("Failed to load sleep entries:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Derive last 7 days numbers (e.g. 5, 6, 7, 8, 9, 10, 11)
  const last7Days = useMemo(() => {
    const list: { dayNum: number; dateKey: string; isTargetMet: boolean; hasSleep: boolean; durationHours: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i + selectedDayOffset);
      const dayNum = d.getDate();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const entry = entries.find((e) => e.date === dateKey);
      const hasSleep = !!entry;
      const durationHours = entry ? entry.durationMins / 60 : 0;
      const isTargetMet = durationHours >= 7;
      list.push({ dayNum, dateKey, isTargetMet, hasSleep, durationHours });
    }
    return list;
  }, [entries, selectedDayOffset]);

  // Today's entry or latest entry
  const todayKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [selectedDayOffset]);

  const currentDayEntry = entries.find((e) => e.date === todayKey) || entries[0] || null;

  const currentDurationHours = currentDayEntry
    ? Math.floor(currentDayEntry.durationMins / 60)
    : 6;
  const currentDurationMins = currentDayEntry
    ? currentDayEntry.durationMins % 60
    : 0;

  const displayDuration = currentDayEntry
    ? `${currentDurationHours} h${currentDurationMins > 0 ? ` ${currentDurationMins} m` : ""}`
    : "6 h";

  const displayInterval = currentDayEntry
    ? `${currentDayEntry.bedtime} - ${currentDayEntry.wakeTime}`
    : "12:20 am - 6:20 am";

  const targetsMetCount = last7Days.filter((d) => d.isTargetMet).length;

  const handleSaveSleep = async (
    bedH: number,
    bedM: number,
    wakeH: number,
    wakeM: number
  ) => {
    if (!user) return;
    const btTotal = bedH * 60 + bedM;
    const wkTotal = wakeH * 60 + wakeM;
    const durationMins =
      wkTotal >= btTotal ? wkTotal - btTotal : 1440 - btTotal + wkTotal;

    const ampmBed = bedH >= 12 ? "pm" : "am";
    const hBed = bedH % 12 || 12;
    const bedtimeStr = `${hBed}:${String(bedM).padStart(2, "0")} ${ampmBed}`;

    const ampmWake = wakeH >= 12 ? "pm" : "am";
    const hWake = wakeH % 12 || 12;
    const wakeStr = `${hWake}:${String(wakeM).padStart(2, "0")} ${ampmWake}`;

    await addSleepEntry(user.uid, {
      date: todayKey,
      bedtime: bedtimeStr,
      wakeTime: wakeStr,
      durationMins,
      score: durationMins >= 420 ? 88 : 72,
    });

    setShowAddModal(false);
    await loadData();
  };

  const dayLabelText =
    selectedDayOffset === 0
      ? "Today"
      : selectedDayOffset === -1
      ? "Yesterday"
      : `${Math.abs(selectedDayOffset)} days ago`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBackBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Sleep</Text>

        <View style={s.headerRight}>
          {/* Analytics Bar Chart Icon */}
          <Pressable
            onPress={() => navigation.navigate("SleepTrends" as any)}
            style={s.headerIconBtn}
            accessibilityLabel="Sleep Analytics and Trends"
          >
            <View style={s.barChartIcon}>
              <View style={[s.barChartCol, { height: 10 }]} />
              <View style={[s.barChartCol, { height: 18 }]} />
              <View style={[s.barChartCol, { height: 14 }]} />
            </View>
          </Pressable>

          {/* 3-dots menu */}
          <Pressable
            onPress={() =>
              Alert.alert("Sleep Settings", "Sync, targets, and notifications")
            }
            style={s.headerIconBtn}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Date Navigation Pill: < [ Today ] > */}
      <View style={s.dateNavWrap}>
        <Pressable
          onPress={() => setSelectedDayOffset((prev) => prev - 1)}
          style={s.dateNavArrow}
          accessibilityLabel="Previous Day"
        >
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View style={s.dateNavPill}>
          <Text style={s.dateNavText}>{dayLabelText}</Text>
        </View>

        <Pressable
          onPress={() => setSelectedDayOffset((prev) => Math.min(0, prev + 1))}
          style={[
            s.dateNavArrow,
            selectedDayOffset === 0 && { opacity: 0.3 },
          ]}
          disabled={selectedDayOffset === 0}
          accessibilityLabel="Next Day"
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="rgba(255,255,255,0.7)"
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {/* Card 1: Sleep time */}
          <Animated.View entering={FadeInDown.duration(300)} style={s.card}>
            <Text style={s.cardTitle}>Sleep time</Text>
            <Text style={s.sleepTimeBigVal}>{displayDuration}</Text>
            <Text style={s.sleepTimeInterval}>{displayInterval}</Text>
          </Animated.View>

          {/* Card 2: Sleep time over last 7 days */}
          <Animated.View
            entering={FadeInDown.delay(80).duration(300)}
            style={s.card}
          >
            <Pressable
              onPress={() => navigation.navigate("SleepTrends" as any)}
              style={s.cardHeaderRow}
            >
              <Text style={s.cardTitle}>Sleep time over last 7 days</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
            </Pressable>

            {/* 7-Day Chart with Dotted 6h Line */}
            <View style={s.sevenDayChartWrap}>
              <Svg width={CARD_WIDTH - 40} height={140}>
                {/* Horizontal Dotted Guideline at 6h */}
                <Line
                  x1={10}
                  y1={50}
                  x2={CARD_WIDTH - 85}
                  y2={50}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={1.5}
                  strokeDasharray="2, 4"
                />
                <SvgText
                  x={CARD_WIDTH - 65}
                  y={54}
                  fontSize={13}
                  fill="rgba(255,255,255,0.7)"
                  fontWeight="500"
                >
                  6h
                </SvgText>

                {/* Bars and Day Labels */}
                {last7Days.map((item, idx) => {
                  const colW = (CARD_WIDTH - 110) / 7;
                  const cx = 20 + idx * colW;
                  const isLatestDay = idx === 6;
                  return (
                    <G key={item.dateKey}>
                      {/* Purple rounded bar on day 11 / recorded day */}
                      {isLatestDay && (
                        <Rect
                          x={cx - 6}
                          y={50}
                          width={12}
                          height={50}
                          rx={6}
                          fill="#7c3aed"
                        />
                      )}
                      <SvgText
                        x={cx}
                        y={122}
                        textAnchor="middle"
                        fontSize={12}
                        fill="rgba(255,255,255,0.65)"
                        fontWeight={isLatestDay ? "700" : "500"}
                      >
                        {item.dayNum}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </View>
          </Animated.View>

          {/* Card 3: Sleep consistency */}
          <Animated.View
            entering={FadeInDown.delay(160).duration(300)}
            style={s.card}
          >
            <Pressable
              onPress={() => navigation.navigate("SleepTrends" as any)}
              style={s.cardHeaderRow}
            >
              <Text style={s.cardTitle}>Sleep consistency</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
            </Pressable>
            <Text style={s.cardSubTitle}>
              Target achieved {targetsMetCount} out of 7 days
            </Text>

            {/* Consistency Dots Grid */}
            <View style={s.consistencyGridWrap}>
              <Svg width={CARD_WIDTH - 40} height={100}>
                {/* Bed icon row */}
                <G>
                  <SvgText
                    x={20}
                    y={28}
                    fontSize={16}
                    fill="rgba(255,255,255,0.7)"
                  >
                    🛏
                  </SvgText>
                  {last7Days.map((item, idx) => {
                    const colW = (CARD_WIDTH - 120) / 7;
                    const cx = 55 + idx * colW;
                    return (
                      <Circle
                        key={`bed-${item.dateKey}`}
                        cx={cx}
                        cy={24}
                        r={4.5}
                        fill={item.isTargetMet ? "#7c3aed" : "rgba(255,255,255,0.18)"}
                      />
                    );
                  })}
                </G>

                {/* Alarm icon row */}
                <G>
                  <SvgText
                    x={20}
                    y={64}
                    fontSize={16}
                    fill="rgba(255,255,255,0.7)"
                  >
                    ⏰
                  </SvgText>
                  {last7Days.map((item, idx) => {
                    const colW = (CARD_WIDTH - 120) / 7;
                    const cx = 55 + idx * colW;
                    return (
                      <Circle
                        key={`alarm-${item.dateKey}`}
                        cx={cx}
                        cy={60}
                        r={4.5}
                        fill={item.isTargetMet ? "#7c3aed" : "rgba(255,255,255,0.18)"}
                      />
                    );
                  })}
                </G>

                {/* Day labels below */}
                {last7Days.map((item, idx) => {
                  const colW = (CARD_WIDTH - 120) / 7;
                  const cx = 55 + idx * colW;
                  return (
                    <SvgText
                      key={`day-${item.dateKey}`}
                      x={cx}
                      y={92}
                      textAnchor="middle"
                      fontSize={12}
                      fill="rgba(255,255,255,0.65)"
                      fontWeight="500"
                    >
                      {item.dayNum}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>
          </Animated.View>

          {/* Bottom "Add sleep record" Button */}
          <View style={s.bottomBtnWrap}>
            <Pressable
              style={s.addRecordBtn}
              onPress={() => setShowAddModal(true)}
              accessibilityLabel="Add sleep record"
            >
              <Text style={s.addRecordBtnText}>Add sleep record</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Interactive 24-Hour Circular Dial Modal */}
      <AddSleepRecordModal
        visible={showAddModal}
        initialBedtimeHour={11}
        initialBedtimeMinute={0}
        initialWakeHour={7}
        initialWakeMinute={0}
        onSave={handleSaveSleep}
        onCancel={() => setShowAddModal(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerBackBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconBtn: {
    padding: 4,
  },
  barChartIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 20,
    paddingBottom: 1,
  },
  barChartCol: {
    width: 3.5,
    backgroundColor: "#ffffff",
    borderRadius: 1.5,
  },
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 16,
  },
  dateNavArrow: {
    padding: 8,
  },
  dateNavPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 24,
  },
  dateNavText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#16161c",
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 6,
  },
  cardSubTitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sleepTimeBigVal: {
    fontSize: 44,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 4,
  },
  sleepTimeInterval: {
    fontSize: 13.5,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  sevenDayChartWrap: {
    marginTop: 10,
    alignItems: "center",
  },
  consistencyGridWrap: {
    marginTop: 6,
    alignItems: "center",
  },
  bottomBtnWrap: {
    alignItems: "center",
    marginTop: 12,
  },
  addRecordBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
    width: "75%",
    alignItems: "center",
  },
  addRecordBtnText: {
    color: "#ffffff",
    fontSize: 15.5,
    fontWeight: "600",
  },
});
