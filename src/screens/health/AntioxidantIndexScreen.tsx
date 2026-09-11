import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "AntioxidantIndex">;

export default function AntioxidantIndexScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={s.headerTitle}>Antioxidant index</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Ionicons name="bar-chart-outline" size={22} color="#ffffff" />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Date Switcher */}
      <View style={s.dateSwitcherRow}>
        <Pressable style={s.arrowBtn}>
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={s.datePill}>
          <Text style={s.datePillText}>Today</Text>
        </View>
        <Pressable style={s.arrowBtn}>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* 1. Main Status Card */}
        <View style={s.mainCard}>
          <View style={s.cardTopRow}>
            <Text style={s.bigDashes}>--</Text>
            <Ionicons name="information-circle-outline" size={22} color="rgba(255,255,255,0.7)" />
          </View>

          {/* 3-segment color bar */}
          <View style={s.segmentBarRow}>
            <View style={[s.barSegment, { backgroundColor: "#f97316" }]} />
            <View style={[s.barSegment, { backgroundColor: "#eab308" }]} />
            <View style={[s.barSegment, { backgroundColor: "#0284c7" }]} />
          </View>
          <View style={s.segmentLabelsRow}>
            <Text style={s.segmentLabelLeft}>Very low</Text>
            <Text style={s.segmentLabelRight}>Adequate</Text>
          </View>

          <View style={{ height: 40 }} />

          <Text style={s.watchNote}>
            You need a Galaxy Watch8 or higher to use this feature.
          </Text>
        </View>

        {/* 2. 7-Day Trend Card */}
        <View style={s.trendCard}>
          <View style={s.trendHeaderRow}>
            <Text style={s.trendTitle}>Antioxidant index over last 7 days</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </View>

          <View style={s.trendBody}>
            {/* Right-side status levels */}
            <View style={s.levelsCol}>
              <Text style={[s.levelLabel, { color: "#38bdf8" }]}>Adequate</Text>
              <Text style={[s.levelLabel, { color: "#fde047" }]}>Low</Text>
              <Text style={[s.levelLabel, { color: "#fb923c" }]}>Very low</Text>
            </View>

            {/* Timeline */}
            <View style={s.timelineRow}>
              {[
                { day: "5", isSun: false, isToday: false },
                { day: "6", isSun: true, isToday: false },
                { day: "7", isSun: false, isToday: false },
                { day: "8", isSun: false, isToday: false },
                { day: "9", isSun: false, isToday: false },
                { day: "10", isSun: false, isToday: false },
                { day: "11", isSun: false, isToday: true },
              ].map((item, i) => (
                <Text
                  key={i}
                  style={[
                    s.timelineDay,
                    item.isSun && { color: "#ef4444" },
                    item.isToday && { color: "#ffffff", fontWeight: "700" },
                  ]}
                >
                  {item.day}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBtn: { padding: 4 },

  dateSwitcherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  arrowBtn: { padding: 8 },
  datePill: {
    backgroundColor: "#1e1e24",
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 22,
  },
  datePillText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },

  scroll: { paddingHorizontal: 16 },

  mainCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    minHeight: 200,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  bigDashes: { fontSize: 36, fontWeight: "700", color: "#ffffff" },
  segmentBarRow: { flexDirection: "row", gap: 4, height: 14, marginBottom: 8 },
  barSegment: { flex: 1, borderRadius: 7 },
  segmentLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  segmentLabelLeft: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  segmentLabelRight: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  watchNote: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
  },

  trendCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    minHeight: 180,
  },
  trendHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  trendTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  trendBody: { minHeight: 130, justifyContent: "space-between" },
  levelsCol: { alignItems: "flex-end", gap: 12, marginTop: 8 },
  levelLabel: { fontSize: 12, fontWeight: "600" },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 20,
    marginTop: 20,
  },
  timelineDay: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
});
