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
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import { getDailyActivityTotals } from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;
const { width: SW } = Dimensions.get("window");

const PROFILE_STORAGE_KEY = "@urban_health_user_profile_v2";

interface UserProfileData {
  username: string;
  gender: string;
  height: string;
  weight: string;
  dob: string;
  activityLevel: number; // 1 to 4
  avatarIndex: number;
}

const AVATAR_PRESETS = [
  { id: 0, bg: "#7fd3be", icon: "user-tie", color: "#1e3a8a" },
  { id: 1, bg: "#fbcfe8", icon: "female", color: "#be185d" },
  { id: 2, bg: "#fed7aa", icon: "user-alt", color: "#c2410c" },
  { id: 3, bg: "#bbf7d0", icon: "running", color: "#15803d" },
  { id: 4, bg: "#6ee7b7", icon: "user", color: "#047857" },
];

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              navigation.replace("Welcome" as any);
            } catch (e) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  // Profile data
  const defaultUsername = user?.email ? user.email.split("@")[0] : "vichuvisweswaran82";
  const [profile, setProfile] = useState<UserProfileData>({
    username: defaultUsername,
    gender: "Male",
    height: "174 cm",
    weight: "68 kg",
    dob: "28 Jan 2001",
    activityLevel: 2,
    avatarIndex: 0,
  });

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState(defaultUsername);
  const [editGender, setEditGender] = useState("Male");
  const [editHeight, setEditHeight] = useState("174 cm");
  const [editWeight, setEditWeight] = useState("68 kg");
  const [editDob, setEditDob] = useState("28 Jan 2001");
  const [editLevel, setEditLevel] = useState(2);
  const [editAvatarIdx, setEditAvatarIdx] = useState(0);

  // Dynamic activity stats
  const [todaySteps, setTodaySteps] = useState(58);
  const [todayDistKm, setTodayDistKm] = useState(0.04);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setProfile(parsed);
          setEditUsername(parsed.username || defaultUsername);
          setEditGender(parsed.gender || "Male");
          setEditHeight(parsed.height || "174 cm");
          setEditWeight(parsed.weight || "68 kg");
          setEditDob(parsed.dob || "28 Jan 2001");
          setEditLevel(parsed.activityLevel || 2);
          setEditAvatarIdx(parsed.avatarIndex || 0);
        }

        const act = await getDailyActivityTotals();
        if (act.count > 0) {
          setTodaySteps(Math.max(58, act.totalMins * 105));
          setTodayDistKm(act.totalDistanceKm > 0 ? act.totalDistanceKm : Number((act.totalMins * 0.07).toFixed(2)));
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    })();
  }, []);

  const handleOpenEdit = () => {
    setEditUsername(profile.username);
    setEditGender(profile.gender);
    setEditHeight(profile.height);
    setEditWeight(profile.weight);
    setEditDob(profile.dob);
    setEditLevel(profile.activityLevel);
    setEditAvatarIdx(profile.avatarIndex);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    const updated: UserProfileData = {
      username: editUsername.trim() || defaultUsername,
      gender: editGender.trim() || "Not specified",
      height: editHeight.trim() || "174 cm",
      weight: editWeight.trim() || "68 kg",
      dob: editDob.trim() || "28 Jan 2001",
      activityLevel: editLevel,
      avatarIndex: editAvatarIdx,
    };
    setProfile(updated);
    setEditModalVisible(false);
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Top Header ────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>My page</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── 1. Top Profile Card ───────────────────────────────── */}
        <View style={s.profileCard}>
          {/* Edit Button */}
          <Pressable style={s.editBtn} onPress={handleOpenEdit}>
            <Text style={s.editBtnText}>Edit</Text>
          </Pressable>

          {/* Large Avatar */}
          <View style={s.avatarWrap}>
            <LinearGradient
              colors={["#7fd3be", "#5cbda6"]}
              style={s.avatarCircle}
            >
              <Ionicons name="person" size={54} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          </View>

          {/* Username */}
          <Text style={s.usernameText}>{profile.username}</Text>

          {/* Friends & QR Code Action Buttons */}
          <View style={s.profileActionRow}>
            <Pressable
              style={s.profileActionBtn}
              onPress={() => Alert.alert("Friends", "Syncing contacts with Urban Health Together...")}
            >
              <Text style={s.profileActionBtnText}>Friends</Text>
            </Pressable>
            <Pressable
              style={s.profileActionBtn}
              onPress={() => Alert.alert("My QR code", `Your Health ID QR:\n${profile.username}`)}
            >
              <Text style={s.profileActionBtnText}>My QR code</Text>
            </Pressable>
          </View>
        </View>

        {/* ── 2. Weekly Report Card ─────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Weekly report</Text>
          <Text style={s.cardSubtitle}>30 Aug–5 Sept</Text>

          <View style={s.reportGrid}>
            {/* Column 1: Average Daily Steps */}
            <View style={s.reportCol}>
              <View style={s.metricLabelRow}>
                <Ionicons name="footsteps" size={14} color="#22c55e" />
                <Text style={s.metricLabel}>Average daily steps</Text>
              </View>
              <Text style={s.prevWeekText}>Previous week 7,703</Text>

              <View style={s.deltaBadgeGreen}>
                <Ionicons name="caret-down" size={12} color="#86efac" />
                <Text style={s.deltaBadgeText}>7,645</Text>
              </View>

              <Text style={s.bigStatValue}>{todaySteps}</Text>
            </View>

            {/* Vertical Divider */}
            <View style={s.reportDivider} />

            {/* Column 2: Average Distance */}
            <View style={s.reportCol}>
              <View style={s.metricLabelRow}>
                <Ionicons name="footsteps" size={14} color="#22c55e" />
                <Text style={s.metricLabel}>Average distance</Text>
              </View>
              <Text style={s.prevWeekText}>Previous week 5.48 km</Text>

              <View style={s.deltaBadgeGreen}>
                <Ionicons name="caret-down" size={12} color="#86efac" />
                <Text style={s.deltaBadgeText}>5.44 km</Text>
              </View>

              <Text style={s.bigStatValue}>
                {todayDistKm} <Text style={s.bigStatUnit}>km</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── 3. Badges Card ────────────────────────────────────── */}
        <View style={s.card}>
          <Pressable
            style={s.cardHeaderRow}
            onPress={() => Alert.alert("Badges", "10,000 steps Badge earned on 15 Aug!")}
          >
            <Text style={s.cardTitle}>Badges</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* 3D Metallic 10,000 Steps Badge */}
          <View style={s.badgeDisplayWrap}>
            <View style={s.goldBadgeOuter}>
              <LinearGradient colors={["#34d399", "#10b981", "#059669"]} style={s.goldBadgeInner}>
                <Ionicons name="walk" size={38} color="#ffffff" style={{ opacity: 0.95 }} />
                <View style={s.badgePill10000}>
                  <Text style={s.badgePill10000Text}>10000</Text>
                </View>
              </LinearGradient>
            </View>
            <Text style={s.badgeName}>10,000 steps</Text>
            <Text style={s.badgeDate}>15 Aug</Text>
          </View>
        </View>

        {/* ── 4. Personal Best Card ─────────────────────────────── */}
        <View style={s.card}>
          <Pressable
            style={s.cardHeaderRow}
            onPress={() => Alert.alert("Personal Best", "Your all-time step record is 14,653 steps!")}
          >
            <Text style={s.cardTitle}>Personal best</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* 3D Golden Flying Running Shoe */}
          <View style={s.personalBestWrap}>
            <View style={s.goldenShoeArtWrap}>
              <LinearGradient
                colors={["#fde68a", "#d97706", "#b45309"]}
                style={s.goldenRibbonBack}
              />
              <View style={s.goldenShoeIconWrap}>
                <FontAwesome5 name="running" size={44} color="#fde047" />
              </View>
            </View>
            <Text style={s.personalBestValue}>14,653</Text>
            <Text style={s.personalBestLabel}>Most steps</Text>
          </View>
        </View>

        {/* ── 5. Challenges Card ────────────────────────────────── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Challenges</Text>
          <View style={s.emptyStateWrap}>
            <Text style={s.emptyStateText}>No challenges</Text>
          </View>
        </View>

        {/* ── 6. Global Challenge Card ──────────────────────────── */}
        <View style={s.card}>
          <Pressable
            style={s.cardHeaderRow}
            onPress={() => Alert.alert("Global Challenge", "Join monthly Urban Health Global walk-a-thons!")}
          >
            <Text style={s.cardTitle}>Global challenge</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <View style={s.emptyStateWrap}>
            <Text style={s.emptyStateText}>No badges earned this year</Text>
          </View>
        </View>

        {/* ── Sign Out Button ───────────────────────────────── */}
        <Pressable style={s.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          <Text style={s.signOutBtnText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          EDIT PROFILE MODAL (Matches Screenshot 3 & 4)
          ═══════════════════════════════════════════════════════════ */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.editContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.editScroll}>
              {/* Squircle Profile Picture Card */}
              <View style={s.editAvatarCard}>
                <LinearGradient
                  colors={["#7fd3be", "#5ebda6"]}
                  style={s.editAvatarSquircle}
                >
                  <View style={s.thinWhiteCircle}>
                    <Text style={s.addPicText}>Add a profile picture</Text>
                  </View>
                </LinearGradient>

                {/* 5 Avatar Presets Row */}
                <View style={s.avatarPresetsRow}>
                  {AVATAR_PRESETS.map((av) => (
                    <Pressable
                      key={av.id}
                      onPress={() => setEditAvatarIdx(av.id)}
                      style={[
                        s.avatarPresetCircle,
                        { backgroundColor: av.bg },
                        editAvatarIdx === av.id && s.avatarPresetCircleActive,
                      ]}
                    >
                      <FontAwesome5 name={av.icon as any} size={18} color={av.color} />
                    </Pressable>
                  ))}
                  {/* Plus button preset */}
                  <Pressable
                    style={s.avatarPresetPlus}
                    onPress={() => Alert.alert("Upload Photo", "Choose photo from Gallery or take with Camera.")}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </Pressable>
                </View>

                {/* Gallery / Camera Buttons */}
                <View style={s.photoSourceRow}>
                  <Pressable
                    style={s.photoSourceBtn}
                    onPress={() => Alert.alert("Gallery", "Opening device photo gallery...")}
                  >
                    <Text style={s.photoSourceBtnText}>Gallery</Text>
                  </Pressable>
                  <Pressable
                    style={s.photoSourceBtn}
                    onPress={() => Alert.alert("Camera", "Opening camera...")}
                  >
                    <Text style={s.photoSourceBtnText}>Camera</Text>
                  </Pressable>
                </View>
              </View>

              {/* Username Input Card */}
              <View style={s.editFieldCardSingle}>
                <TextInput
                  style={s.editInputUsername}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              {/* Personal Details Card */}
              <View style={s.editDetailsCard}>
                {/* Gender */}
                <View style={s.detailRow}>
                  <Ionicons name="person" size={20} color="rgba(255,255,255,0.7)" style={s.detailIcon} />
                  <TextInput
                    style={s.detailInput}
                    value={editGender}
                    onChangeText={setEditGender}
                    placeholder="Gender"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={s.detailSeparator} />

                {/* Height */}
                <View style={s.detailRow}>
                  <MaterialCommunityIcons name="human-male-height" size={22} color="rgba(255,255,255,0.7)" style={s.detailIcon} />
                  <TextInput
                    style={s.detailInput}
                    value={editHeight}
                    onChangeText={setEditHeight}
                    placeholder="Height"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={s.detailSeparator} />

                {/* Weight */}
                <View style={s.detailRow}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color="rgba(255,255,255,0.7)" style={s.detailIcon} />
                  <TextInput
                    style={s.detailInput}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    placeholder="Weight"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={s.detailSeparator} />

                {/* DOB */}
                <View style={s.detailRow}>
                  <Ionicons name="calendar-outline" size={20} color="rgba(255,255,255,0.7)" style={s.detailIcon} />
                  <TextInput
                    style={s.detailInput}
                    value={editDob}
                    onChangeText={setEditDob}
                    placeholder="Date of Birth (e.g. 28 Jan 2001)"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              {/* Disclaimer Note */}
              <Text style={s.disclaimerText}>
                Gender, height, weight, and date of birth are used to calculate values like calories burnt, optimal calorie intake, and heart rate ranges during exercise.{"\n\n"}
                You don't have to provide this information, but the health recommendations you get will be more accurate if you do.
              </Text>

              {/* Activity Level Card */}
              <View style={s.activityLevelCard}>
                <Text style={s.activityLevelTitle}>Activity level</Text>

                <View style={s.levelCirclesRow}>
                  {[1, 2, 3, 4].map((lvl) => (
                    <View key={lvl} style={s.levelCol}>
                      <Pressable
                        onPress={() => setEditLevel(lvl)}
                        style={[
                          s.levelCircle,
                          editLevel === lvl && s.levelCircleActive,
                        ]}
                      >
                        <Ionicons
                          name={
                            lvl === 1
                              ? "body"
                              : lvl === 2
                              ? "walk"
                              : lvl === 3
                              ? "fitness"
                              : "flash"
                          }
                          size={22}
                          color={editLevel === lvl ? "#ffffff" : "rgba(255,255,255,0.5)"}
                        />
                      </Pressable>
                      <Text style={[s.levelNumber, editLevel === lvl && s.levelNumberActive]}>
                        {lvl}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={s.levelPrompt}>Select your activity level.</Text>
              </View>

              <View style={{ height: 90 }} />
            </ScrollView>

            {/* Bottom Floating Cancel / Save Dock */}
            <View style={s.editBottomDock}>
              <Pressable style={s.dockCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={s.dockCancelText}>Cancel</Text>
              </Pressable>
              <View style={s.dockDivider} />
              <Pressable style={s.dockSaveBtn} onPress={handleSaveEdit}>
                <Text style={s.dockSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,107,107,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  signOutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ff6b6b",
  },
  root: { flex: 1, backgroundColor: "#000000" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#16181e",
    borderRadius: 26,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  editBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    backgroundColor: "#292b33",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  avatarWrap: {
    marginBottom: 16,
  },
  avatarCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  profileActionRow: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
  },
  profileActionBtn: {
    flex: 1,
    backgroundColor: "#292b33",
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: "center",
  },
  profileActionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Generic Card
  card: {
    backgroundColor: "#16181e",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 18,
  },

  // Weekly Report
  reportGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reportCol: {
    flex: 1,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  prevWeekText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 10,
  },
  deltaBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1e3a2b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  deltaBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#86efac",
  },
  bigStatValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  bigStatUnit: {
    fontSize: 18,
    fontWeight: "400",
    color: "rgba(255,255,255,0.7)",
  },
  reportDivider: {
    width: 1,
    height: "85%",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 12,
    marginTop: 6,
  },

  // Badge Display
  badgeDisplayWrap: {
    alignItems: "center",
    paddingVertical: 12,
  },
  goldBadgeOuter: {
    width: 86,
    height: 94,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fde047",
    overflow: "hidden",
    marginBottom: 12,
    elevation: 6,
  },
  goldBadgeInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badgePill10000: {
    position: "absolute",
    bottom: 6,
    borderWidth: 1.5,
    borderColor: "#fde047",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgePill10000Text: {
    fontSize: 9,
    fontWeight: "900",
    color: "#fde047",
    letterSpacing: 0.5,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  badgeDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  // Personal Best
  personalBestWrap: {
    alignItems: "center",
    paddingVertical: 14,
  },
  goldenShoeArtWrap: {
    width: 88,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  goldenRibbonBack: {
    position: "absolute",
    width: 50,
    height: 70,
    borderRadius: 16,
    transform: [{ rotate: "35deg" }],
    opacity: 0.5,
  },
  goldenShoeIconWrap: {
    transform: [{ rotate: "-15deg" }],
  },
  personalBestValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 2,
  },
  personalBestLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  // Empty State in card
  emptyStateWrap: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },

  // ═══════════════════════════════════════════════════════════
  // EDIT MODAL STYLES
  // ═══════════════════════════════════════════════════════════
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  editContainer: {
    backgroundColor: "#000000",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: "92%",
  },
  editScroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  // Squircle Picture Card
  editAvatarCard: {
    backgroundColor: "#16181e",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
  },
  editAvatarSquircle: {
    width: 170,
    height: 170,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  thinWhiteCircle: {
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  addPicText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  avatarPresetsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  avatarPresetCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarPresetCircleActive: {
    borderColor: "#ffffff",
  },
  avatarPresetPlus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  photoSourceRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  photoSourceBtn: {
    flex: 1,
    backgroundColor: "#292b33",
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: "center",
  },
  photoSourceBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Single Field Card
  editFieldCardSingle: {
    backgroundColor: "#16181e",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
  },
  editInputUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Details Multi-row Card
  editDetailsCard: {
    backgroundColor: "#16181e",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailIcon: {
    width: 32,
  },
  detailInput: {
    flex: 1,
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "500",
  },
  detailSeparator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  disclaimerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  // Activity Level Card
  activityLevelCard: {
    backgroundColor: "#16181e",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  activityLevelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  levelCirclesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 14,
  },
  levelCol: {
    alignItems: "center",
    gap: 8,
  },
  levelCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#292b33",
    justifyContent: "center",
    alignItems: "center",
  },
  levelCircleActive: {
    backgroundColor: "#3b82f6",
  },
  levelNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  levelNumberActive: {
    color: "#ffffff",
  },
  levelPrompt: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 4,
  },

  // Floating Bottom Dock
  editBottomDock: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 260,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(45, 50, 60, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    elevation: 10,
  },
  dockCancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dockCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  dockDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dockSaveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dockSaveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
