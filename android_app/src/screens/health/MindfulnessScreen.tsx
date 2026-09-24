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
import Svg, {
  Circle,
  Path,
  Rect,
  Line,
  G,
  LinearGradient as SvgLinearGradient,
  Stop,
  Defs,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Mindfulness">;

const { width: SW } = Dimensions.get("window");

export default function MindfulnessScreen({ navigation }: Props) {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [recapDismissed, setRecapDismissed] = useState(false);

  const dayLabel =
    selectedDayOffset === 0
      ? "Today"
      : selectedDayOffset === -1
      ? "Yesterday"
      : `${Math.abs(selectedDayOffset)} days ago`;

  // Layered Orange Mood Clay Icon
  const renderMoodClayIcon = () => (
    <Svg width={44} height={44} viewBox="0 0 50 50">
      <Defs>
        <SvgLinearGradient id="clayOrange" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#fb923c" />
          <Stop offset="100%" stopColor="#ea580c" />
        </SvgLinearGradient>
      </Defs>
      {/* Three curved pill clay cushions stacked */}
      <Path
        d="M12 36 C10 32, 40 32, 38 36 C36 40, 14 40, 12 36 Z"
        fill="url(#clayOrange)"
        opacity={0.7}
      />
      <Path
        d="M10 27 C8 22, 42 22, 40 27 C38 32, 12 32, 10 27 Z"
        fill="url(#clayOrange)"
        opacity={0.88}
      />
      <Path
        d="M14 18 C12 13, 38 13, 36 18 C34 23, 16 23, 14 18 Z"
        fill="url(#clayOrange)"
      />
    </Svg>
  );

  // Dual Overlapping Purple Breathing Circles Icon
  const renderBreathingIcon = () => (
    <Svg width={44} height={44} viewBox="0 0 50 50">
      <Circle cx="22" cy="25" r="15" fill="#818cf8" opacity={0.6} />
      <Circle cx="28" cy="25" r="15" fill="#a78bfa" opacity={0.75} />
    </Svg>
  );

  // Zen Green Stacked Stones Meditation Icon
  const renderMeditationIcon = () => (
    <Svg width={44} height={44} viewBox="0 0 50 50">
      {/* Top stone */}
      <Circle cx="25" cy="14" r="5" fill="#34d399" />
      {/* Middle stone */}
      <Path
        d="M18 24 C18 20, 32 20, 32 24 C32 28, 18 28, 18 24 Z"
        fill="#10b981"
      />
      {/* Base curved stone */}
      <Path
        d="M12 34 C12 28, 38 28, 38 34 C38 40, 12 40, 12 34 Z"
        fill="#059669"
      />
    </Svg>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0c1e" />

      {/* Header (Screenshot 1) */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Mindfulness</Text>
        <View style={s.headerRight}>
          <Pressable
            onPress={() => Alert.alert("Trends", "Mindfulness analytics & trends")}
            style={s.headerIconBtn}
          >
            <View style={s.barChartIcon}>
              <View style={[s.barChartCol, { height: 10 }]} />
              <View style={[s.barChartCol, { height: 18 }]} />
              <View style={[s.barChartCol, { height: 14 }]} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert("Options", "Mindfulness settings")}
            style={s.headerIconBtn}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Navigator: < [ Today ] > */}
        <View style={s.dateNavWrap}>
          <Pressable
            onPress={() => setSelectedDayOffset((prev) => prev - 1)}
            style={s.dateArrow}
          >
            <Ionicons name="chevron-back" size={18} color="#9ca3af" />
          </Pressable>
          <View style={s.datePill}>
            <Text style={s.datePillText}>{dayLabel}</Text>
          </View>
          <Pressable
            onPress={() => setSelectedDayOffset((prev) => Math.min(0, prev + 1))}
            style={[s.dateArrow, selectedDayOffset === 0 && s.dateArrowDisabled]}
            disabled={selectedDayOffset === 0}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={selectedDayOffset === 0 ? "#374151" : "#9ca3af"}
            />
          </Pressable>
        </View>

        {/* Monthly Recap Card (Screenshot 1) */}
        {!recapDismissed && (
          <Animated.View entering={FadeInDown.duration(400)} style={s.recapCard}>
            <View style={s.recapHeaderRow}>
              <Text style={s.recapTitle}>Monthly recap</Text>
              <Pressable
                onPress={() => setRecapDismissed(true)}
                style={s.recapCloseBtn}
              >
                <Ionicons name="close" size={18} color="#9ca3af" />
              </Pressable>
            </View>
            <Text style={s.recapDesc}>
              Your monthly recap updates as you go, highlighting your most common moods, sessions, and more.
            </Text>
            <Pressable
              style={s.recapBtn}
              onPress={() => Alert.alert("Monthly Recap", "You have completed 12 mindfulness activities this month! Most common mood: Awesome 🌟")}
            >
              <Text style={s.recapBtnText}>Monthly recap</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Activities Section (Screenshot 1) */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.activitiesCard}>
          <Text style={s.sectionTitle}>Activities</Text>

          {/* 1. Mood check-in */}
          <Pressable
            style={s.activityRow}
            onPress={() => navigation.navigate("MoodCheckIn" as any)}
          >
            <View style={s.activityIconWrap}>
              {renderMoodClayIcon()}
            </View>
            <View style={s.activityTextWrap}>
              <Text style={s.activityTitle}>Mood check-in</Text>
              <Text style={s.activitySubtitle}>How are you feeling?</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>

          <View style={s.activityDivider} />

          {/* 2. Breathing exercises */}
          <Pressable
            style={s.activityRow}
            onPress={() => navigation.navigate("BreathingExercises" as any)}
          >
            <View style={s.activityIconWrap}>
              {renderBreathingIcon()}
            </View>
            <View style={s.activityTextWrap}>
              <Text style={s.activityTitle}>Breathing exercises</Text>
              <Text style={s.activitySubtitle}>Take a deep breath.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>

          <View style={s.activityDivider} />

          {/* 3. Meditation */}
          <Pressable
            style={s.activityRow}
            onPress={() => navigation.navigate("Meditation" as any)}
          >
            <View style={s.activityIconWrap}>
              {renderMeditationIcon()}
            </View>
            <View style={s.activityTextWrap}>
              <Text style={s.activityTitle}>Meditation</Text>
              <Text style={s.activitySubtitle}>Find your focus.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </Pressable>
        </Animated.View>

        {/* Mood and Lifestyle Section (Screenshot 2) */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.lifestyleCard}>
          <View style={s.lifestyleHeaderRow}>
            <Text style={s.sectionTitle}>Mood and lifestyle</Text>
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Mood and Lifestyle",
                  "Sleep, physical activity, and stress heavily influence emotional well-being and autonomic balance."
                )
              }
            >
              <Ionicons name="information-circle-outline" size={20} color="#9ca3af" />
            </Pressable>
          </View>
          <Text style={s.lifestyleSub}>
            Review your sleep, active time, and stress over the last 7 days.
          </Text>

          {/* Sleep Time Chart */}
          <View style={s.metricBlock}>
            <Text style={s.metricLabel}>Sleep time</Text>
            <Text style={s.metricVal}>6 hrs / day</Text>

            <View style={s.chartBox}>
              <View style={s.chartRangeBandPurple} />
              <View style={s.chartYLabels}>
                <Text style={s.chartYText}>9 h</Text>
                <Text style={s.chartYText}>7 h</Text>
              </View>
              {/* Bars */}
              <View style={s.barsRow}>
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 45, backgroundColor: "#818cf8" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
              </View>
            </View>
          </View>

          {/* Active Time Chart */}
          <View style={s.metricBlock}>
            <Text style={s.metricLabel}>Active time</Text>
            <Text style={s.metricVal}>46 mins / day</Text>

            <View style={s.chartBox}>
              <View style={s.chartRangeBandGreen} />
              <View style={s.chartYLabels}>
                <Text style={s.chartYText}>75 m</Text>
                <Text style={s.chartYText}>46 m</Text>
              </View>
              {/* Bars */}
              <View style={s.barsRow}>
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
                <View style={[s.barPill, { height: 26, backgroundColor: "#4ade80" }]} />
                <View style={[s.barPill, { height: 55, backgroundColor: "#4ade80" }]} />
                <View style={[s.barPill, { height: 38, backgroundColor: "#4ade80" }]} />
                <View style={[s.barPill, { height: 14, backgroundColor: "#4ade80" }]} />
                <View style={[s.barPill, { height: 4, backgroundColor: "transparent" }]} />
              </View>
            </View>
          </View>

          {/* Stress Chart */}
          <Pressable
            style={s.metricBlock}
            onPress={() => navigation.navigate("Stress" as any)}
          >
            <Text style={s.metricLabel}>Stress</Text>
            <View style={s.stressEmptyBox}>
              <Text style={s.noDataText}>No data</Text>
            </View>
            {/* Timeline Dates */}
            <View style={s.dateRow}>
              {["05", "06", "07", "08", "09", "10", "11"].map((d, i) => (
                <Text
                  key={d}
                  style={[s.dateItemText, i === 1 && { color: "#f87171" }]}
                >
                  {d}
                </Text>
              ))}
            </View>
            <View style={s.legendRow}>
              <View style={s.legendBox} />
              <Text style={s.legendText}>Recommended range</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Mood and Emotion Educational Card (Screenshot 2) */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.eduCard}>
          <View style={s.eduLeft}>
            <Text style={s.eduTitle}>Mood and emotion</Text>
            <Text style={s.eduDesc}>
              Mood and emotion are often used interchangeably because they share similarities.
            </Text>
          </View>
          <View style={s.eduRight}>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Rect x="8" y="8" width="44" height="44" rx="10" fill="#f1f5f9" />
              <Rect x="14" y="14" width="16" height="16" rx="4" fill="#22c55e" />
              <Path d="M18 22 L21 25 L26 19" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <Rect x="18" y="32" width="24" height="18" rx="5" fill="#3b82f6" />
              <Path d="M24 41 L27 44 L34 37" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <Line x1="44" y1="12" x2="30" y2="28" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
            </Svg>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d0f26", // Samsung Health Mindfulness midnight navy
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#0d0f26",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  barChartIcon: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2.5,
    paddingHorizontal: 4,
    height: 20,
    justifyContent: "center",
  },
  barChartCol: {
    width: 3.5,
    backgroundColor: "#ffffff",
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  dateNavWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginVertical: 14,
  },
  dateArrow: {
    padding: 6,
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  datePill: {
    backgroundColor: "#1e2246",
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
  },
  datePillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  recapCard: {
    backgroundColor: "#161938",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  recapHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  recapTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  recapCloseBtn: {
    padding: 4,
  },
  recapDesc: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 14,
  },
  recapBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#2c3160",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  recapBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  activitiesCard: {
    backgroundColor: "#161938",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 14,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 6,
  },
  activityIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  activityDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 10,
  },
  lifestyleCard: {
    backgroundColor: "#161938",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  lifestyleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lifestyleSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 16,
    marginTop: -8,
  },
  metricBlock: {
    marginBottom: 18,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  metricVal: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 8,
    marginTop: 2,
  },
  chartBox: {
    height: 60,
    position: "relative",
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  chartRangeBandPurple: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 35,
    height: 18,
    backgroundColor: "rgba(129,140,248,0.14)",
    borderRadius: 4,
  },
  chartRangeBandGreen: {
    position: "absolute",
    top: 15,
    left: 0,
    right: 35,
    height: 22,
    backgroundColor: "rgba(74,222,128,0.14)",
    borderRadius: 4,
  },
  chartYLabels: {
    position: "absolute",
    right: 0,
    top: 6,
    bottom: 4,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  chartYText: {
    fontSize: 10,
    color: "#64748b",
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingRight: 40,
    height: 55,
  },
  barPill: {
    width: 6,
    borderRadius: 3,
  },
  stressEmptyBox: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  noDataText: {
    fontSize: 14,
    color: "#64748b",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingRight: 10,
  },
  dateItemText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  legendBox: {
    width: 10,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: "#64748b",
  },
  eduCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161938",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  eduLeft: {
    flex: 1,
    paddingRight: 12,
  },
  eduTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  eduDesc: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 17,
  },
  eduRight: {
    alignItems: "center",
    justifyContent: "center",
  },
});
