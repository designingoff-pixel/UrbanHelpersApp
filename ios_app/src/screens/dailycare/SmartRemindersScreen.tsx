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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { getTodayKey } from "@/services/healthLogService";
import SamsungBottomNav from "@/components/SamsungBottomNav";

type Props = NativeStackScreenProps<RootStackParamList, "SmartReminders">;

const STORAGE_KEY_REMINDERS = "@urban_health_daily_reminders_v1";
const STORAGE_KEY_POINTS = "@urban_health_reward_points_v1";

export interface ReminderItem {
  id: string;
  title: string;
  category: string;
  time: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  isCustom?: boolean;
}

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: "rem-1",
    title: "Tablets",
    category: "Medicine",
    time: "08:00 AM & 08:00 PM",
    icon: "pill",
    color: "#a855f7",
  },
  {
    id: "rem-2",
    title: "Detox Drink",
    category: "Nutrition",
    time: "07:30 AM",
    icon: "leaf",
    color: "#10b981",
  },
  {
    id: "rem-3",
    title: "Toothbrush (Morning & Night)",
    category: "Hygiene",
    time: "07:15 AM & 10:30 PM",
    icon: "toothbrush-paste",
    color: "#38bdf8",
  },
  {
    id: "rem-4",
    title: "Personal Hygiene & Skincare",
    category: "Hygiene",
    time: "08:30 AM",
    icon: "face-woman-shimmer",
    color: "#ec4899",
  },
  {
    id: "rem-5",
    title: "Water (Hydration Target)",
    category: "Hydration",
    time: "Hourly (Target: 2,500 ml)",
    icon: "water",
    color: "#0284c7",
  },
  {
    id: "rem-6",
    title: "Meal Remainder",
    category: "Diet",
    time: "09:00 AM, 01:30 PM, 08:30 PM",
    icon: "silverware-fork-knife",
    color: "#f59e0b",
  },
  {
    id: "rem-7",
    title: "Gym Workout",
    category: "Fitness",
    time: "06:30 PM",
    icon: "dumbbell",
    color: "#ef4444",
  },
  {
    id: "rem-8",
    title: "Yoga & Mindfulness",
    category: "Wellness",
    time: "07:00 AM",
    icon: "yoga",
    color: "#8b5cf6",
  },
];

