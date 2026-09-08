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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Polygon, Line, Circle } from "react-native-svg";
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

  // Form states
  const [selectedType, setSelectedType] = useState<ActivityType>("running");
  const [title, setTitle] = useState("");
  const [durationMins, setDurationMins] = useState("30");
  const [distanceKm, setDistanceKm] = useState("3.5");
  const [caloriesBurned, setCaloriesBurned] = useState("210");

  const loadData = async () => {
    const list = await getActivities();
    const tot = await getDailyActivityTotals();
    setLoggedActivities(list);
    setTotals(tot);
  };

  useEffect(() => {
    loadData();
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
    setDurationMins("30");
    setDistanceKm("");
    setCaloriesBurned("200");
    setModalVisible(false);
    await loadData();
  };

  const handleDeleteActivity = async (id: string) => {
    Alert.alert("Delete Activity", "Are you sure you want to remove this workout entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteActivity(id);
          await loadData();
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
        <Text style={s.headerTitle}>Fitness</Text>
        <View style={s.headerActions}>
          <Pressable style={s.headerIconBtn} onPress={() => Alert.alert("Favorites", "Added to favorites.")}>
            <Ionicons name="heart-outline" size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>
          <Pressable style={s.headerIconBtn} onPress={() => Alert.alert("Filter", "Filter fitness categories.")}>
            <MaterialIcons name="tune" size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>
          <Pressable style={s.headerIconBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.85)" />
            <View style={s.orangeDotBadge} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── 1. Fitness Index Card with 3D Radar Chart ───────────── */}
        <View style={s.fitnessIndexCard}>
          <View style={s.fitnessIndexTextCol}>
            <Text style={s.fitnessIndexTitle}>Fitness index</Text>
            <Text style={s.fitnessIndexDesc}>
              Get weekly workout targets and content tailored to your training focus.
            </Text>
            <Pressable style={s.recordWorkoutBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={16} color="#4ade80" />
              <Text style={s.recordWorkoutBtnText}>Record workout</Text>
            </Pressable>
          </View>

          {/* Spiderweb / Radar Pentagon Graphic */}
          <View style={s.radarWrap}>
            <Svg width={110} height={110} viewBox="0 0 110 110">
              {/* Outer pentagon ring */}
              <Polygon
                points="55,10 97,41 81,89 29,89 13,41"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.2"
              />
              {/* Middle pentagon ring */}
              <Polygon
                points="55,24 84,45 73,78 37,78 26,45"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              {/* Inner pentagon ring */}
              <Polygon
                points="55,38 72,50 65,70 45,70 38,50"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              {/* Spokes */}
              <Line x1="55" y1="55" x2="55" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="97" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="81" y2="89" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="29" y2="89" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="13" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Neon Green Polygon Data Shape */}
              <Polygon
                points="55,16 90,44 76,82 34,75 22,46"
                fill="rgba(74, 222, 128, 0.38)"
                stroke="#4ade80"
                strokeWidth="2"
              />
              {/* Vertices */}
              <Circle cx="55" cy="16" r="3" fill="#86efac" />
              <Circle cx="90" cy="44" r="3" fill="#86efac" />
              <Circle cx="76" cy="82" r="3" fill="#86efac" />
              <Circle cx="34" cy="75" r="3" fill="#86efac" />
              <Circle cx="22" cy="46" r="3" fill="#86efac" />
            </Svg>
          </View>
        </View>

        {/* ── Today's Logged Workouts (Real User Data) ──────────────── */}
        {loggedActivities.length > 0 && (
          <View style={s.loggedSection}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Today's Logged Workouts</Text>
              <Text style={s.statsSummary}>
                {totals.totalMins} min · {totals.totalCalories} kcal
              </Text>
            </View>
            <View style={s.loggedList}>
              {loggedActivities.map((act) => (
                <View key={act.id} style={s.loggedCard}>
                  <View style={s.loggedLeft}>
                    <View style={s.loggedIconWrap}>
                      <Ionicons
                        name={
                          act.type === "running"
                            ? "fitness"
                            : act.type === "cycling"
                            ? "bicycle"
                            : act.type === "gym"
                            ? "barbell"
                            : act.type === "yoga"
                            ? "body"
                            : act.type === "pilates"
                            ? "sparkles"
                            : "walk"
                        }
                        size={20}
                        color="#4ade80"
                      />
                    </View>
                    <View>
                      <Text style={s.loggedTitle}>{act.title}</Text>
                      <Text style={s.loggedMeta}>
                        {act.durationMins} mins · {act.caloriesBurned} kcal
                        {act.distanceKm ? ` · ${act.distanceKm} km` : ""}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDeleteActivity(act.id)} style={s.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 2. What's new Section ─────────────────────────────────── */}
        <View style={s.sectionContainer}>
          <Pressable style={s.sectionHeader} onPress={() => {}}>
            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>What's new</Text>
              <View style={s.titleOrangeDot} />
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={s.videoCard}>
            {/* Banner with Pilates Exercise Graphic */}
            <View style={s.videoThumb}>
              <LinearGradient
                colors={["#dbeafe", "#bfdbfe", "#93c5fd"]}
                style={s.videoThumbInner}
              >
                {/* Visual Representation of Pilates on Mat */}
                <View style={s.pilatesStudioBg}>
                  <View style={s.wallVentRow}>
                    <View style={s.wallVent} />
                    <View style={s.wallVent} />
                    <View style={s.wallVent} />
                  </View>
                  <View style={s.matShape}>
                    <View style={s.personSilhouettePelvis} />
                  </View>
                </View>
                {/* Day 11 Pill Badge */}
                <View style={s.day11Badge}>
                  <Text style={s.day11Text}>DAY 11</Text>
                  <Text style={s.day11Sub}>Pilates 01</Text>
                </View>
                {/* YouTube Logo Badge */}
                <View style={s.ytBadge}>
                  <Ionicons name="logo-youtube" size={24} color="#ff0000" />
                </View>
              </LinearGradient>
            </View>

            <View style={s.videoDetails}>
              <Text style={s.videoTitle} numberOfLines={1}>
                [Day11] Align Your Pelvis & A...
              </Text>
              <Text style={s.videoMeta}>12:01  Urban Health</Text>
            </View>
          </View>
        </View>

        {/* ── 3. 50-Day Full Body Fit Challenge Section ─────────────── */}
        <View style={s.sectionContainer}>
          <Pressable style={s.sectionHeader} onPress={() => {}}>
            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>50-Day Full Body Fit Challenge</Text>
              <View style={s.titleOrangeDot} />
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={s.videoCard}>
            <View style={s.videoThumb}>
              <LinearGradient
                colors={["#e2e8f0", "#cbd5e1", "#94a3b8"]}
                style={s.videoThumbInner}
              >
                {/* Big 50 DAYS CHALLENGE Title Overlay */}
                <Text style={s.challengeBannerTitle}>50 DAYS{"\n"}CHALLENGE</Text>
                <View style={s.challengeSubStrip}>
                  <Text style={s.challengeSubText}>Align Pelvis & Activate Deep Core Muscles</Text>
                </View>
                <View style={s.ytBadge}>
                  <Ionicons name="logo-youtube" size={24} color="#ff0000" />
                </View>
              </LinearGradient>
            </View>

            <View style={s.videoDetails}>
              <Text style={s.videoTitle} numberOfLines={1}>
                [Day11] Align Your Pelvis & Activat...
              </Text>
              <Text style={s.videoMeta}>12:01  Urban Health</Text>
            </View>
          </View>
        </View>

        {/* ── 4. Your Cardio Fix for Today's Glow Section ───────────── */}
        <View style={s.sectionContainer}>
          <Pressable style={s.sectionHeader} onPress={() => {}}>
            <Text style={s.sectionTitle}>Your Cardio Fix for Today's Glow</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={s.videoCard}>
            <View style={s.videoThumb}>
              <LinearGradient
                colors={["#93c5fd", "#60a5fa", "#3b82f6"]}
                style={s.videoThumbInner}
              >
                <View style={s.runningGuideHeader}>
                  <Ionicons name="fitness" size={14} color="#1e3a8a" />
                  <Text style={s.runningGuideBrand}>Urban Health</Text>
                </View>
                <Text style={s.runningPartTag}>ESSENTIAL RUNNING GUIDE PART.03</Text>
                <Text style={s.runningBigHeadline}>HOW TO LOSE{"\n"}WEIGHT{"\n"}BY RUNNING</Text>
                <View style={s.ytBadge}>
                  <Ionicons name="logo-youtube" size={24} color="#ff0000" />
                </View>
              </LinearGradient>
            </View>

            <View style={s.videoDetails}>
              <Text style={s.videoTitle} numberOfLines={1}>
                Essential Running Guide 03 - How ...
              </Text>
              <Text style={s.videoMeta}>06:00  Urban Health</Text>
            </View>
          </View>
        </View>

        {/* ── 5. Workout Know-hows from Sports Stars Section ────────── */}
        <View style={s.sectionContainer}>
          <Pressable style={s.sectionHeader} onPress={() => {}}>
            <Text style={s.sectionTitle}>Workout Know-hows from Sports Stars</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={s.videoCard}>
            <View style={s.videoThumb}>
              <LinearGradient
                colors={["#7dd3fc", "#38bdf8", "#0284c7"]}
                style={s.videoThumbInner}
              >
                <View style={s.tabataTagWrap}>
                  <Text style={s.tabataTag}>EASY TABATA</Text>
                </View>
                <Text style={s.tabataHeadline}>LOWER BODY BURN</Text>
                <View style={s.tabataSecBadge}>
                  <Text style={s.tabataSecText}>40 SEC</Text>
                </View>
                <View style={s.ytBadge}>
                  <Ionicons name="logo-youtube" size={24} color="#ff0000" />
                </View>
              </LinearGradient>
            </View>

            <View style={s.videoDetails}>
              <Text style={s.videoTitle} numberOfLines={1}>
                EASY TABATA! LOWER BODY BURN
              </Text>
              <Text style={s.videoMeta}>07:28  LILLIUS</Text>
            </View>
          </View>
        </View>

        {/* ── 6. Essential Running Horizontal Carousel ──────────────── */}
        <View style={s.sectionContainer}>
          <Pressable style={s.sectionHeader} onPress={() => {}}>
            <Text style={s.sectionTitle}>Essential Running</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.carouselContent}
          >
            {/* Card 1: Pre-Run Stretching */}
            <View style={s.miniCard}>
              <View style={s.miniThumb}>
                <LinearGradient colors={["#e2e8f0", "#94a3b8"]} style={s.miniThumbInner}>
                  <Ionicons name="body" size={48} color="#334155" style={{ opacity: 0.8 }} />
                  <View style={s.miniYtBadge}>
                    <Ionicons name="logo-youtube" size={18} color="#ff0000" />
                  </View>
                </LinearGradient>
              </View>
              <Text style={s.miniTitle} numberOfLines={1}>Pre-Run</Text>
              <Text style={s.miniSub}>Stretching</Text>
              <Text style={s.miniMeta}>05:12  Urban Health</Text>
            </View>

            {/* Card 2: Post-Run Stretching */}
            <View style={s.miniCard}>
              <View style={s.miniThumb}>
                <LinearGradient colors={["#fed7aa", "#fb923c"]} style={s.miniThumbInner}>
                  <Ionicons name="accessibility" size={48} color="#7c2d12" style={{ opacity: 0.8 }} />
                  <View style={s.miniYtBadge}>
                    <Ionicons name="logo-youtube" size={18} color="#ff0000" />
                  </View>
                </LinearGradient>
              </View>
              <Text style={s.miniTitle} numberOfLines={1}>Post-Run</Text>
              <Text style={s.miniSub}>Stretching</Text>
              <Text style={s.miniMeta}>06:45  Urban Health</Text>
            </View>

            {/* Card 3: Core Workout for Runners */}
            <View style={s.miniCard}>
              <View style={s.miniThumb}>
                <LinearGradient colors={["#bbf7d0", "#4ade80"]} style={s.miniThumbInner}>
                  <Ionicons name="fitness" size={48} color="#14532d" style={{ opacity: 0.8 }} />
                  <View style={s.miniYtBadge}>
                    <Ionicons name="logo-youtube" size={18} color="#ff0000" />
                  </View>
                </LinearGradient>
              </View>
              <Text style={s.miniTitle} numberOfLines={1}>Core Workout</Text>
              <Text style={s.miniSub}>For Runners</Text>
              <Text style={s.miniMeta}>09:25  Urban Health</Text>
            </View>
          </ScrollView>
        </View>

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

            {/* Title / Description */}
            <Text style={s.inputLabel}>Workout Name (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Morning Jog, Core Pilates"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={title}
              onChangeText={setTitle}
            />

            {/* Duration & Calories Row */}
            <View style={s.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Duration (mins)</Text>
                <TextInput
                  style={s.input}
                  placeholder="30"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={durationMins}
                  onChangeText={setDurationMins}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.inputLabel}>Calories (kcal)</Text>
                <TextInput
                  style={s.input}
                  placeholder="210"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="numeric"
                  value={caloriesBurned}
                  onChangeText={setCaloriesBurned}
                />
              </View>
            </View>

            {/* Distance (Optional for Run/Walk/Cycle) */}
            {(selectedType === "running" || selectedType === "walking" || selectedType === "cycling") && (
              <View>
                <Text style={s.inputLabel}>Distance (km)</Text>
                <TextInput
                  style={s.input}
                  placeholder="3.5"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={distanceKm}
                  onChangeText={setDistanceKm}
                />
              </View>
            )}

            {/* Save Button */}
            <Pressable style={s.saveBtn} onPress={handleSaveActivity}>
              <Text style={s.saveBtnText}>Save Workout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0e12" },

  // Top Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconBtn: {
    padding: 4,
    position: "relative",
  },
  orangeDotBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff6a00",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  // 1. Fitness Index Card
  fitnessIndexCard: {
    backgroundColor: "#181a20",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  fitnessIndexTextCol: {
    flex: 1,
    marginRight: 12,
  },
  fitnessIndexTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  fitnessIndexDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 19,
    marginBottom: 14,
  },
  recordWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  recordWorkoutBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ade80",
  },
  radarWrap: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },

  // Logged Activities
  loggedSection: {
    marginBottom: 22,
  },
  statsSummary: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ade80",
  },
  loggedList: {
    gap: 8,
  },
  loggedCard: {
    backgroundColor: "#161820",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  loggedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loggedIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  loggedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  loggedMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  deleteBtn: {
    padding: 6,
  },

  // Section Generic
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  titleOrangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff6a00",
  },

  // Large Video Card
  videoCard: {
    backgroundColor: "#181a20",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  videoThumb: {
    width: "100%",
    height: 180,
    backgroundColor: "#1e293b",
  },
  videoThumbInner: {
    flex: 1,
    position: "relative",
    padding: 16,
    justifyContent: "center",
  },
  ytBadge: {
    position: "absolute",
    bottom: 12,
    left: 14,
    backgroundColor: "white",
    borderRadius: 6,
    paddingHorizontal: 2,
    elevation: 3,
  },
  videoDetails: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  // Pilates Graphics
  pilatesStudioBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wallVentRow: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    top: 10,
    right: 20,
  },
  wallVent: {
    width: 32,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 2,
  },
  matShape: {
    width: 140,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    transform: [{ skewX: "-20deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  personSilhouettePelvis: {
    width: 70,
    height: 16,
    backgroundColor: "#334155",
    borderRadius: 8,
  },
  day11Badge: {
    position: "absolute",
    bottom: 12,
    left: 54,
    backgroundColor: "rgba(30, 58, 138, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  day11Text: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  day11Sub: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
  },

  // 50 Days Banner
  challengeBannerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1,
  },
  challengeSubStrip: {
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  challengeSubText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1e293b",
  },

  // Running Guide Banner
  runningGuideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  runningGuideBrand: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  runningPartTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1e40af",
    letterSpacing: 0.5,
  },
  runningBigHeadline: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e3a8a",
    lineHeight: 22,
    marginTop: 2,
  },

  // Tabata Banner
  tabataTagWrap: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  tabataTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  tabataHeadline: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 4,
  },
  tabataSecBadge: {
    position: "absolute",
    right: 18,
    top: 24,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabataSecText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
  },

  // Horizontal Carousel
  carouselContent: {
    gap: 12,
  },
  miniCard: {
    width: 140,
    backgroundColor: "#181a20",
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  miniThumb: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  miniThumbInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  miniYtBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 1,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  miniSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  miniMeta: {
    fontSize: 10,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
  },

  // Floating Scroll-To-Top Button
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
