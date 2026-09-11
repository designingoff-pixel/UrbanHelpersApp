import React, { useState, useEffect } from "react";
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

import {
  WaterEntry,
  getWaterLogs,
  addWaterLog,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "HydrationDashboard">;

export default function HydrationDashboardScreen({ navigation }: Props) {
  const [intake, setIntake] = useState(0);
  const [logs, setLogs] = useState<WaterEntry[]>([]);

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    const list = await getWaterLogs();
    const total = list.reduce((sum, item) => sum + (item.amount || 0), 0);
    setLogs(list);
    setIntake(total);
  };

  const target = 2000;
  const progressRatio = Math.min(intake / target, 1);

  const handleAddWater = async (amount: number = 250) => {
    const newEntry = await addWaterLog(amount);
    setLogs((prev) => [newEntry, ...prev]);
    setIntake((prev) => prev + amount);
  };

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={s.headerTitle}>Water</Text>
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
        {/* 1. Main Water Progress Card */}
        <View style={s.mainCard}>
          <View style={s.amountRow}>
            <View>
              <Text style={s.amountNum}>{intake}</Text>
              <Text style={s.amountUnit}>ml</Text>
            </View>

            {/* Quick + 250 ml button */}
            <Pressable style={s.addBtn} onPress={() => handleAddWater(250)}>
              <Text style={s.addBtnText}>+ 250 ml</Text>
            </Pressable>
          </View>

          {/* Progress bar with target badge */}
          <View style={s.progressBarWrap}>
            <View style={s.progressBarTrack}>
              <View style={[s.progressBarFill, { width: `${progressRatio * 100}%` }]} />
            </View>
            <View style={s.barLabelsRow}>
              <Text style={s.barZero}>0</Text>
              <View style={s.targetBadge}>
                <Ionicons name="disc-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={s.targetBadgeText}>2,000</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Logged Entries Card */}
        <View style={s.entriesCard}>
          {logs.length > 0 ? (
            logs.map((item, idx) => (
              <View key={item.id}>
                <View style={s.entryRow}>
                  <Text style={s.entryAmount}>{item.amount} ml</Text>
                  <Text style={s.entryTime}>{item.time}</Text>
                </View>
                {idx < logs.length - 1 && <View style={s.entryDivider} />}
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: "500" }}>No water logged today</Text>
              <Text style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, marginTop: 4 }}>Tap "+ 250 ml" to record your first drink.</Text>
            </View>
          )}
        </View>

        {/* 3. Water Intake over last 7 days */}
        <View style={s.trendCard}>
          <View style={s.trendHeaderRow}>
            <Text style={s.trendTitle}>Water intake over last 7 days</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </View>

          <View style={s.trendBody}>
            <View style={s.dottedLine} />
            <View style={s.avgBadge}>
              <Text style={s.avgBadgeLabel}>Avg.</Text>
              <Text style={s.avgBadgeVal}>{intake > 0 ? intake : 0}</Text>
            </View>

            {/* Days timeline */}
            <View style={s.daysRow}>
              {[
                { day: "5", isSun: false, isToday: false },
                { day: "6", isSun: true, isToday: false },
                { day: "7", isSun: false, isToday: false },
                { day: "8", isSun: false, isToday: false },
                { day: "9", isSun: false, isToday: false },
                { day: "10", isSun: false, isToday: false },
                { day: "11", isSun: false, isToday: true },
              ].map((item, i) => (
                <View key={i} style={s.dayCol}>
                  <View style={s.dotSlot}>
                    {item.isToday && intake > 0 && <View style={s.greenDot} />}
                  </View>
                  <Text
                    style={[
                      s.dayLabel,
                      item.isSun && { color: "#ef4444" },
                      item.isToday && { color: "#ffffff", fontWeight: "700" },
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
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
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  amountNum: { fontSize: 44, fontWeight: "700", color: "#ffffff", lineHeight: 50 },
  amountUnit: { fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: "500", marginTop: 2 },
  addBtn: {
    backgroundColor: "#2a2d3b",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },

  progressBarWrap: { gap: 8 },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  barLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barZero: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  targetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2a2d3b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetBadgeText: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "600" },

  entriesCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  entryRow: {
    paddingVertical: 12,
    gap: 4,
  },
  entryAmount: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  entryTime: { fontSize: 12.5, color: "rgba(255,255,255,0.45)" },
  entryDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },

  trendCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  trendHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  trendTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  trendBody: { position: "relative", minHeight: 90 },
  dottedLine: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 48,
    height: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dotted",
  },
  avgBadge: {
    position: "absolute",
    right: 0,
    top: 10,
    backgroundColor: "#20212c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  avgBadgeLabel: { fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  avgBadgeVal: { fontSize: 11, color: "#ffffff", fontWeight: "700" },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingRight: 50,
  },
  dayCol: { alignItems: "center", gap: 8 },
  dotSlot: { height: 16, justifyContent: "center", alignItems: "center" },
  greenDot: { width: 10, height: 14, borderRadius: 5, backgroundColor: "#22c55e" },
  dayLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
});
