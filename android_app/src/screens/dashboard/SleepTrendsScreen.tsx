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
} from "react-native";
import Svg, { Circle, Rect, Line, G, Text as SvgText, Path } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import {
  getSleepEntries,
  addSleepEntry,
  getTodayKey,
  SleepEntry,
} from "@/services/healthLogService";
import AddSleepRecordModal from "@/components/AddSleepRecordModal";

type Props = NativeStackScreenProps<RootStackParamList, "SleepTrends">;

const { width: SW } = Dimensions.get("window");
const CARD_WIDTH = SW - 32;

type PeriodTab = "Hours" | "Days" | "Weeks" | "Months";
const PERIOD_TABS: PeriodTab[] = ["Hours", "Days", "Weeks", "Months"];

export default function SleepTrendsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PeriodTab>("Hours");
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [monthMetric, setMonthMetric] = useState<"score" | "time">("time");

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getSleepEntries(user.uid);
      setEntries(data);
    } catch (e) {
      console.warn("Error loading sleep trends data:", e);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const latestEntry = entries[0];
  const durationHours = latestEntry
    ? Math.floor(latestEntry.durationMins / 60)
    : 6;
  const durationMinutes = latestEntry
    ? latestEntry.durationMins % 60
    : 0;

  const handleSaveSleep = async (
    bedH: number,
    bedM: number,
    wakeH: number,
    wakeM: number
  ) => {
    if (!user) return;
    const btTotal = bedH * 60 + bedM;
    const wkTotal = wakeH * 60 + wakeM;
    const durationMins = wkTotal >= btTotal ? wkTotal - btTotal : 1440 - btTotal + wkTotal;

    const ampmBed = bedH >= 12 ? "pm" : "am";
    const hBed = bedH % 12 || 12;
    const bedtimeStr = `${hBed}:${String(bedM).padStart(2, "0")} ${ampmBed}`;

    const ampmWake = wakeH >= 12 ? "pm" : "am";
    const hWake = wakeH % 12 || 12;
    const wakeStr = `${hWake}:${String(wakeM).padStart(2, "0")} ${ampmWake}`;

    await addSleepEntry(user.uid, {
      date: getTodayKey(),
      bedtime: bedtimeStr,
      wakeTime: wakeStr,
      durationMins,
      score: durationMins >= 420 ? 85 : 70,
    });

    setShowAddModal(false);
    await loadData();
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Sleep</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={s.headerIconBtn}
            accessibilityLabel="Add Sleep Record"
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Options", "Sleep settings and sync")}
            style={s.headerIconBtn}
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Segmented Period Tabs: Hours, Days, Weeks, Months */}
      <View style={s.periodTabsWrap}>
        {PERIOD_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.periodTab, isActive && s.periodTabActive]}
            >
              <Text
                style={[
                  s.periodTabText,
                  isActive && s.periodTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Main Analytics Card */}
        <Animated.View entering={FadeInDown.duration(300)} style={s.mainCard}>
          {/* Card Top Row: Date, Metric, Illustration */}
          <View style={s.cardTopRow}>
            <View style={s.cardTopLeft}>
              {/* Date with chevron */}
              <Pressable style={s.dateSelectorRow}>
                <Text style={s.dateSelectorText}>
                  {activeTab === "Hours" && "Tue, 1 Sept"}
                  {activeTab === "Days" && "26 Aug–1 Sept"}
                  {activeTab === "Weeks" && "12 Jul–5 Sept"}
                  {activeTab === "Months" && "Oct 2025–Sept 2026"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.7)"
                  style={{ marginLeft: 2, marginTop: 1 }}
                />
              </Pressable>

              {/* Month Tab Sub-Selectors (Score / Time) */}
              {activeTab === "Months" ? (
                <View style={s.monthPillsRow}>
                  <Pressable
                    onPress={() => setMonthMetric("score")}
                    style={[
                      s.monthPill,
                      monthMetric === "score"
                        ? s.monthPillWhite
                        : s.monthPillDark,
                    ]}
                  >
                    <Text
                      style={[
                        s.monthPillText,
                        monthMetric === "score"
                          ? s.monthPillTextBlack
                          : s.monthPillTextDim,
                      ]}
                    >
                      Sleep score
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setMonthMetric("time")}
                    style={[
                      s.monthPill,
                      monthMetric === "time"
                        ? s.monthPillWhite
                        : s.monthPillDark,
                    ]}
                  >
                    <Text
                      style={[
                        s.monthPillText,
                        monthMetric === "time"
                          ? s.monthPillTextBlack
                          : s.monthPillTextDim,
                      ]}
                    >
                      Sleep time
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={s.badgePill}>
                  <Text style={s.badgePillText}>Sleep time</Text>
                </View>
              )}

              {/* Metric Value */}
              {activeTab === "Months" && (
                <View style={[s.badgePill, { alignSelf: "flex-start", marginTop: 4 }]}>
                  <Text style={s.badgePillText}>Sleep time</Text>
                </View>
              )}

              <View style={s.metricValRow}>
                {latestEntry || activeTab === "Months" ? (
                  <Text style={s.metricBigVal}>
                    {durationHours}{" "}
                    <Text style={s.metricUnit}>h</Text>
                    {durationMinutes > 0 && (
                      <>
                        {" "}
                        {durationMinutes} <Text style={s.metricUnit}>m</Text>
                      </>
                    )}
                  </Text>
                ) : (
                  <Text style={s.metricBigVal}>
                    -- <Text style={s.metricUnit}>h</Text> --{" "}
                    <Text style={s.metricUnit}>m</Text>
                  </Text>
                )}
              </View>

              {/* Bedtime / Wake time Averages in Months view */}
              {activeTab === "Months" && (
                <View style={s.monthAvgWrap}>
                  <Text style={s.monthAvgLine}>
                    Average bedtime{" "}
                    <Text style={s.monthAvgBold}>12:20 am</Text>
                  </Text>
                  <Text style={s.monthAvgLine}>
                    Average wake-up time{" "}
                    <Text style={s.monthAvgBold}>6:20 am</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Telescope Night Illustration Circle */}
            <View style={s.illustrationCircleWrap}>
              <LinearGradient
                colors={["#1e40af", "#2563eb", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.illustrationCircle}
              >
                {/* Stylized starry graphic */}
                <Svg width={68} height={68} viewBox="0 0 68 68">
                  <Circle cx={34} cy={34} r={33} fill="none" />
                  {/* Golden observatory dome / moon arc */}
                  <Path
                    d="M 40 18 A 16 16 0 0 1 60 44 L 40 44 Z"
                    fill="#f59e0b"
                    opacity={0.9}
                  />
                  {/* Observatory tower base */}
                  <Rect
                    x={20}
                    y={38}
                    width={32}
                    height={10}
                    rx={2}
                    fill="#38bdf8"
                  />
                  {/* Telescope tube */}
                  <Line
                    x1={28}
                    y1={38}
                    x2={44}
                    y2={22}
                    stroke="#ffffff"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  {/* Stars / sparkle dots */}
                  <Circle cx={24} cy={22} r={1.5} fill="#ffffff" />
                  <Circle cx={34} cy={14} r={1} fill="#ffffff" />
                  <Circle cx={16} cy={30} r={1.2} fill="#67e8f9" />
                  <Circle cx={52} cy={20} r={1.2} fill="#fef08a" />
                </Svg>
              </LinearGradient>
            </View>
          </View>

          {/* Dynamic Chart Area */}
          <View style={s.chartArea}>
            {activeTab === "Hours" && (
              <View style={s.hoursChartWrap}>
                <Svg width={CARD_WIDTH - 32} height={160}>
                  {/* Horizontal baseline */}
                  <Line
                    x1={10}
                    y1={130}
                    x2={CARD_WIDTH - 42}
                    y2={130}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />
                  {/* Baseline ticks at 12 am, 6 am, 12 pm, 6 pm */}
                  {[
                    { label: "12 am", frac: 0.08 },
                    { label: "6 am", frac: 0.36 },
                    { label: "12 pm", frac: 0.64 },
                    { label: "6 pm", frac: 0.92 },
                  ].map((tick) => {
                    const x = 10 + (CARD_WIDTH - 52) * tick.frac;
                    return (
                      <G key={tick.label}>
                        <Line
                          x1={x}
                          y1={125}
                          x2={x}
                          y2={135}
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth={1}
                        />
                        <SvgText
                          x={x}
                          y={150}
                          textAnchor="middle"
                          fontSize={12}
                          fill="rgba(255,255,255,0.6)"
                        >
                          {tick.label}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Sleep block bar if logged */}
                  {latestEntry && (
                    <Rect
                      x={10 + (CARD_WIDTH - 52) * 0.1}
                      y={40}
                      width={(CARD_WIDTH - 52) * 0.28}
                      height={75}
                      rx={8}
                      fill="#7c3aed"
                      opacity={0.9}
                    />
                  )}
                </Svg>

                {/* Compare data section */}
                <View style={s.compareSection}>
                  <Text style={s.compareTitle}>Compare data</Text>
                  <View style={s.comparePillsRow}>
                    <Pressable
                      style={s.comparePill}
                      onPress={() => Alert.alert("Blood oxygen", "Tracking active")}
                    >
                      <Ionicons
                        name="add-circle"
                        size={18}
                        color="rgba(255,255,255,0.6)"
                      />
                      <Text style={s.comparePillText}>Blood oxygen</Text>
                    </Pressable>
                    <Pressable
                      style={s.comparePill}
                      onPress={() =>
                        Alert.alert("Skin temperature", "Tracking active")
                      }
                    >
                      <Ionicons
                        name="add-circle"
                        size={18}
                        color="rgba(255,255,255,0.6)"
                      />
                      <Text style={s.comparePillText}>Skin temp</Text>
                    </Pressable>
                    <Pressable
                      style={s.comparePill}
                      onPress={() => Alert.alert("Snoring", "Tracking active")}
                    >
                      <Ionicons
                        name="add-circle"
                        size={18}
                        color="rgba(255,255,255,0.6)"
                      />
                      <Text style={s.comparePillText}>Snoring</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {activeTab === "Days" && (
              <View style={s.gridChartWrap}>
                <Svg width={CARD_WIDTH - 32} height={180}>
                  {/* Gridlines at 10, 7, 4 */}
                  {[
                    { label: "10", y: 25 },
                    { label: "7", y: 65 },
                    { label: "4", y: 105 },
                  ].map((gl) => (
                    <G key={gl.label}>
                      <Line
                        x1={10}
                        y1={gl.y}
                        x2={CARD_WIDTH - 65}
                        y2={gl.y}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={1}
                      />
                      <SvgText
                        x={CARD_WIDTH - 48}
                        y={gl.y + 4}
                        fontSize={12}
                        fill="rgba(255,255,255,0.5)"
                      >
                        {gl.label}
                      </SvgText>
                    </G>
                  ))}

                  {/* Baseline */}
                  <Line
                    x1={10}
                    y1={140}
                    x2={CARD_WIDTH - 65}
                    y2={140}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />

                  {/* 7 Days: 26, 27, 28, 29, 30 (Sunday/red), 31, 1/9 */}
                  {[
                    { label: "26", isSun: false },
                    { label: "27", isSun: false },
                    { label: "28", isSun: false },
                    { label: "29", isSun: false },
                    { label: "30", isSun: true }, // Sunday highlighted in red
                    { label: "31", isSun: false },
                    { label: "1/9", isSun: false, hasBar: true },
                  ].map((day, idx) => {
                    const colW = (CARD_WIDTH - 90) / 7;
                    const cx = 20 + idx * colW;
                    return (
                      <G key={day.label}>
                        {day.hasBar && (
                          <Rect
                            x={cx - 5}
                            y={75}
                            width={10}
                            height={65}
                            rx={5}
                            fill="#7c3aed"
                          />
                        )}
                        <SvgText
                          x={cx}
                          y={160}
                          textAnchor="middle"
                          fontSize={12}
                          fill={day.isSun ? "#ef4444" : "rgba(255,255,255,0.6)"}
                          fontWeight={day.isSun ? "700" : "500"}
                        >
                          {day.label}
                        </SvgText>
                      </G>
                    );
                  })}
                </Svg>
                {/* Zoom circle button */}
                <Pressable
                  style={s.zoomBtn}
                  onPress={() => Alert.alert("Zoom", "Adjust chart zoom level")}
                >
                  <Ionicons name="search" size={15} color="rgba(255,255,255,0.7)" />
                  <View style={s.zoomMinusIcon} />
                </Pressable>
              </View>
            )}

            {activeTab === "Weeks" && (
              <View style={s.gridChartWrap}>
                <Svg width={CARD_WIDTH - 32} height={180}>
                  {/* Gridlines at 10, 7, 4 */}
                  {[
                    { label: "10", y: 25 },
                    { label: "7", y: 65 },
                    { label: "4", y: 105 },
                  ].map((gl) => (
                    <G key={gl.label}>
                      <Line
                        x1={10}
                        y1={gl.y}
                        x2={CARD_WIDTH - 65}
                        y2={gl.y}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={1}
                      />
                      <SvgText
                        x={CARD_WIDTH - 48}
                        y={gl.y + 4}
                        fontSize={12}
                        fill="rgba(255,255,255,0.5)"
                      >
                        {gl.label}
                      </SvgText>
                    </G>
                  ))}

                  <Line
                    x1={10}
                    y1={140}
                    x2={CARD_WIDTH - 65}
                    y2={140}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />

                  {/* 8 Weekly date points */}
                  {["12", "19", "26", "8/2", "9", "16", "23", "30"].map(
                    (lbl, idx) => {
                      const colW = (CARD_WIDTH - 90) / 8;
                      const cx = 16 + idx * colW;
                      return (
                        <G key={lbl}>
                          {idx === 7 && (
                            <Rect
                              x={cx - 4}
                              y={75}
                              width={8}
                              height={65}
                              rx={4}
                              fill="#7c3aed"
                            />
                          )}
                          <SvgText
                            x={cx}
                            y={160}
                            textAnchor="middle"
                            fontSize={11}
                            fill="rgba(255,255,255,0.6)"
                          >
                            {lbl}
                          </SvgText>
                        </G>
                      );
                    }
                  )}
                </Svg>
                <Pressable
                  style={s.zoomBtn}
                  onPress={() => Alert.alert("Zoom", "Adjust chart zoom level")}
                >
                  <Ionicons name="search" size={15} color="rgba(255,255,255,0.7)" />
                  <View style={s.zoomMinusIcon} />
                </Pressable>
              </View>
            )}

            {activeTab === "Months" && (
              <View style={s.gridChartWrap}>
                <Svg width={CARD_WIDTH - 32} height={180}>
                  {[
                    { label: "10", y: 25 },
                    { label: "7", y: 65 },
                    { label: "4", y: 105 },
                  ].map((gl) => (
                    <G key={gl.label}>
                      <Line
                        x1={10}
                        y1={gl.y}
                        x2={CARD_WIDTH - 65}
                        y2={gl.y}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={1}
                      />
                      <SvgText
                        x={CARD_WIDTH - 48}
                        y={gl.y + 4}
                        fontSize={12}
                        fill="rgba(255,255,255,0.5)"
                      >
                        {gl.label}
                      </SvgText>
                    </G>
                  ))}

                  <Line
                    x1={10}
                    y1={140}
                    x2={CARD_WIDTH - 65}
                    y2={140}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={1}
                  />

                  {/* 6 Monthly points: Nov, Jan 2026, Mar, May, Jul, Sept */}
                  {[
                    { label: "Nov", hasBar: false },
                    { label: "Jan", sub: "2026", hasBar: false },
                    { label: "Mar", hasBar: false },
                    { label: "May", hasBar: false },
                    { label: "Jul", hasBar: false },
                    { label: "Sept", isCurrent: true, hasBar: true },
                  ].map((m, idx) => {
                    const colW = (CARD_WIDTH - 90) / 6;
                    const cx = 18 + idx * colW;
                    return (
                      <G key={m.label}>
                        {m.hasBar && (
                          <Rect
                            x={cx - 4.5}
                            y={75}
                            width={9}
                            height={65}
                            rx={4.5}
                            fill="#7c3aed"
                          />
                        )}
                        <SvgText
                          x={cx}
                          y={156}
                          textAnchor="middle"
                          fontSize={11.5}
                          fill={m.isCurrent ? "#ffffff" : "rgba(255,255,255,0.6)"}
                          fontWeight={m.isCurrent ? "700" : "500"}
                        >
                          {m.label}
                        </SvgText>
                        {m.sub && (
                          <SvgText
                            x={cx}
                            y={169}
                            textAnchor="middle"
                            fontSize={9}
                            fill="rgba(255,255,255,0.4)"
                          >
                            {m.sub}
                          </SvgText>
                        )}
                      </G>
                    );
                  })}
                </Svg>
                <Pressable
                  style={s.zoomBtn}
                  onPress={() => Alert.alert("Zoom", "Adjust chart zoom level")}
                >
                  <Ionicons name="search" size={15} color="rgba(255,255,255,0.7)" />
                  <View style={s.zoomMinusIcon} />
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        {/* "Other data from this period" Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
          style={s.otherSection}
        >
          <Text style={s.otherSectionTitle}>Other data from this period</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.otherCardsRow}
          >
            {/* Energy Score */}
            <Pressable
              style={s.otherCard}
              onPress={() => navigation.navigate("WellnessDashboard")}
            >
              <View style={s.otherIconWrap}>
                <MaterialCommunityIcons
                  name="human-greeting-proximity"
                  size={24}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
              <Text style={s.otherCardTitle}>Energy score</Text>
            </Pressable>

            {/* Mindfulness */}
            <Pressable
              style={s.otherCard}
              onPress={() => navigation.navigate("MeditationDashboard")}
            >
              <View style={s.otherIconWrap}>
                <MaterialCommunityIcons
                  name="meditation"
                  size={24}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
              <Text style={s.otherCardTitle}>Mindfulness</Text>
            </Pressable>

            {/* Stress */}
            <Pressable
              style={s.otherCard}
              onPress={() => navigation.navigate("VitalsScreen")}
            >
              <View style={s.otherIconWrap}>
                <Ionicons
                  name="flash"
                  size={24}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
              <Text style={s.otherCardTitle}>Stress</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Sleep Record Modal */}
      <AddSleepRecordModal
        visible={showAddModal}
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
    paddingBottom: 14,
  },
  headerBtn: {
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
  periodTabsWrap: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 6,
  },
  periodTab: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  periodTabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  periodTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
  },
  periodTabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  mainCard: {
    backgroundColor: "#16161c",
    borderRadius: 28,
    padding: 20,
    marginBottom: 24,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTopLeft: {
    flex: 1,
  },
  dateSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateSelectorText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  badgePillText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  monthPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  monthPill: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  monthPillDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  monthPillWhite: {
    backgroundColor: "#ffffff",
  },
  monthPillText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  monthPillTextDim: {
    color: "rgba(255, 255, 255, 0.65)",
  },
  monthPillTextBlack: {
    color: "#000000",
  },
  metricValRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  metricBigVal: {
    fontSize: 38,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 22,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  monthAvgWrap: {
    marginTop: 6,
    gap: 3,
  },
  monthAvgLine: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
  },
  monthAvgBold: {
    color: "#ffffff",
    fontWeight: "600",
  },
  illustrationCircleWrap: {
    marginLeft: 12,
  },
  illustrationCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  chartArea: {
    marginTop: 6,
    position: "relative",
  },
  hoursChartWrap: {
    marginTop: 10,
  },
  compareSection: {
    marginTop: 16,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 10,
  },
  comparePillsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  comparePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  comparePillText: {
    fontSize: 12.5,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "500",
  },
  gridChartWrap: {
    marginTop: 8,
    position: "relative",
  },
  zoomBtn: {
    position: "absolute",
    bottom: 24,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomMinusIcon: {
    position: "absolute",
    width: 6,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  otherSection: {
    marginTop: 4,
  },
  otherSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 14,
  },
  otherCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  otherCard: {
    width: 106,
    height: 96,
    backgroundColor: "#16161c",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 8,
  },
  otherIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  otherCardTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});
