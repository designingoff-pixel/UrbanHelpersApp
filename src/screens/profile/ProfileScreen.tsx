import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const MENU_ITEMS = [
  { icon: "person-outline", label: "Personal Information", sub: "Edit your details" },
  { icon: "heart-outline", label: "Health Profile", sub: "Blood type, allergies & more" },
  { icon: "shield-checkmark-outline", label: "Privacy & Security", sub: "Manage your data" },
  { icon: "notifications-outline", label: "Notifications", sub: "Alerts & reminders" },
  { icon: "color-palette-outline", label: "Appearance", sub: "Theme & display" },
  { icon: "help-circle-outline", label: "Help & Support", sub: "FAQs & contact" },
  { icon: "information-circle-outline", label: "About", sub: "Version 2.0.0" },
];

export default function ProfileScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient
        colors={["#0f2027", "#203a43", "#2c5364"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
        </Pressable>
        <Text style={s.headerTitle}>Profile</Text>
        <Pressable style={s.editBtn}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <View style={s.avatarCard}>
          <LinearGradient
            colors={["#2563eb", "#8343f4"]}
            style={s.avatarCircle}
          >
            <Text style={s.avatarInitials}>JD</Text>
          </LinearGradient>
          <View style={s.avatarInfo}>
            <Text style={s.name}>Jane Doe</Text>
            <Text style={s.email}>jane.doe@example.com</Text>
          </View>
          <View style={s.premiumBadge}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={s.premiumText}>Premium</Text>
          </View>
        </View>

        {/* Health summary strip */}
        <View style={s.statsRow}>
          {[
            { label: "BMI", value: "22.4" },
            { label: "Blood", value: "O+" },
            { label: "Age", value: "28" },
          ].map((stat) => (
            <View key={stat.label} style={s.statItem}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                s.menuRow,
                i < MENU_ITEMS.length - 1 && s.menuRowBorder,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={s.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={s.menuText}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </Pressable>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [s.signOutBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => navigation.navigate("Welcome")}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={s.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.background,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { padding: 16 },
  avatarCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.container,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { fontSize: 24, fontWeight: "700", color: "white" },
  avatarInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "700", color: colors.text.primary },
  email: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: { fontSize: 11, color: "#f59e0b", fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface.container,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  statLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  menuCard: {
    backgroundColor: colors.surface.container,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.borderSubtle,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(180,197,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  menuSub: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,180,171,0.08)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,180,171,0.2)",
  },
  signOutText: { fontSize: 15, fontWeight: "600", color: colors.error },
});
