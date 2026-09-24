import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HealthCompanion">;

const MOODS = [
  { emoji: "😢", label: "Sad" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😊", label: "Happy" },
];

const TIPS = [
  { tag: "HYDRATION", tip: "Drink water before meals", sub: "Aids digestion and helps control portion sizes.", bg: ["#fa709a", "#fee140"] as (string[]) },
  { tag: "SLEEP", tip: "7-8 hours is optimal", sub: "Quality sleep repairs the body and mind.", bg: ["#FF6B6B", "#FF8E53"] as (string[]) },
  { tag: "MOVEMENT", tip: "Take short walks", sub: "Break up sedentary time every hour.", bg: ["#43e97b", "#38f9d7"] as (string[]) },
];

const NAV = [
  { icon: "heart", label: "Health", route: "HealthDashboard", active: true },
  { icon: "time-outline", label: "History", route: "MedicineHistory" },
  { icon: "alarm-outline", label: "Alarm", route: "MedicineAlarm" },
  { icon: "notifications-outline", label: "Reminders", route: "SmartReminders" },
  { icon: "person-outline", label: "Profile", route: "Profile" },
];

export default function HealthCompanionScreen({ navigation }: Props) {
  const [activeMood, setActiveMood] = useState(2);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Urban Helpers</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={["#8338EC", "#9D4EDD", "#C77DFF"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroLeft}>
            <Text style={s.heroTitle}>Health Companion</Text>
            <Text style={s.heroSub}>Your daily wellness companion.</Text>
            <Pressable
              style={s.startBtn}
              onPress={() => navigation.navigate("AICoach")}
            >
              <Text style={s.startBtnText}>Start Session</Text>
            </Pressable>
          </View>
          {/* Glowing orb */}
          <View style={s.orbWrap}>
            <View style={s.orbOuter}>
              <View style={s.orbInner}>
                <Ionicons name="logo-electron" size={40} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Bento Grid */}
        <View style={s.bentoGrid}>
          {/* Daily Check-in */}
          <LinearGradient
            colors={["#FF6B6B", "#FF8E53"]}
            style={s.checkInCard}
          >
            <View style={s.checkInIconWrap}>
              <Ionicons name="happy-outline" size={26} color="white" />
            </View>
            <Text style={s.checkInTitle}>Daily Check-in</Text>
            <Text style={s.checkInSub}>How are you feeling today?</Text>
            <View style={s.moodRow}>
              {MOODS.map((m, i) => (
                <Pressable
                  key={m.label}
                  onPress={() => setActiveMood(i)}
                  style={[s.moodBtn, activeMood === i && s.moodBtnActive]}
                >
                  <Text style={s.moodEmoji}>{m.emoji}</Text>
                </Pressable>
              ))}
            </View>
          </LinearGradient>

          {/* AI Conversation */}
          <LinearGradient
            colors={["#4facfe", "#00f2fe"]}
            style={s.aiCard}
          >
            <View style={s.aiCardTop}>
              <View>
                <View style={s.aiCardIconWrap}>
                  <Ionicons name="chatbubbles-outline" size={26} color="white" />
                </View>
                <Text style={s.aiCardTitle}>AI Conversation</Text>
                <Text style={s.aiCardSub}>Chat with your wellness guide</Text>
              </View>
              <Pressable
                style={s.connectBtn}
                onPress={() => navigation.navigate("AICoach")}
              >
                <Text style={s.connectBtnText}>CONNECT</Text>
              </Pressable>
            </View>
            {/* Chat bubbles */}
            <View style={s.chatBubbles}>
              <View style={s.bubbleLeft}>
                <Text style={s.bubbleText}>Hello! How can I support your wellness today?</Text>
              </View>
              <View style={s.bubbleRight}>
                <Text style={[s.bubbleText, { color: "#4facfe" }]}>I'd like a quick meditation.</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Wellness Goals */}
          <LinearGradient
            colors={["#43e97b", "#38f9d7"]}
            style={s.goalsCard}
          >
            <View style={s.goalsIconWrap}>
              <Ionicons name="flag-outline" size={26} color="#003731" />
            </View>
            <Text style={s.goalsTitle}>Wellness Goals</Text>
            <View style={s.goalsRing}>
              <Text style={s.goalsValue}>75%</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Daily Health Tips */}
        <Text style={s.sectionTitle}>Daily Health Tips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tipsRow} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
          {TIPS.map((t) => (
            <LinearGradient key={t.tip} colors={t.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.tipCard}>
              <View style={s.tipTagWrap}><Text style={s.tipTagText}>{t.tag}</Text></View>
              <Text style={s.tipTitle}>{t.tip}</Text>
              <Text style={s.tipSub}>{t.sub}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n) => (
          <Pressable key={n.label} onPress={() => navigation.navigate(n.route as any)} style={s.navBtn}>
            <Ionicons name={n.icon as any} size={22} color={n.active ? colors.primary : colors.text.secondary} />
            <Text style={[s.navLabel, n.active && s.navLabelActive]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.glass.border },
  scroll: { paddingHorizontal: 16 },
  hero: { borderRadius: 32, padding: 24, marginBottom: 20, minHeight: 240, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 36, fontWeight: "700", color: "white", marginBottom: 8 },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 20 },
  startBtn: { backgroundColor: "white", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, alignSelf: "flex-start", shadowColor: "rgba(255,255,255,0.3)", shadowOpacity: 1, shadowRadius: 20, elevation: 5 },
  startBtnText: { fontSize: 15, fontWeight: "700", color: "#8338EC" },
  orbWrap: {},
  orbOuter: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  orbInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  bentoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  checkInCard: { width: "47%", borderRadius: 28, padding: 16, minHeight: 180, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  checkInIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  checkInTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 4 },
  checkInSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 14 },
  moodRow: { flexDirection: "row", gap: 6 },
  moodBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 8, alignItems: "center" },
  moodBtnActive: { backgroundColor: "rgba(255,255,255,0.4)" },
  moodEmoji: { fontSize: 22 },
  aiCard: { width: "47%", borderRadius: 28, padding: 16, minHeight: 180, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  aiCardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  aiCardIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  aiCardTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  aiCardSub: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  connectBtn: { backgroundColor: "white", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  connectBtnText: { fontSize: 10, fontWeight: "700", color: "#00f2fe" },
  chatBubbles: { gap: 8 },
  bubbleLeft: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, borderBottomLeftRadius: 4, padding: 8 },
  bubbleRight: { backgroundColor: "white", borderRadius: 14, borderBottomRightRadius: 4, padding: 8, alignSelf: "flex-end" },
  bubbleText: { fontSize: 11, color: "white" },
  goalsCard: { width: "100%", borderRadius: 28, padding: 16, flexDirection: "row", alignItems: "center", gap: 20, minHeight: 120, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  goalsIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  goalsTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: "#003731" },
  goalsRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 8, borderColor: "#003731", justifyContent: "center", alignItems: "center" },
  goalsValue: { fontSize: 20, fontWeight: "700", color: "#003731" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 14 },
  tipsRow: { marginHorizontal: -16, paddingLeft: 16, marginBottom: 8 },
  tipCard: { width: 240, borderRadius: 28, padding: 20, minHeight: 160 },
  tipTagWrap: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12 },
  tipTagText: { fontSize: 10, fontWeight: "700", color: "white", letterSpacing: 0.5 },
  tipTitle: { fontSize: 18, fontWeight: "700", color: "white", marginBottom: 6 },
  tipSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: colors.surface.container, borderTopWidth: 1, borderTopColor: colors.glass.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  navBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 8 },
  navLabel: { fontSize: 10, color: colors.text.secondary, fontWeight: "500" },
  navLabelActive: { color: colors.primary, fontWeight: "700" },
});
