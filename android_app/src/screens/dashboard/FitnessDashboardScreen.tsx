import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import {
  ActivityItem,
  ActivityType,
  addActivity,
  getActivities,
  getDailyActivityTotals,
  deleteActivity,
} from "@/services/healthLogService";
import OpenGymView from "@/components/fitness/OpenGymView";

type Props = NativeStackScreenProps<RootStackParamList, "FitnessDashboard">;
const { width: SW } = Dimensions.get("window");

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "walking", label: "Walk", icon: "walk" },
  { type: "running", label: "Run", icon: "fitness" },
  { type: "cycling", label: "Cycle", icon: "bicycle" },
  { type: "gym", label: "Gym", icon: "barbell" },
  { type: "yoga", label: "Yoga", icon: "body" },
  { type: "pilates", label: "Pilates", icon: "sparkles" },
  { type: "swimming", label: "Swim", icon: "water" },
];

export default function FitnessDashboardScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [loggedActivities, setLoggedActivities] = useState<ActivityItem[]>([]);
  const [totals, setTotals] = useState({ totalMins: 0, totalCalories: 0, totalDistanceKm: 0, count: 0 });
  const [modalVisible, setModalVisible] = useState(false);

  // Form states for manual record workout modal
  const [selectedType, setSelectedType] = useState<ActivityType>("gym");
  const [title, setTitle] = useState("");
  const [durationMins, setDurationMins] = useState("35");
  const [distanceKm, setDistanceKm] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("240");

  const loadLoggedActivities = async () => {
    try {
      const list = await getActivities();
      const tot = await getDailyActivityTotals();
      setLoggedActivities(list);
      setTotals(tot);
    } catch (e) {
      console.warn("Error loading activities:", e);
    }
  };

  useEffect(() => {
    loadLoggedActivities();
  }, []);

  const handleSaveActivity = async () => {
    const mins = parseInt(durationMins, 10) || 0;
    const dist = parseFloat(distanceKm) || 0;
    const cals = parseInt(caloriesBurned, 10) || 0;

    if (mins <= 0 && cals <= 0) {
      Alert.alert("Invalid Input", "Please enter duration or calories burned.");
      return;
    }

    const defaultTitle = ACTIVITY_TYPES.find((t) => t.type === selectedType)?.label || "Workout";
    await addActivity({
      type: selectedType,
      title: title.trim() || `${defaultTitle} Session`,
      durationMins: mins,
      distanceKm: dist > 0 ? dist : undefined,
      caloriesBurned: cals,
    });

    setTitle("");
    setDurationMins("35");
    setDistanceKm("");
    setCaloriesBurned("240");
    setModalVisible(false);
    await loadLoggedActivities();
  };

  const handleDeleteActivity = async (id: string) => {
    Alert.alert("Delete Activity", "Are you sure you want to remove this workout entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteActivity(id);
          await loadLoggedActivities();
        },
      },
    ]);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>Fitness</Text>
          <View style={s.openGymPill}>
            <Ionicons name="barbell" size={13} color="#4ade80" />
            <Text style={s.openGymPillText}>OPENGYM</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <Pressable
            style={s.headerIconBtn}
            onPress={() => setModalVisible(true)}
            accessibilityLabel="Record Manual Workout"
          >
            <Ionicons name="add" size={24} color="#4ade80" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── OpenGym 5-Tab Fitness Suite (Home, Plan, Start, Stats, Exercise) ── */}
        <OpenGymView
          onWorkoutCompleted={loadLoggedActivities}
          navigation={navigation}
          todayActivities={loggedActivities}
          dailyTotals={totals}
          onDeleteActivity={handleDeleteActivity}
          onOpenRecordModal={() => setModalVisible(true)}
        />

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ── Floating Scroll-To-Top Button ─────────────────────────── */}
      <Pressable style={s.floatingTopBtn} onPress={scrollToTop}>
        <Ionicons name="chevron-up" size={22} color="white" />
      </Pressable>

      {/* ── Persistent Bottom Navigation (Fitness Active) ─────────── */}
      <SamsungBottomNav activeRoute="FitnessDashboard" />

      {/* ── Record Workout Modal ──────────────────────────────────── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Record Workout</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            {/* Activity Type Picker */}
            <Text style={s.inputLabel}>Activity Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll}>
              {ACTIVITY_TYPES.map((t) => (
                <Pressable
                  key={t.type}
                  onPress={() => setSelectedType(t.type)}
                  style={[s.typeChip, selectedType === t.type && s.typeChipActive]}
                >
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={selectedType === t.type ? "#0c0e12" : "rgba(255,255,255,0.7)"}
                  />
                  <Text style={[s.typeChipText, selectedType === t.type && s.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={s.inputLabel}>Workout Name / Title (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Upper Body Push, Leg Day, HIIT"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={title}
              onChangeText={setTitle}
            />

            <View style={s.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.inputLabel}>Duration (mins)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="35"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={durationMins}
                  onChangeText={setDurationMins}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={s.inputLabel}>Calories (kcal)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="240"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={caloriesBurned}
                  onChangeText={setCaloriesBurned}
                />
              </View>
            </View>

            {["running", "cycling", "walking"].includes(selectedType) && (
              <>
                <Text style={s.inputLabel}>Distance (km)</Text>
                <TextInput
                  style={s.input}
                  keyboardType="decimal-pad"
                  placeholder="3.5"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                />
              </>
            )}

            <Pressable style={s.saveBtn} onPress={handleSaveActivity}>
              <Text style={s.saveBtnText}>Save Workout Entry</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0c0e12",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#0c0e12",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  openGymPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.28)",
  },
  openGymPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4ade80",
    letterSpacing: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingTopBtn: {
    position: "absolute",
    bottom: 86,
    alignSelf: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(45, 52, 64, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    elevation: 10,
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
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
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
    marginTop: 10,
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
  typeScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#22252e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  typeChipActive: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  typeChipText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: "#0c0e12",
  },
  saveBtn: {
    backgroundColor: "#4ade80",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0c0e12",
  },
});
