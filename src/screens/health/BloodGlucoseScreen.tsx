import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "BloodGlucose">;

const { width: SW } = Dimensions.get("window");

export default function BloodGlucoseScreen({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState<"Hours" | "Days" | "Weeks" | "Months">("Hours");
  const [glucoseVal, setGlucoseVal] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputVal, setInputVal] = useState("95");

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={s.headerTitle}>Blood glucose</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={26} color="#ffffff" />
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Time Filter Pills */}
      <View style={s.filterRow}>
        {(["Hours", "Days", "Weeks", "Months"] as const).map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={[s.filterPill, activeFilter === filter && s.filterPillActive]}
          >
            <Text style={[s.filterText, activeFilter === filter && s.filterTextActive]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* 1. Main Graph Card */}
        <View style={s.graphCard}>
          <View style={s.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Pressable style={s.todayArrowRow}>
                <Text style={s.todayLabel}>Today</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
              </Pressable>
              <View style={s.valRow}>
                <Text style={s.bigVal}>{glucoseVal !== null ? glucoseVal : "--"}</Text>
                <Text style={s.unitVal}>mg/dL</Text>
              </View>
              <Text style={s.subAdvice}>
                Record your glucose levels to help you manage your blood sugar.
              </Text>
            </View>

            {/* Colorful layered glucose cell icon */}
            <View style={s.cellGraphicWrap}>
              <View style={[s.cellPart, { backgroundColor: "#f59e0b", top: 0, left: 0, width: 44, height: 44, borderRadius: 22 }]} />
              <View style={[s.cellPart, { backgroundColor: "#3b82f6", bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17 }]} />
              <View style={[s.cellPart, { backgroundColor: "#f97316", top: 12, right: 6, width: 20, height: 20, borderRadius: 10 }]} />
            </View>
          </View>

          {/* Target Range Graph (70 - 160 normal band, 250 top limit) */}
          <View style={s.graphBox}>
            {/* Top 250 line */}
            <View style={s.gridLine250} />
            <Text style={s.axis250Label}>250</Text>

            {/* 70 - 160 Target Zone */}
            <View style={s.targetZone}>
              <View style={s.targetHatchPattern} />
            </View>
            <Text style={s.axis160Label}>160</Text>
            <Text style={s.axis70Label}>70</Text>

            {/* Bottom time markers */}
            <View style={s.timeLabelsRow}>
              <Text style={s.timeAxisLabel}>12 AM</Text>
              <Text style={s.timeAxisLabel}>6 AM</Text>
              <Text style={s.timeAxisLabel}>12 PM</Text>
              <Text style={s.timeAxisLabel}>6 PM</Text>
            </View>

            {/* Magnify button */}
            <View style={s.zoomBtn}>
              <Ionicons name="search" size={14} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        </View>

        {/* 2. Continuous glucose monitoring card */}
        <View style={s.cgmCard}>
          <View style={{ flex: 1, paddingRight: 14 }}>
            <Text style={s.cgmTitle}>Continuous glucose monitoring</Text>
            <Text style={s.cgmDesc}>
              If you're using an app for continuous glucose monitoring (CGM), you can share your readings with Urban Helpers to view them here. Check the list of{" "}
              <Text style={s.cgmLink}>supported apps</Text> for details.
            </Text>
          </View>

          {/* CGM phone visual */}
          <View style={s.cgmPhoneGraphic}>
            <View style={s.phoneBody}>
              <Ionicons name="water" size={18} color="#f97316" style={{ marginTop: 8 }} />
              <View style={s.cgmPulseLine} />
            </View>
          </View>
        </View>

        {/* 3. Other data from this period */}
        <Text style={s.sectionHeader}>Other data from this period</Text>
        <View style={s.shortcutsRow}>
          <Pressable
            style={s.shortCard}
            onPress={() => navigation.navigate("VitalsScreen")}
          >
            <Ionicons name="speedometer-outline" size={26} color="#ffffff" />
            <Text style={s.shortLabel}>Blood pressure</Text>
          </Pressable>

          <Pressable
            style={s.shortCard}
            onPress={() => navigation.navigate("AntioxidantIndex")}
          >
            <MaterialCommunityIcons name="molecule" size={26} color="#ffffff" />
            <Text style={s.shortLabel}>Antioxidant index</Text>
          </Pressable>

          <Pressable
            style={s.shortCard}
            onPress={() => navigation.navigate("DailyStepsDashboard")}
          >
            <Ionicons name="walk" size={26} color="#ffffff" />
            <Text style={s.shortLabel}>Exercise</Text>
          </Pressable>

          <Pressable
            style={s.shortCard}
            onPress={() => navigation.navigate("BodyComposition")}
          >
            <MaterialCommunityIcons name="scale-bathroom" size={26} color="#ffffff" />
            <Text style={s.shortLabel}>Body composition</Text>
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Quick Add Glucose Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add blood glucose reading</Text>
            <View style={s.modalInputWrap}>
              <TextInput
                style={s.modalInput}
                keyboardType="numeric"
                value={inputVal}
                onChangeText={setInputVal}
              />
              <Text style={s.modalUnit}>mg/dL</Text>
            </View>
            <View style={s.modalBtnRow}>
              <Pressable style={s.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={s.modalSaveBtn}
                onPress={() => {
                  const n = parseInt(inputVal, 10);
                  if (!isNaN(n)) setGlucoseVal(n);
                  setModalVisible(false);
                }}
              >
                <Text style={s.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  filterPillActive: { backgroundColor: "#20212c" },
  filterText: { color: "rgba(255,255,255,0.6)", fontSize: 13.5, fontWeight: "600" },
  filterTextActive: { color: "#ffffff" },

  scroll: { paddingHorizontal: 16 },

  graphCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  todayArrowRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  todayLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  valRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 8 },
  bigVal: { fontSize: 36, fontWeight: "700", color: "#ffffff" },
  unitVal: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  subAdvice: { fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 18 },

  cellGraphicWrap: {
    width: 60,
    height: 60,
    position: "relative",
  },
  cellPart: { position: "absolute", opacity: 0.9 },

  graphBox: {
    height: 180,
    position: "relative",
    marginTop: 10,
  },
  gridLine250: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 36,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  axis250Label: {
    position: "absolute",
    top: 2,
    right: 0,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  targetZone: {
    position: "absolute",
    top: 50,
    bottom: 40,
    left: 0,
    right: 36,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  targetHatchPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  axis160Label: {
    position: "absolute",
    top: 42,
    right: 0,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  axis70Label: {
    position: "absolute",
    bottom: 32,
    right: 0,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  timeLabelsRow: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeAxisLabel: { fontSize: 10.5, color: "rgba(255,255,255,0.4)" },
  zoomBtn: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  cgmCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cgmTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  cgmDesc: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 18 },
  cgmLink: { textDecorationLine: "underline", color: "#ffffff", fontWeight: "600" },
  cgmPhoneGraphic: {
    width: 60,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#2a2d3b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  phoneBody: { alignItems: "center" },
  cgmPulseLine: {
    width: 28,
    height: 2,
    backgroundColor: "#ffffff",
    marginTop: 8,
    borderRadius: 1,
  },

  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 12,
  },
  shortcutsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  shortCard: {
    flex: 1,
    backgroundColor: "#161822",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 90,
  },
  shortLabel: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    fontWeight: "500",
  },

  // Quick Add Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#1c1e28",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#ffffff", marginBottom: 16, textAlign: "center" },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 8,
    marginVertical: 14,
  },
  modalInput: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.4)",
    minWidth: 80,
    textAlign: "center",
  },
  modalUnit: { fontSize: 15, color: "rgba(255,255,255,0.6)" },
  modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16 },
  modalCancelText: { color: "white", fontWeight: "600" },
  modalSaveBtn: { flex: 1, paddingVertical: 12, alignItems: "center", backgroundColor: "#3b82f6", borderRadius: 16 },
  modalSaveText: { color: "white", fontWeight: "700" },
});
