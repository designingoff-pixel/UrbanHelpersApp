import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Meditation">;

const { width: SW } = Dimensions.get("window");

export default function MeditationScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"Meditate" | "Sleep stories" | "Music">("Meditate");

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0f26" />

      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Meditation</Text>
        <Pressable
          onPress={() => Alert.alert("Options", "Meditation options and Calm account sync")}
          style={s.headerBtn}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
        </Pressable>
      </View>

      {/* Segmented Tabs: [Meditate] [Sleep stories] [Music] */}
      <View style={s.tabsWrap}>
        {(["Meditate", "Sleep stories", "Music"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[s.tabPill, activeTab === tab && s.tabPillActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: MEDITATE (Screenshots 7 & 8) */}
        {activeTab === "Meditate" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            {/* Recommended for you */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Recommended for you</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>
              {/* Daily Calm */}
              <Pressable
                style={s.mediaCard}
                onPress={() => Alert.alert("Daily Calm", "Playing today's 10-minute mindfulness session...")}
              >
                <LinearGradient
                  colors={["#0284c7", "#0369a1", "#075985"]}
                  style={s.mediaImageGradient}
                >
                  <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.7)" style={s.lockIcon} />
                </LinearGradient>
                <Text style={s.mediaTitle}>Daily Calm</Text>
                <Text style={s.mediaSub}>10 mins · Mindfulness</Text>
              </Pressable>

              {/* 7 Days of Self-Esteem */}
              <Pressable
                style={s.mediaCard}
                onPress={() => Alert.alert("7 Days of Self-Esteem", "Starting Day 1...")}
              >
                <LinearGradient
                  colors={["#c084fc", "#9333ea", "#6b21a8"]}
                  style={s.mediaImageGradient}
                />
                <Text style={s.mediaTitle}>7 Days of Self-Esteem</Text>
                <Text style={s.mediaSub}>Series · 7 sessions</Text>
              </Pressable>
            </ScrollView>

            {/* Sleep */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Sleep</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>
              <Pressable style={s.mediaCard} onPress={() => Alert.alert("7 Days of Sleep", "Playing...")}>
                <LinearGradient colors={["#1e1b4b", "#312e81", "#1e1b4b"]} style={s.mediaImageGradient} />
                <Text style={s.mediaTitle}>7 Days of Sleep</Text>
                <Text style={s.mediaSub}>Series · Deep Rest</Text>
              </Pressable>

              <Pressable style={s.mediaCard} onPress={() => Alert.alert("Bedtime Body Scan", "Playing...")}>
                <LinearGradient colors={["#0f172a", "#1e293b", "#334155"]} style={s.mediaImageGradient} />
                <Text style={s.mediaTitle}>Bedtime Body Scan</Text>
                <Text style={s.mediaSub}>15 mins</Text>
              </Pressable>
            </ScrollView>

            {/* Anxiety */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Anxiety</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>
              <Pressable style={s.mediaCard} onPress={() => Alert.alert("Anxiety Release", "Playing...")}>
                <LinearGradient colors={["#38bdf8", "#0284c7", "#0c4a6e"]} style={s.mediaImageGradient} />
                <Text style={s.mediaTitle}>Anxiety Release</Text>
                <Text style={s.mediaSub}>8 mins</Text>
              </Pressable>

              <Pressable style={s.mediaCard} onPress={() => Alert.alert("7 Days of Managing Stress", "Playing...")}>
                <LinearGradient colors={["#fb923c", "#f97316", "#c2410c"]} style={s.mediaImageGradient} />
                <Text style={s.mediaTitle}>7 Days of Managing Stress</Text>
                <Text style={s.mediaSub}>Series</Text>
              </Pressable>
            </ScrollView>

            {/* Beginners */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Beginners</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalRow}>
              <Pressable style={s.mediaCard} onPress={() => Alert.alert("7 Days of Calm", "Playing...")}>
                <LinearGradient colors={["#fdba74", "#f43f5e", "#881337"]} style={s.mediaImageGradient} />
                <Text style={s.mediaTitle}>7 Days of Calm</Text>
                <Text style={s.mediaSub}>Beginner friendly</Text>
              </Pressable>

              <Pressable style={s.mediaCard} onPress={() => Alert.alert("Mindfulness Tools", "Playing...")}>
                <LinearGradient colors={["#15803d", "#166534", "#14532d"]} style={s.mediaImageGradient} />
                <Text style={s.mediaTitle}>Mindfulness Tools</Text>
                <Text style={s.mediaSub}>12 mins</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        )}

        {/* TAB 2: SLEEP STORIES (Screenshot 14) */}
        {activeTab === "Sleep stories" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            {/* Hero Sleep Story Banner */}
            <Pressable
              style={s.sleepStoryHero}
              onPress={() => Alert.alert("What is a Sleep Story?", "Sleep Stories are soothing tales that mix music and sound effects to help you drift into restful slumber.")}
            >
              <LinearGradient
                colors={["#4338ca", "#312e81", "#1e1b4b"]}
                style={s.sleepStoryHeroGrad}
              >
                <View style={s.heroTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.heroStoryTitle}>What is a Sleep Story?</Text>
                    <Text style={s.heroStoryDuration}>3 mins</Text>
                  </View>
                  <Pressable style={s.playBtn}>
                    <Text style={s.playBtnText}>Play ▶</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Fiction Category */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Fiction</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>

            {/* Peter Pan Card */}
            <Pressable
              style={s.storyFullCard}
              onPress={() => Alert.alert("Peter Pan", "Playing Peter Pan narrated sleep story...")}
            >
              <LinearGradient
                colors={["#1d4ed8", "#1e3a8a", "#0f172a"]}
                style={s.storyImageGrad}
              >
                <View style={s.newBadge}>
                  <Text style={s.newBadgeText}>NEW</Text>
                </View>
              </LinearGradient>
              <Text style={s.storyTitle}>Peter Pan</Text>
              <Text style={s.storyDesc}>
                Fly toward the second star to the right and straight on till morning.
              </Text>
              <Text style={s.storyTime}>30 mins</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* TAB 3: MUSIC (Screenshot 13) */}
        {activeTab === "Music" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Featured playlists</Text>
            </View>

            <View style={s.musicGrid}>
              {/* Sleep */}
              <Pressable style={s.musicCard} onPress={() => Alert.alert("Sleep Playlist", "Playing relaxing night sounds...")}>
                <LinearGradient colors={["#3b2f1f", "#1c140d"]} style={s.musicGrad}>
                  <Text style={s.musicGenre}>Sleep</Text>
                </LinearGradient>
                <Text style={s.musicCount}>138 songs · 5,858 mins</Text>
              </Pressable>

              {/* Nature Melodies */}
              <Pressable style={s.musicCard} onPress={() => Alert.alert("Nature Melodies", "Playing rainfall and gentle river sounds...")}>
                <LinearGradient colors={["#2d3a2c", "#121b12"]} style={s.musicGrad}>
                  <Text style={s.musicGenre}>Nature Melodies</Text>
                </LinearGradient>
                <Text style={s.musicCount}>36 songs · 1,198 mins</Text>
              </Pressable>

              {/* Relax */}
              <Pressable style={s.musicCard} onPress={() => Alert.alert("Relax Playlist", "Playing gentle acoustic tones...")}>
                <LinearGradient colors={["#243c4a", "#101d24"]} style={s.musicGrad}>
                  <Text style={s.musicGenre}>Relax</Text>
                </LinearGradient>
                <Text style={s.musicCount}>227 songs · 5,303 mins</Text>
              </Pressable>

              {/* Lullabies */}
              <Pressable style={s.musicCard} onPress={() => Alert.alert("Lullabies", "Playing calming nursery melodies...")}>
                <LinearGradient colors={["#232b47", "#0d1222"]} style={s.musicGrad}>
                  <Text style={s.musicGenre}>Lullabies</Text>
                </LinearGradient>
                <Text style={s.musicCount}>29 songs · 1,051 mins</Text>
              </Pressable>

              {/* Focus */}
              <Pressable style={s.musicCard} onPress={() => Alert.alert("Focus Playlist", "Playing deep work lo-fi & alpha waves...")}>
                <LinearGradient colors={["#4a3721", "#1e1408"]} style={s.musicGrad}>
                  <Text style={s.musicGenre}>Focus</Text>
                </LinearGradient>
                <Text style={s.musicCount}>75 songs · 1,967 mins</Text>
              </Pressable>

              {/* Others */}
              <Pressable style={s.musicCard} onPress={() => Alert.alert("Others Playlist", "Playing ambient tracks...")}>
                <LinearGradient colors={["#3b3b48", "#17171d"]} style={s.musicGrad}>
                  <Text style={s.musicGenre}>Others</Text>
                </LinearGradient>
                <Text style={s.musicCount}>326 songs · 9,475 mins</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Calm Branding Footer */}
        <View style={s.calmFooter}>
          <Text style={s.calmText}>Powered by </Text>
          <Text style={s.calmBrand}>Calm</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d0f26",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#0d0f26",
  },
  headerBtn: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  tabsWrap: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 10,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e2246",
  },
  tabPillActive: {
    backgroundColor: "#3b4280",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  tabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  horizontalRow: {
    gap: 12,
    paddingRight: 16,
  },
  mediaCard: {
    width: 170,
  },
  mediaImageGradient: {
    width: 170,
    height: 100,
    borderRadius: 16,
    justifyContent: "flex-end",
    padding: 10,
    position: "relative",
  },
  lockIcon: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 8,
  },
  mediaSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  sleepStoryHero: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 16,
  },
  sleepStoryHeroGrad: {
    padding: 20,
    height: 140,
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroStoryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroStoryDuration: {
    fontSize: 13,
    color: "#cbd5e1",
    marginTop: 4,
  },
  playBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e1b4b",
  },
  storyFullCard: {
    marginBottom: 16,
  },
  storyImageGrad: {
    height: 160,
    borderRadius: 20,
    padding: 12,
    justifyContent: "flex-start",
  },
  newBadge: {
    backgroundColor: "#ea580c",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 10,
  },
  storyDesc: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 3,
    lineHeight: 18,
  },
  storyTime: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  musicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  musicCard: {
    width: (SW - 44) / 2,
    marginBottom: 10,
  },
  musicGrad: {
    height: 130,
    borderRadius: 18,
    padding: 14,
    justifyContent: "center",
  },
  musicGenre: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  musicCount: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
  },
  calmFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  calmText: {
    fontSize: 13,
    color: "#64748b",
  },
  calmBrand: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "800",
    color: "#94a3b8",
  },
});
