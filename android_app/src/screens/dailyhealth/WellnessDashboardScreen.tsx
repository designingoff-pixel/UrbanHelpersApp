import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { useAuth } from "@/context/AuthContext";
import { getSleepEntries, SleepEntry, formatSleepDuration } from "@/services/healthLogService";

type Props = NativeStackScreenProps<RootStackParamList, "WellnessDashboard">;

const ACTIVITIES = [
  {
    title: "Deep Urban Calm",
    sub: "A 10-minute guided breathing exercise to lower heart rate amid city noise.",
    duration: "10 min",
    tag: "Focus",
    tagColor: "#38bdf8",
    icon: "water",
    route: "MeditationDashboard",
  },
  {
    title: "Neural Reset Soundscape",
    sub: "Binaural beats designed to ease transitions between high-stress tasks.",
    duration: "25 min",
    tag: "Recovery",
    tagColor: "#a78bfa",
    icon: "musical-notes",
    route: "SleepDashboard",
  },
];

export default function WellnessDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [latestSleep, setLatestSleep] = useState<SleepEntry | null>(null);

  // Animated values for hero
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for Live Vitals
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const entries = await getSleepEntries(user.uid);
        if (entries && entries.length > 0) {
          // Assuming array is sorted newest first as per healthLogService
          setLatestSleep(entries[0]);
        }
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Derived values
  const hasData = !!latestSleep;
  const sleepScore = latestSleep?.score ?? 0;
  // Calculate Energy proxy from Sleep Score (boosted slightly)
  const energyScore = hasData ? Math.min(100, Math.round(sleepScore * 1.05)) : null;
  const sleepDuration = hasData ? formatSleepDuration(latestSleep!.durationMins) : "--";
  const deepSleepMins = latestSleep?.stages?.deepMins;
  const recoveryText = deepSleepMins
    ? `${formatSleepDuration(deepSleepMins)} Deep Sleep recorded.`
    : hasData 
      ? `${sleepDuration} total sleep recorded.`
      : "Wear watch during sleep to track.";

  let statusText = "Sync Required";
  let statusSub = "Connect a compatible wearable to track your health and recovery.";
  if (hasData && energyScore) {
    if (energyScore >= 85) {
      statusText = "Neural Sync\nOptimal";
      statusSub = "Your cognitive load and physical recovery are perfectly balanced for today's urban challenges.";
    } else if (energyScore >= 60) {
      statusText = "Recovery\nModerate";
      statusSub = "You have enough energy for the day, but prioritize rest this evening.";
    } else {
      statusText = "Recovery\nNeeded";
      statusSub = "Your energy levels are low. Focus on hydration, light activity, and rest.";
    }
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
        <Text style={s.headerTitle}>Wellness & Recovery</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* HERO CARD */}
        <View style={s.hero}>
          <LinearGradient
            colors={["#0c2a47", "#061524"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Top badge */}
          <View style={s.heroTopRow}>
            <View style={s.heroLiveBadge}>
              {hasData ? (
                <Animated.View style={[s.liveDot, { opacity: pulseAnim }]} />
              ) : (
                <View style={[s.liveDot, { backgroundColor: "#64748b" }]} />
              )}
              <Text style={s.liveBadgeText}>
                {hasData ? "LIVE VITALS" : "NO DATA"}
              </Text>
            </View>
          </View>

          <View style={s.heroContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#38bdf8" style={{ alignSelf: "flex-start", marginVertical: 20 }} />
            ) : (
              <>
                <Text style={s.heroTitle}>{statusText}</Text>
                <Text style={s.heroSub}>{statusSub}</Text>
              </>
            )}
          </View>
          
          {/* Decorative glow blob */}
          <View style={s.heroGlow} />
        </View>

        {/* METRICS GRID */}
        <View style={s.cardsGrid}>
          {/* Energy */}
          <View style={s.featureCard}>
            <View style={s.featureTop}>
              <Text style={s.featureLabel}>ENERGY</Text>
              <View style={[s.iconBg, { backgroundColor: "rgba(56,189,248,0.15)" }]}>
                <Ionicons name="flash" size={16} color="#38bdf8" />
              </View>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#38bdf8" style={{ marginTop: 10 }} />
            ) : energyScore !== null ? (
              <>
                <Text style={s.featureValue}>{energyScore}<Text style={s.featureUnit}>%</Text></Text>
                <View style={s.progressBg}>
                  <LinearGradient
                    colors={["#0284c7", "#38bdf8"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.progressFill, { width: `${energyScore}%` }]}
                  />
                </View>
              </>
            ) : (
              <View style={s.noDataBlock}>
                <Ionicons name="watch-outline" size={24} color="#64748b" />
                <Text style={s.noDataText}>No Data</Text>
              </View>
            )}
          </View>

          {/* Stress (No Data logic per prompt) */}
          <View style={s.featureCard}>
            <View style={s.featureTop}>
              <Text style={s.featureLabel}>STRESS</Text>
              <View style={[s.iconBg, { backgroundColor: "rgba(244,63,94,0.15)" }]}>
                <Ionicons name="heart" size={16} color="#f43f5e" />
              </View>
            </View>
            <View style={s.noDataBlock}>
              <Ionicons name="bluetooth-outline" size={24} color="#64748b" />
              <Text style={s.noDataText}>Sync Device</Text>
              <Text style={s.noDataSub}>Resting HR: --</Text>
            </View>
          </View>

          {/* Recovery State (Wide) */}
          <View style={[s.featureCard, s.featureCardWide]}>
            <View style={s.featureTop}>
              <Text style={s.featureLabel}>RECOVERY STATE</Text>
              <View style={[s.iconBg, { backgroundColor: "rgba(167,139,250,0.15)" }]}>
                <Ionicons name="moon" size={16} color="#a78bfa" />
              </View>
            </View>
            <View style={s.recoveryRow}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                {loading ? (
                   <ActivityIndicator size="small" color="#a78bfa" />
                ) : hasData ? (
                  <>
                    <Text style={s.featureValue}>
                      {energyScore && energyScore >= 75 ? "Ready" : "Recovering"}
                    </Text>
                    <Text style={s.featureSub}>{recoveryText}</Text>
                  </>
                ) : (
                  <>
                     <Text style={[s.featureValue, { color: "#94a3b8" }]}>Unknown</Text>
                     <Text style={s.featureSub}>{recoveryText}</Text>
                  </>
                )}
              </View>
              {/* Mini visual bars for sleep stages mock visual */}
              <View style={s.miniBars}>
                {[14, 22, 10, 18, 28].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      s.miniBar,
                      { 
                        height: h, 
                        backgroundColor: hasData 
                          ? (i >= 3 ? "#a78bfa" : "rgba(167,139,250,0.3)") 
                          : "rgba(255,255,255,0.05)" 
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recommended For You */}
        <View style={s.recHeader}>
          <Text style={s.sectionTitle}>Recommended for You</Text>
        </View>

        <View style={s.activitiesList}>
          {ACTIVITIES.map((a) => (
            <Pressable
              key={a.title}
              onPress={() => navigation.navigate(a.route as any)}
              style={({ pressed }) => [s.activityCard, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={s.activityThumb}>
                <LinearGradient
                  colors={["#0f172a", "#1e293b"]}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name={a.icon as any} size={28} color="rgba(255,255,255,0.8)" />
                <View style={s.playOverlay}>
                  <View style={s.playBtn}>
                    <Ionicons name="play" size={14} color="white" style={{ marginLeft: 2 }} />
                  </View>
                </View>
              </View>
              <View style={s.activityInfo}>
                <Text style={s.activityTitle}>{a.title}</Text>
                <Text style={s.activitySub} numberOfLines={2}>{a.sub}</Text>
                <View style={s.activityMeta}>
                  <Text style={[s.activityDuration, { color: a.tagColor }]}>{a.duration}</Text>
                  <View style={s.activityDot} />
                  <Text style={s.activityTag}>{a.tag}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Links */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {[
            { label: "Hydration", icon: "water", route: "HydrationDashboard", color: "#38bdf8" },
            { label: "Sleep", icon: "moon", route: "SleepDashboard", color: "#a78bfa" },
            { label: "Nutrition", icon: "nutrition", route: "NutritionDashboard", color: "#fb923c" },
            { label: "AI Coach", icon: "sparkles", route: "AICoach", color: "#c084fc" },
          ].map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.route as any)}
              style={({ pressed }) => [
                s.quickCard, 
                { backgroundColor: `${q.color}15`, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <View style={[s.quickIconWrap, { backgroundColor: `${q.color}25` }]}>
                <Ionicons name={q.icon as any} size={22} color={q.color} />
              </View>
              <Text style={[s.quickLabel, { color: q.color }]}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020813" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    paddingTop: 56, 
    paddingBottom: 16 
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#f8fafc", letterSpacing: 0.3 },
  iconBtn: { 
    width: 44, height: 44, 
    borderRadius: 22, 
    backgroundColor: "rgba(255,255,255,0.05)", 
    justifyContent: "center", alignItems: "center", 
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" 
  },
  scroll: { paddingHorizontal: 16 },
  
  // Hero
  hero: { 
    borderRadius: 28, 
    minHeight: 320, 
    marginBottom: 20, 
    overflow: "hidden", 
    padding: 24, 
    borderWidth: 1, 
    borderColor: "rgba(56,189,248,0.2)",
    justifyContent: "space-between"
  },
  heroGlow: {
    position: "absolute",
    right: -50,
    bottom: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#38bdf8",
    opacity: 0.15,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLiveBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    backgroundColor: "rgba(2,132,199,0.3)", 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderWidth: 1, 
    borderColor: "rgba(56,189,248,0.3)" 
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#38bdf8" },
  liveBadgeText: { fontSize: 10, fontWeight: "800", color: "#e0f2fe", letterSpacing: 1 },
  heroContent: {
    marginTop: "auto",
  },
  heroTitle: { fontSize: 44, fontWeight: "800", color: "#ffffff", lineHeight: 48, marginBottom: 12, letterSpacing: -0.5 },
  heroSub: { fontSize: 15, color: "#94a3b8", lineHeight: 22, fontWeight: "500", maxWidth: "90%" },
  
  // Metrics Grid
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 28 },
  featureCard: { 
    width: "48%", 
    backgroundColor: "rgba(15,23,42,0.6)", 
    borderRadius: 24, 
    padding: 18, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.06)", 
    minHeight: 150, 
    justifyContent: "space-between" 
  },
  featureCardWide: { width: "100%" },
  featureTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  featureLabel: { fontSize: 11, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.8 },
  iconBg: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  featureValue: { fontSize: 34, fontWeight: "800", color: "#ffffff", letterSpacing: -0.5 },
  featureUnit: { fontSize: 16, fontWeight: "600", color: "#94a3b8" },
  featureSub: { fontSize: 13, color: "#94a3b8", marginTop: 4, fontWeight: "500" },
  
  // Progress
  progressBg: { height: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden", marginTop: 12 },
  progressFill: { height: 6, borderRadius: 3 },
  
  // Empty states
  noDataBlock: {
    alignItems: "flex-start",
    marginTop: 4,
    gap: 4
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e2e8f0"
  },
  noDataSub: {
    fontSize: 12,
    color: "#64748b"
  },

  // Recovery Row
  recoveryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  miniBars: { flexDirection: "row", alignItems: "flex-end", gap: 5 },
  miniBar: { width: 6, borderRadius: 3 },
  
  // Sections
  recHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#f8fafc", marginBottom: 16, letterSpacing: 0.2 },
  
  // Activities List
  activitiesList: { gap: 14, marginBottom: 32 },
  activityCard: { 
    backgroundColor: "rgba(15,23,42,0.6)", 
    borderRadius: 24, 
    padding: 16, 
    flexDirection: "row", 
    alignItems: "center",
    gap: 16, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.06)" 
  },
  activityThumb: { width: 72, height: 72, borderRadius: 18, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  playOverlay: { position: "absolute", bottom: 6, right: 6 },
  playBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"},
  activityInfo: { flex: 1, justifyContent: "center" },
  activityTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  activitySub: { fontSize: 13, color: "#94a3b8", lineHeight: 18, marginBottom: 10 },
  activityMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  activityDuration: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  activityDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },
  activityTag: { fontSize: 12, fontWeight: "600", color: "#94a3b8" },
  
  // Quick Access
  quickGrid: { flexDirection: "row", gap: 12, marginBottom: 8 },
  quickCard: { 
    flex: 1, 
    borderRadius: 20, 
    paddingVertical: 16, 
    paddingHorizontal: 8,
    alignItems: "center", 
    justifyContent: "center",
    gap: 12, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.05)" 
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: { fontSize: 11, fontWeight: "700", textAlign: "center" },
});
