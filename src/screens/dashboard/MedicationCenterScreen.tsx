import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import {
  MedicationItem,
  PillForm,
  PILL_COLORS,
  addMedication,
  getMedications,
  toggleMedicationTaken,
  deleteMedication,
  getTodayKey,
} from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "MedicationCenter">;

const PILL_FORMS: { form: PillForm; label: string; icon: string }[] = [
  { form: "tablet", label: "Tablet", icon: "pill" },
  { form: "capsule", label: "Capsule", icon: "pill-multiple" },
  { form: "liquid", label: "Liquid/Syrup", icon: "bottle-tonic" },
  { form: "drops", label: "Drops", icon: "eyedropper" },
  { form: "injection", label: "Injection", icon: "needle" },
];

export default function MedicationCenterScreen({ navigation }: Props) {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("500mg");
  const [selectedForm, setSelectedForm] = useState<PillForm>("tablet");
  const [selectedColor, setSelectedColor] = useState(PILL_COLORS[4].hex); // Sky blue default
  const [scheduleTime, setScheduleTime] = useState("08:00 AM");
  const [instructions, setInstructions] = useState("After food");

  const todayKey = getTodayKey();

  const loadData = async () => {
    const list = await getMedications();
    setMedications(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMedication = async () => {
    if (!medName.trim()) {
      Alert.alert("Missing Name", "Please enter the medication name.");
      return;
    }

    await addMedication({
      name: medName.trim(),
      dose: dose.trim() || "1 dose",
      form: selectedForm,
      color: selectedColor,
      scheduleTime: scheduleTime.trim() || "08:00 AM",
      instructions: instructions.trim() || "After food",
    });

    setMedName("");
    setDose("500mg");
    setModalVisible(false);
    await loadData();
  };

  const handleToggleTaken = async (id: string, name: string) => {
    const nowTaken = await toggleMedicationTaken(id, todayKey);
    await loadData();
    if (nowTaken) {
      Alert.alert("Logged", `Marked ${name} as taken for today!`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert("Delete Medication", `Remove ${name} from your schedule?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteMedication(id);
          await loadData();
        },
      },
    ]);
  };

  const takenCount = medications.filter((m) => m.takenDates && m.takenDates.includes(todayKey)).length;
  const adherencePercent =
    medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 0;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={s.pageTitle}>Medication Center</Text>
        <Pressable onPress={() => setModalVisible(true)} style={s.iconBtn}>
          <Ionicons name="add" size={24} color="#8b5cf6" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero Card */}
        <LinearGradient
          colors={["#4c1d95", "#6b21a8", "#7e22ce"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroSub}>TODAY'S SCHEDULE</Text>
              <Text style={s.heroTitle}>
                {takenCount} of {medications.length} Taken
              </Text>
            </View>
            <View style={s.adherenceCircle}>
              <Text style={s.adherencePercentText}>{adherencePercent}%</Text>
            </View>
          </View>

          <View style={s.progressBarTrack}>
            <View style={[s.progressBarFill, { width: `${adherencePercent}%` }]} />
          </View>

          <Pressable style={s.addMedHeroBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={18} color="#ffffff" />
            <Text style={s.addMedHeroBtnText}>Add New Medication</Text>
          </Pressable>
        </LinearGradient>

        {/* Schedule List */}
        <View style={s.listHeader}>
          <Text style={s.sectionTitle}>Your Medicines</Text>
          <Text style={s.itemCount}>
            {medications.length === 0 ? "0 meds" : `${medications.length} scheduled`}
          </Text>
        </View>

        {medications.length === 0 ? (
          <View style={s.emptyBox}>
            <View style={s.emptyIconWrap}>
              <MaterialCommunityIcons name="pill" size={38} color="rgba(255,255,255,0.3)" />
            </View>
            <Text style={s.emptyTitle}>No Medications Added</Text>
            <Text style={s.emptySub}>
              Keep track of your tablets, dose grams, colors, and times so you never miss a dose.
            </Text>
            <Pressable style={s.emptyActionBtn} onPress={() => setModalVisible(true)}>
              <Text style={s.emptyActionBtnText}>+ Add Medication</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.medsList}>
            {medications.map((m) => {
              const isTaken = m.takenDates && m.takenDates.includes(todayKey);
              return (
                <View key={m.id} style={[s.medCard, isTaken && s.medCardTaken]}>
                  <View style={s.medCardLeft}>
                    {/* Visual Pill Color & Form Indicator */}
                    <View style={[s.pillColorBadge, { backgroundColor: m.color }]}>
                      <MaterialCommunityIcons
                        name={
                          (m.form === "liquid"
                            ? "bottle-tonic"
                            : m.form === "injection"
                            ? "needle"
                            : "pill") as any
                        }
                        size={20}
                        color={m.color === "#f8fafc" ? "#0c0e12" : "#ffffff"}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[s.medName, isTaken && s.medNameTaken]}>{m.name}</Text>
                      <Text style={s.medMeta}>
                        {m.dose} · {m.form} · {m.instructions}
                      </Text>
                      <View style={s.timeRow}>
                        <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.5)" />
                        <Text style={s.timeText}>{m.scheduleTime}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={s.medCardRight}>
                    <Pressable
                      style={[s.takenCheckBtn, isTaken && s.takenCheckBtnActive]}
                      onPress={() => handleToggleTaken(m.id, m.name)}
                    >
                      <Ionicons
                        name={isTaken ? "checkmark-circle" : "ellipse-outline"}
                        size={28}
                        color={isTaken ? "#4ade80" : "rgba(255,255,255,0.4)"}
                      />
                      <Text style={[s.takenLabel, isTaken && s.takenLabelActive]}>
                        {isTaken ? "Taken" : "Take"}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={s.deleteBtn}
                      onPress={() => handleDelete(m.id, m.name)}
                    >
                      <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.35)" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── Add Medication Modal ──────────────────────────────────── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Medication</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            {/* Medicine Name */}
            <Text style={s.inputLabel}>Medication Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Paracetamol, Metformin, Vitamin D3"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={medName}
              onChangeText={setMedName}
            />

            {/* Dosage in Grams / mg */}
            <View style={s.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Dose / Weight</Text>
                <TextInput
                  style={s.input}
                  placeholder="500mg or 10g"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={dose}
                  onChangeText={setDose}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Scheduled Time</Text>
                <TextInput
                  style={s.input}
                  placeholder="08:00 AM"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={scheduleTime}
                  onChangeText={setScheduleTime}
                />
              </View>
            </View>

            {/* Pill Form */}
            <Text style={s.inputLabel}>Form</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.formScroll}>
              {PILL_FORMS.map((f) => (
                <Pressable
                  key={f.form}
                  onPress={() => setSelectedForm(f.form)}
                  style={[s.formChip, selectedForm === f.form && s.formChipActive]}
                >
                  <Text style={[s.formChipText, selectedForm === f.form && s.formChipTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Pill Color Picker */}
            <Text style={s.inputLabel}>Pill Color</Text>
            <View style={s.colorRow}>
              {PILL_COLORS.map((c) => (
                <Pressable
                  key={c.hex}
                  onPress={() => setSelectedColor(c.hex)}
                  style={[
                    s.colorCircle,
                    { backgroundColor: c.hex },
                    selectedColor === c.hex && s.colorCircleActive,
                  ]}
                >
                  {selectedColor === c.hex && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={c.hex === "#f8fafc" ? "#0c0e12" : "#ffffff"}
                    />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Instructions */}
            <Text style={s.inputLabel}>Instructions</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. After food, Before breakfast"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={instructions}
              onChangeText={setInstructions}
            />

            <Pressable style={s.saveMedBtn} onPress={handleAddMedication}>
              <Text style={s.saveMedBtnText}>Add to Daily Schedule</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#ffffff" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { paddingHorizontal: 16, paddingTop: 6 },

  // Hero
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  adherenceCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  adherencePercentText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  addMedHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  addMedHeroBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // List
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  itemCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  medsList: {
    gap: 10,
  },
  medCard: {
    backgroundColor: "#181a20",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  medCardTaken: {
    backgroundColor: "#121418",
    opacity: 0.75,
  },
  medCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  pillColorBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  medName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  medNameTaken: {
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.6)",
  },
  medMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  medCardRight: {
    alignItems: "center",
    gap: 8,
  },
  takenCheckBtn: {
    alignItems: "center",
    padding: 4,
  },
  takenCheckBtnActive: {},
  takenLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  takenLabelActive: {
    color: "#4ade80",
  },
  deleteBtn: {
    padding: 4,
  },

  // Empty State
  emptyBox: {
    backgroundColor: "#181a20",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyActionBtn: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#181a20",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#22252e",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inputRow: {
    flexDirection: "row",
  },
  formScroll: {
    flexDirection: "row",
    marginBottom: 4,
  },
  formChip: {
    backgroundColor: "#22252e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  formChipActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  formChipText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  formChipTextActive: {
    color: "#ffffff",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorCircleActive: {
    borderColor: "#ffffff",
  },
  saveMedBtn: {
    backgroundColor: "#8b5cf6",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  saveMedBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
