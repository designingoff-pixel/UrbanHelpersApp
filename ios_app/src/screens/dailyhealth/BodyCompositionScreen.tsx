import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

import {
  getLatestBodyComp,
  saveBodyComp,
  BodyCompEntry,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "BodyComposition">;

const { width: SW } = Dimensions.get("window");

export default function BodyCompositionScreen({ navigation }: Props) {
  const [weight, setWeight] = useState<number | null>(null);
  const [muscle, setMuscle] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Temporary state for the modal
  const [tempWeightInt, setTempWeightInt] = useState(65);
  const [tempWeightDec, setTempWeightDec] = useState(0);

  useEffect(() => {
    loadBodyComp();
  }, []);

  const loadBodyComp = async () => {
    const latest = await getLatestBodyComp();
    if (latest) {
      setWeight(latest.weight);
      setMuscle(latest.muscle || "");
      setBodyFat(latest.bodyFat || "");
      setTimeStr(latest.time || "");
    }
  };

  const handleOpenModal = () => {
    const currentWeight = weight != null ? weight : 65.0;
    const intPart = Math.floor(currentWeight);
    const decPart = Math.round((currentWeight - intPart) * 10);
    setTempWeightInt(intPart);
    setTempWeightDec(decPart);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const newWeight = parseFloat(`${tempWeightInt}.${tempWeightDec}`);
    const saved = await saveBodyComp({
      weight: newWeight,
      muscle: muscle.trim() || undefined,
      bodyFat: bodyFat.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setWeight(newWeight);
    setTimeStr(saved.time);
    setModalVisible(false);
  };

  return (
    <View style={s.root}>
      {/* Top Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={s.headerTitle}>Body composition</Text>
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

      {/* Date switcher */}
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
        {/* 1. Main Weight Card */}
        <View style={s.weightCard}>
          <View style={s.scaleIconWrap}>
            <MaterialCommunityIcons name="scale-bathroom" size={24} color="rgba(255,255,255,0.5)" />
          </View>
          <View style={s.weightNumRow}>
            <Text style={s.weightNum}>{weight != null ? weight.toFixed(1) : "--"}</Text>
            <Text style={s.weightUnit}>kg</Text>
          </View>
        </View>
        <Text style={s.manualTimeLabel}>
          {timeStr || (weight != null ? "Manual input" : "No data recorded (tap Enter data below)")}
        </Text>

        {/* 2. Weight over last 7 days */}
        <View style={s.chartCard}>
          <View style={s.chartHeaderRow}>
            <Text style={s.chartTitle}>Weight over last 7 days</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </View>

          {/* Chart area */}
          <View style={s.chartBody}>
            <View style={s.dottedLine} />
            <Text style={s.axisValLabel}>{weight != null ? Math.round(weight) : "--"}</Text>

            {/* Timeline days */}
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
                    {item.isToday && weight != null && <View style={s.activeDot} />}
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

        {/* 3. Get to know your body promo */}
        <View style={s.promoCard}>
          <View style={s.promoTextWrap}>
            <Text style={s.promoTitle}>Get to know your body</Text>
            <Text style={s.promoSub}>
              How knowing your body composition can benefit you
            </Text>
          </View>
          <View style={s.promoGraphic}>
            <View style={[s.blob, { backgroundColor: "#10b981", top: 4, left: 6, width: 22, height: 22 }]} />
            <View style={[s.blob, { backgroundColor: "#f97316", top: 2, right: 12, width: 18, height: 32, borderRadius: 9 }]} />
            <View style={[s.blob, { backgroundColor: "#3b82f6", top: 26, left: 8, width: 34, height: 24, borderRadius: 12 }]} />
            <View style={[s.blob, { backgroundColor: "#22c55e", bottom: 8, right: 10, width: 26, height: 26 }]} />
            <View style={[s.blob, { backgroundColor: "#f59e0b", bottom: 4, left: 16, width: 30, height: 18, borderRadius: 9 }]} />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Button: Enter data */}
      <View style={s.bottomBtnWrap}>
        <Pressable style={s.enterDataBtn} onPress={handleOpenModal}>
          <Text style={s.enterDataText}>Enter data</Text>
        </Pressable>
      </View>

      {/* Enter Data Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {/* Modal header date */}
            <View style={s.modalDatePill}>
              <Text style={s.modalDateText}>Fri, 11 Sept 2:50 pm</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Drum/Wheel Weight Picker */}
              <View style={s.pickerCard}>
                <Text style={s.pickerLabel}>Weight (kg)</Text>
                <View style={s.drumWheelRow}>
                  {/* Integer column */}
                  <View style={s.drumCol}>
                    <Pressable onPress={() => setTempWeightInt((v) => Math.max(v - 1, 30))}>
                      <Text style={s.drumSideVal}>{tempWeightInt - 1}</Text>
                    </Pressable>
                    <Text style={s.drumActiveVal}>{tempWeightInt}</Text>
                    <Pressable onPress={() => setTempWeightInt((v) => Math.min(v + 1, 200))}>
                      <Text style={s.drumSideVal}>{tempWeightInt + 1}</Text>
                    </Pressable>
                  </View>

                  <Text style={s.drumDot}>.</Text>

                  {/* Decimal column */}
                  <View style={s.drumCol}>
                    <Pressable onPress={() => setTempWeightDec((v) => (v === 0 ? 9 : v - 1))}>
                      <Text style={s.drumSideVal}>{(tempWeightDec === 0 ? 9 : tempWeightDec - 1)}</Text>
                    </Pressable>
                    <Text style={s.drumActiveVal}>{tempWeightDec}</Text>
                    <Pressable onPress={() => setTempWeightDec((v) => (v === 9 ? 0 : v + 1))}>
                      <Text style={s.drumSideVal}>{(tempWeightDec === 9 ? 0 : tempWeightDec + 1)}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <Text style={s.hintText}>
                The weight you enter will also be shown in your user profile.
              </Text>

              {/* Skeletal muscle & Body fat inputs */}
              <View style={s.inputCard}>
                <View style={s.inputRow}>
                  <Text style={s.inputLabel}>Skeletal muscle (kg)</Text>
                  <TextInput
                    style={s.textInput}
                    value={muscle}
                    onChangeText={setMuscle}
                    keyboardType="numeric"
                    placeholder="e.g. 28.4"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>
                <View style={s.inputDivider} />
                <View style={s.inputRow}>
                  <Text style={s.inputLabel}>Body fat (%)</Text>
                  <TextInput
                    style={s.textInput}
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    keyboardType="numeric"
                    placeholder="e.g. 18.5"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>
              </View>

              <Text style={s.hintText}>
                Body water and basal metabolic rate (BMR) are estimated based on your skeletal muscle and body fat percentage.
              </Text>

              {/* Notes input */}
              <View style={s.notesCard}>
                <Ionicons name="document-text-outline" size={20} color="rgba(255,255,255,0.6)" />
                <TextInput
                  style={s.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Notes"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Cancel & Save Buttons */}
            <View style={s.modalBtnRow}>
              <Pressable style={s.modalBtnHalf} onPress={() => setModalVisible(false)}>
                <Text style={s.modalBtnText}>Cancel</Text>
              </Pressable>
              <View style={s.modalBtnDivider} />
              <Pressable style={s.modalBtnHalf} onPress={handleSave}>
                <Text style={[s.modalBtnText, { fontWeight: "700" }]}>Save</Text>
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

  weightCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  scaleIconWrap: { marginBottom: 12 },
  weightNumRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  weightNum: { fontSize: 44, fontWeight: "700", color: "#ffffff" },
  weightUnit: { fontSize: 16, color: "rgba(255,255,255,0.7)" },
  manualTimeLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    textAlign: "right",
    marginBottom: 16,
  },

  chartCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  chartBody: { position: "relative", minHeight: 90 },
  dottedLine: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 32,
    height: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dotted",
  },
  axisValLabel: {
    position: "absolute",
    right: 0,
    top: 14,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingRight: 28,
  },
  dayCol: { alignItems: "center", gap: 8 },
  dotSlot: { height: 12, justifyContent: "center", alignItems: "center" },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff" },
  dayLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)" },

  promoCard: {
    backgroundColor: "#161822",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  promoTextWrap: { flex: 1, paddingRight: 12 },
  promoTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 6 },
  promoSub: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 18 },
  promoGraphic: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    position: "relative",
    overflow: "hidden",
  },
  blob: { position: "absolute", borderRadius: 10 },

  bottomBtnWrap: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  enterDataBtn: {
    backgroundColor: "#2c2d38",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 26,
    minWidth: 180,
    alignItems: "center",
  },
  enterDataText: { fontSize: 15, fontWeight: "600", color: "#ffffff" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#12131a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalDatePill: {
    backgroundColor: "#20212c",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 20,
  },
  modalDateText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },

  pickerCard: {
    backgroundColor: "#1c1e28",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  pickerLabel: { fontSize: 14, color: "#ffffff", fontWeight: "600", alignSelf: "flex-start", marginBottom: 14 },
  drumWheelRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  drumCol: { alignItems: "center", gap: 8 },
  drumSideVal: { fontSize: 22, color: "rgba(255,255,255,0.25)", fontWeight: "600" },
  drumActiveVal: { fontSize: 36, color: "#ffffff", fontWeight: "700" },
  drumDot: { fontSize: 32, color: "#ffffff", fontWeight: "700", marginTop: -6 },

  hintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 17,
    marginHorizontal: 8,
    marginBottom: 14,
  },

  inputCard: {
    backgroundColor: "#1c1e28",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  inputLabel: { fontSize: 14, color: "#ffffff", fontWeight: "500" },
  textInput: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "right",
    minWidth: 80,
  },
  inputDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },

  notesCard: {
    backgroundColor: "#1c1e28",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  notesInput: { flex: 1, color: "#ffffff", fontSize: 14 },

  modalBtnRow: {
    flexDirection: "row",
    backgroundColor: "#222430",
    borderRadius: 26,
    overflow: "hidden",
  },
  modalBtnHalf: { flex: 1, paddingVertical: 14, alignItems: "center" },
  modalBtnDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  modalBtnText: { color: "#ffffff", fontSize: 15 },
});