export default function SmartRemindersScreen({ navigation }: Props) {
  const [reminders, setReminders] = useState<ReminderItem[]>(DEFAULT_REMINDERS);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // New reminder form
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("08:00 AM");
  const [newCategory, setNewCategory] = useState("Daily");

  const todayKey = getTodayKey();

  // Load reminders & today's checked status
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_REMINDERS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.customReminders && Array.isArray(parsed.customReminders)) {
            setReminders([...DEFAULT_REMINDERS, ...parsed.customReminders]);
          }
          if (parsed.date === todayKey && Array.isArray(parsed.checked)) {
            setCheckedIds(parsed.checked);
          } else {
            setCheckedIds([]);
          }
        }
      } catch (e) {
        console.log("Error loading reminders:", e);
      }
    }
    loadData();
  }, [todayKey]);

  // Persist checked status
  const saveState = async (updatedChecked: string[], updatedReminders: ReminderItem[]) => {
    try {
      const customOnes = updatedReminders.filter((r) => r.isCustom);
      await AsyncStorage.setItem(
        STORAGE_KEY_REMINDERS,
        JSON.stringify({
          date: todayKey,
          checked: updatedChecked,
          customReminders: customOnes,
        })
      );
    } catch (e) {
      console.log("Error saving reminders:", e);
    }
  };

  // Toggle checklist item
  const handleToggle = async (id: string, title: string) => {
    const isNowChecked = !checkedIds.includes(id);
    let updatedChecked: string[];

    if (isNowChecked) {
      updatedChecked = [...checkedIds, id];
      // Award +10 Points
      try {
        const rawPts = await AsyncStorage.getItem(STORAGE_KEY_POINTS);
        const currentPts = rawPts ? parseInt(rawPts, 10) : 1250;
        await AsyncStorage.setItem(STORAGE_KEY_POINTS, String(currentPts + 10));
        Alert.alert("Habit Completed! 🎉", `Marked "${title}" as done! You earned +10 reward points.`);
      } catch (e) {
        console.log("Error updating points:", e);
      }
    } else {
      updatedChecked = checkedIds.filter((item) => item !== id);
    }

    setCheckedIds(updatedChecked);
    await saveState(updatedChecked, reminders);
  };

  // Add custom reminder
  const handleAddReminder = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Missing Title", "Please enter a reminder title.");
      return;
    }

    const newReminder: ReminderItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      time: newTime.trim() || "08:00 AM",
      icon: "bell-ring-outline",
      color: "#f59e0b",
      isCustom: true,
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    await saveState(checkedIds, updated);

    setNewTitle("");
    setNewTime("08:00 AM");
    setModalVisible(false);
    Alert.alert("Reminder Added", `"${newReminder.title}" added to your daily checklist.`);
  };

  const completedCount = checkedIds.length;
  const progressPct = Math.round((completedCount / Math.max(reminders.length, 1)) * 100);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0c0e12" />

      {/* Top Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.85)" />
        </Pressable>
        <Text style={s.headerTitle}>Daily Reminders</Text>
        <Pressable onPress={() => setModalVisible(true)} style={s.iconBtn}>
          <Ionicons name="add" size={24} color="#60a5fa" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero Progress Banner */}
        <LinearGradient
          colors={["#1e3a8a", "#2563eb", "#0d9488"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroSubtitle}>TODAY'S HABIT CHECKLIST</Text>
              <Text style={s.heroTitle}>
                {completedCount} of {reminders.length} Done
              </Text>
            </View>
            <View style={s.percentBadge}>
              <Text style={s.percentText}>{progressPct}%</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPct}%` }]} />
          </View>

          <View style={s.heroFooter}>
            <Ionicons name="sparkles" size={14} color="#f59e0b" />
            <Text style={s.heroFooterText}>Earn +10 reward points for every habit checked off</Text>
          </View>
        </LinearGradient>

        {/* Section Header */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Checklist</Text>
          <Pressable style={s.addBtnSmall} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={16} color="#60a5fa" />
            <Text style={s.addBtnSmallText}>Add Reminder</Text>
          </Pressable>
        </View>

        {/* Checklist Cards */}
        <View style={s.listWrap}>
          {reminders.map((r) => {
            const isChecked = checkedIds.includes(r.id);
            return (
              <Pressable
                key={r.id}
                onPress={() => handleToggle(r.id, r.title)}
                style={[s.checkCard, isChecked && s.checkCardDone]}
              >
                {/* Checkbox */}
                <View style={[s.checkbox, isChecked && s.checkboxChecked]}>
                  {isChecked && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </View>

                {/* Icon wrapper */}
                <View style={[s.iconWrap, { backgroundColor: `${r.color}22` }]}>
                  <MaterialCommunityIcons name={r.icon} size={22} color={r.color} />
                </View>

                {/* Info */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[s.cardTitle, isChecked && s.cardTitleDone]}>
                      {r.title}
                    </Text>
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeText}>{r.category}</Text>
                    </View>
                  </View>
                  <Text style={s.cardTime}>⏰ {r.time}</Text>
                </View>

                {/* Points Tag */}
                <View style={s.pointsTag}>
                  <Ionicons name="sparkles" size={11} color="#f59e0b" />
                  <Text style={s.pointsTagText}>+10</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Custom Reminder Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Daily Reminder</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            <Text style={s.inputLabel}>Reminder Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Green Tea, Multivitamin, Walk Dog"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={s.inputLabel}>Scheduled Time</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 08:30 AM"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newTime}
              onChangeText={setNewTime}
            />

            <Text style={s.inputLabel}>Category</Text>
            <View style={s.catRow}>
              {["Daily", "Nutrition", "Fitness", "Hygiene", "Wellness"].map((c) => {
                const isSelected = newCategory === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setNewCategory(c)}
                    style={[s.catPill, isSelected && s.catPillActive]}
                  >
                    <Text style={[s.catPillText, isSelected && s.catPillTextActive]}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={s.saveBtn} onPress={handleAddReminder}>
              <Text style={s.saveBtnText}>Save to Checklist</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <SamsungBottomNav />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#ffffff" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { paddingHorizontal: 16 },

  // Hero
  hero: {
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
  heroSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  percentBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  percentText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroFooterText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },

  // Section
  sectionRow: {
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
  addBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addBtnSmallText: {
    fontSize: 12,
    color: "#60a5fa",
    fontWeight: "600",
  },

  // List
  listWrap: {
    gap: 10,
  },
  checkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2128",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  checkCardDone: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardTitleDone: {
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.45)",
  },
  catBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  cardTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  pointsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pointsTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fbbf24",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#181a20",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
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
    fontSize: 14,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  catPill: {
    backgroundColor: "#22252e",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catPillActive: {
    backgroundColor: "#2563eb",
    borderColor: "#60a5fa",
  },
  catPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  catPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
