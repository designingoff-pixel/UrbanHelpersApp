import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
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
import {
  FitnessVideo,
  FitnessCategory,
  subscribeToFitnessVideos,
  openYouTubeVideo,
} from "@/services/fitnessVideoService";

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

const FILTER_CATEGORIES: FitnessCategory[] = [
  "All",
  "Workout",
  "Yoga",
  "Cardio",
  "Strength",
  "Pilates",
  "Stretching",
  "Meditation",
  "Running",
  "Nutrition",
];

export default function FitnessDashboardScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [loggedActivities, setLoggedActivities] = useState<ActivityItem[]>([]);
  const [totals, setTotals] = useState({ totalMins: 0, totalCalories: 0, totalDistanceKm: 0, count: 0 });
  const [modalVisible, setModalVisible] = useState(false);

  // Real-time Fitness Videos from Firestore
  const [videos, setVideos] = useState<FitnessVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FitnessCategory>("All");
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Form states for record workout
  const [selectedType, setSelectedType] = useState<ActivityType>("running");
  const [title, setTitle] = useState("");
  const [durationMins, setDurationMins] = useState("30");
  const [distanceKm, setDistanceKm] = useState("3.5");
  const [caloriesBurned, setCaloriesBurned] = useState("210");

  const loadLoggedActivities = async () => {
    const list = await getActivities();
    const tot = await getDailyActivityTotals();
    setLoggedActivities(list);
    setTotals(tot);
  };

  useEffect(() => {
    loadLoggedActivities();

    // Subscribe to live Firestore fitness videos
    setLoadingVideos(true);
    const unsubscribe = subscribeToFitnessVideos((items) => {
      setVideos(items);
      setLoadingVideos(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered videos based on active category
  const filteredVideos = useMemo(() => {
    if (selectedCategory === "All") return videos;
    return videos.filter(
      (v) => v.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [videos, selectedCategory]);

  // Featured video for top showcase banner
  const featuredVideo = useMemo(() => {
    return videos.find((v) => v.isFeatured) || videos[0] || null;
  }, [videos]);

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
        <Text style={s.headerTitle}>Fitness</Text>
        <View style={s.headerActions}>
          <Pressable style={s.headerIconBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#4ade80" />
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
              Get weekly workout targets and stream real-time training videos.
            </Text>
            <Pressable style={s.recordWorkoutBtn} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={16} color="#4ade80" />
              <Text style={s.recordWorkoutBtnText}>Record workout</Text>
            </Pressable>
          </View>

          {/* Spiderweb / Radar Pentagon Graphic */}
          <View style={s.radarWrap}>
            <Svg width={110} height={110} viewBox="0 0 110 110">
              <Polygon
                points="55,10 97,41 81,89 29,89 13,41"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.2"
              />
              <Polygon
                points="55,24 84,45 73,78 37,78 26,45"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              <Polygon
                points="55,38 72,50 65,70 45,70 38,50"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <Line x1="55" y1="55" x2="55" y2="10" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="97" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="81" y2="89" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="29" y2="89" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Line x1="55" y1="55" x2="13" y2="41" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <Polygon
                points="55,16 90,44 76,82 34,75 22,46"
                fill="rgba(74, 222, 128, 0.38)"
                stroke="#4ade80"
                strokeWidth="2"
              />
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

        {/* ── Real-Time Fitness Videos Showcase ─────────────────────── */}
        <View style={s.videosContainer}>
          {/* Section Header */}
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>Fitness Classes & Workouts</Text>
              <View style={s.liveRedDot} />
            </View>
            <Text style={s.videoCountBadge}>
              {videos.length} {videos.length === 1 ? "Video" : "Videos"}
            </Text>
          </View>

          {/* Category Filter Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.catPillsRow}
          >
            {FILTER_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[s.catPill, isSelected && s.catPillActive]}
                >
                  <Text style={[s.catPillText, isSelected && s.catPillTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Featured Video Showcase Banner */}
          {featuredVideo && selectedCategory === "All" && (
            <Pressable
              style={s.featuredCard}
              onPress={() => openYouTubeVideo(featuredVideo)}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={s.featuredThumbWrap}>
                <Image
                  source={{ uri: featuredVideo.thumbnailUrl }}
                  style={s.featuredThumbImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.92)"]}
                  style={s.featuredGradient}
                />

                {/* Top Badges */}
                <View style={s.featuredTopBadges}>
                  <View style={s.featuredCatBadge}>
                    <Text style={s.featuredCatBadgeText}>{featuredVideo.category}</Text>
                  </View>
                  {featuredVideo.isFeatured && (
                    <View style={s.featuredStarBadge}>
                      <Ionicons name="star" size={10} color="#ffffff" />
                      <Text style={s.featuredStarBadgeText}>FEATURED</Text>
                    </View>
                  )}
                </View>

                {/* Big Center Red YouTube Play Button */}
                <View style={s.playBtnCenter}>
                  <View style={s.ytPlayCircle}>
                    <Ionicons name="play" size={24} color="#ffffff" style={{ marginLeft: 3 }} />
                  </View>
                </View>

                {/* Bottom Video Meta Overlay */}
                <View style={s.featuredBottomMeta}>
                  <Text style={s.featuredTitle} numberOfLines={2}>
                    {featuredVideo.title}
                  </Text>
                  <View style={s.featuredSubRow}>
                    <Text style={s.featuredInstructor}>
                      <Ionicons name="person-outline" size={12} color="rgba(255,255,255,0.7)" />{" "}
                      {featuredVideo.instructor} · {featuredVideo.duration}
                    </Text>
                    <View style={s.difficultyPill}>
                      <Text style={s.difficultyText}>{featuredVideo.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          )}

          {/* Video List Loading / Empty / Content */}
          {loadingVideos ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color="#4ade80" />
              <Text style={s.loadingText}>Syncing fitness videos…</Text>
            </View>
          ) : filteredVideos.length === 0 ? (
            <View style={s.emptyStateCard}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="videocam-outline" size={32} color="#4ade80" />
              </View>
              <Text style={s.emptyTitle}>No Videos in this Category</Text>
              <Text style={s.emptySubtitle}>
                Add YouTube workout links in the Admin Web Control Center to stream classes in real-time.
              </Text>
            </View>
          ) : (
            <View style={s.videosGrid}>
              {filteredVideos.map((video) => (
                <Pressable
                  key={video.id}
                  style={s.videoCard}
                  onPress={() => openYouTubeVideo(video)}
                  android_ripple={{ color: "rgba(255,255,255,0.15)" }}
                >
                  {/* Thumbnail */}
                  <View style={s.videoThumb}>
                    <Image
                      source={{ uri: video.thumbnailUrl }}
                      style={s.videoThumbImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      style={s.videoThumbGradient}
                    />

                    {/* Category Pill */}
                    <View style={s.videoCatPill}>
                      <Text style={s.videoCatPillText}>{video.category}</Text>
                    </View>

                    {/* Duration Badge */}
                    <View style={s.videoDurationBadge}>
                      <Ionicons name="time-outline" size={10} color="#ffffff" />
                      <Text style={s.videoDurationText}>{video.duration}</Text>
                    </View>

                    {/* YouTube Logo Badge */}
                    <View style={s.ytBadge}>
                      <Ionicons name="logo-youtube" size={20} color="#ff0000" />
                    </View>
                  </View>

                  {/* Details */}
                  <View style={s.videoDetails}>
                    <Text style={s.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View style={s.videoMetaRow}>
                      <Text style={s.videoMetaText} numberOfLines={1}>
                        {video.instructor}
                      </Text>
                      <View style={s.difficultyPillSmall}>
                        <Text style={s.difficultyTextSmall}>{video.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
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

            <Text style={s.inputLabel}>Workout Name / Title (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Morning Run, Upper Body Blast"
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
                  placeholder="30"
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
                  placeholder="200"
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
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: "#0c0e12",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
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

  // 1. Fitness Index Card
  fitnessIndexCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#181a20",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  fitnessIndexTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  fitnessIndexTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  fitnessIndexDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 14,
  },
  recordWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.25)",
  },
  recordWorkoutBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
  },
  radarWrap: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },

  // Today's Logged Workouts
  loggedSection: {
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  liveRedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ef4444",
  },
  statsSummary: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4ade80",
  },
  videoCountBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
  },
  loggedList: {
    gap: 10,
  },
  loggedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#181a20",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  loggedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loggedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  loggedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  loggedMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },

  // Real-time Videos Section
  videosContainer: {
    marginTop: 4,
  },
  catPillsRow: {
    gap: 8,
    paddingBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catPillActive: {
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
  },
  catPillTextActive: {
    color: "#0c0e12",
  },

  // Featured Hero Card
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#181a20",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  featuredThumbWrap: {
    width: "100%",
    height: 200,
    position: "relative",
    justifyContent: "space-between",
    padding: 14,
  },
  featuredThumbImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredTopBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredCatBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredCatBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredStarBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredStarBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
  },
  playBtnCenter: {
    alignSelf: "center",
  },
  ytPlayCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  featuredBottomMeta: {
    marginTop: "auto",
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 22,
    marginBottom: 6,
  },
  featuredSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredInstructor: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  difficultyPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Videos Grid & Cards
  videosGrid: {
    gap: 14,
  },
  videoCard: {
    backgroundColor: "#181a20",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  videoThumb: {
    width: "100%",
    height: 155,
    position: "relative",
    backgroundColor: "#000000",
  },
  videoThumbImage: {
    width: "100%",
    height: "100%",
  },
  videoThumbGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  videoCatPill: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  videoCatPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  videoDurationBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoDurationText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  ytBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  videoDetails: {
    padding: 14,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 19,
    marginBottom: 8,
  },
  videoMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoMetaText: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    flex: 1,
  },
  difficultyPillSmall: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  difficultyTextSmall: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },

  // Loading & Empty States
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  emptyStateCard: {
    backgroundColor: "#181a20",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginVertical: 10,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
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
