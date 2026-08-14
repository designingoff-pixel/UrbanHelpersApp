import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Alert, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "EmergencyAssistance">;

const QUICK_ACTIONS = [
  { label: "Ambulance", icon: "medical", color: colors.error, large: true, action: "Calling Ambulance Services..." },
  { label: "Police", icon: "shield", color: colors.primaryContainer, large: true, action: "Calling Police Dispatch..." },
  { label: "Fire", icon: "flame", color: "#f97316", large: false, action: "Calling Fire Department..." },
  { label: "Family", icon: "people", color: colors.secondaryContainer, large: false, action: "Alerting Family Members..." },
  { label: "Doctor", icon: "medical-services", color: colors.surface.containerHighest, large: false, action: "Connecting to Doctor..." },
  { label: "Hospital", icon: "business", color: colors.tertiaryContainer, large: false, action: "Finding Nearest Hospital..." },
  { label: "Blood Bank", icon: "water", color: colors.errorContainer, large: false, action: "Locating Blood Bank..." },
  { label: "Roadside", icon: "car", color: "#fb923c", large: false, action: "Requesting Roadside Help..." },
];

const MEDICAL_ID = [
  { label: "Blood Group", value: "O+", bg: colors.error },
  { label: "Allergies", value: "Penicillin", bg: "#f97316" },
];

const NAV = [
  { icon: "alert-circle", route: "EmergencyAssistance", active: true },
  { icon: "call-outline", route: "HomeDashboard" },
  { icon: "medical-services-outline", route: "MedicalRecords" },
  { icon: "location-outline", route: "HomeDashboard" },
];

export default function EmergencyAssistanceScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.iconBtn}>
          <Ionicons name="menu-outline" size={20} color={colors.primary} />
        </Pressable>
        <Text style={s.pageTitle}>Emergency</Text>
        <Pressable style={s.iconBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* SOS Hero */}
        <View style={s.sosCard}>
          <Text style={s.sosTitle}>Emergency Assistance</Text>
          <Text style={s.sosSub}>Instant access when needed.</Text>

          {/* SOS Button */}
          <View style={s.sosCenter}>
            <View style={s.sosPulseOuter} />
            <View style={s.sosPulseInner} />
            <Pressable
              onPress={() => Alert.alert("🚨 SOS Activated", "Emergency services are being contacted. Sharing your location...")}
              style={({ pressed }) => [s.sosButton, pressed && { transform: [{ scale: 0.92 }] }]}
            >
              <Text style={s.sosLabel}>SOS</Text>
              <Text style={s.sosHint}>Hold to activate</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <Pressable
              key={a.label}
              onPress={() => Alert.alert(a.label, a.action)}
              style={({ pressed }) => [
                s.actionCard,
                a.large && s.actionCardLarge,
                { backgroundColor: a.color },
                pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
              ]}
            >
              <View style={s.actionIcon}>
                <Ionicons name={a.icon as any} size={a.large ? 40 : 28} color="white" />
              </View>
              <Text style={[s.actionLabel, a.large && s.actionLabelLarge]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Medical ID */}
        <Text style={s.sectionTitle}>Medical ID</Text>
        <View style={s.glassCard}>
          <View style={s.idHeader}>
            <Ionicons name="id-card" size={20} color={colors.primary} />
            <Text style={s.idTitle}>My Medical ID</Text>
            <Pressable><Text style={s.editBtn}>Edit</Text></Pressable>
          </View>
          <View style={s.idGrid}>
            {MEDICAL_ID.map((item) => (
              <View key={item.label} style={[s.idTile, { backgroundColor: item.bg }]}>
                <Text style={s.idLabel}>{item.label}</Text>
                <Text style={s.idValue}>{item.value}</Text>
              </View>
            ))}
          </View>
          <View style={s.contactRow}>
            <View style={s.contactInfo}>
              <View style={s.contactAvatar}>
                <Ionicons name="person" size={20} color={colors.onPrimary} />
              </View>
              <View>
                <Text style={s.contactName}>Mother</Text>
                <Text style={s.contactPhone}>+1 234 567 8900</Text>
              </View>
            </View>
            <Pressable onPress={() => Alert.alert("Calling", "Calling Mother...")} style={s.callBtn}>
              <Ionicons name="call" size={20} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Location */}
        <Text style={s.sectionTitle}>Live Location</Text>
        <View style={s.locationCard}>
          <View style={s.locationPin}>
            <Ionicons name="location" size={16} color={colors.secondary} />
            <Text style={s.locationBadge}>Live Location</Text>
          </View>
          <View style={s.locationMap}>
            <Ionicons name="map" size={60} color="rgba(180,197,255,0.2)" />
          </View>
          <View style={s.locationInfo}>
            <Text style={s.locationAddr}>124 Urban St, Downtown</Text>
            <Text style={s.locationCoords}>40.7128° N, 74.0060° W</Text>
            <Pressable onPress={() => Alert.alert("Share", "Sharing location with emergency contacts...")} style={s.shareBtn}>
              <Ionicons name="share" size={16} color={colors.onPrimary} />
              <Text style={s.shareBtnText}>Share Location</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.navBar}>
        {NAV.map((n, i) => (
          <Pressable key={i} onPress={() => navigation.navigate(n.route as any)} style={[s.navBtn, n.active && s.navBtnActive]}>
            <Ionicons name={n.icon as any} size={22} color={n.active ? colors.primary : colors.text.secondary} />
            {n.active && <Text style={s.navActiveLabel}>Emergency</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.dim },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.containerHigh, borderWidth: 1, borderColor: colors.glass.border, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 20, fontWeight: "700", color: colors.primary },
  scroll: { paddingHorizontal: 16 },
  sosCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 30, padding: 24, marginBottom: 20, alignItems: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", minHeight: 360 },
  sosTitle: { fontSize: 32, fontWeight: "700", color: colors.onErrorContainer, textAlign: "center", marginBottom: 8 },
  sosSub: { fontSize: 16, color: "rgba(255,218,214,0.8)", marginBottom: 32 },
  sosCenter: { position: "relative", width: 200, height: 200, justifyContent: "center", alignItems: "center" },
  sosPulseOuter: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 2, borderColor: "rgba(239,68,68,0.2)" },
  sosPulseInner: { position: "absolute", width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 2, borderColor: "rgba(239,68,68,0.3)" },
  sosButton: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.error, justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "rgba(255,255,255,0.2)", shadowColor: colors.error, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 30, elevation: 12 },
  sosLabel: { fontSize: 36, fontWeight: "900", color: "white", letterSpacing: 4 },
  sosHint: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.8)", marginTop: 4, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  actionCard: { borderRadius: 24, padding: 16, width: "47%", alignItems: "center", gap: 8, justifyContent: "center", minHeight: 120, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  actionCardLarge: { width: "100%" },
  actionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  actionLabel: { fontSize: 14, fontWeight: "700", color: "white" },
  actionLabelLarge: { fontSize: 20 },
  glassCard: { backgroundColor: colors.glass.background, borderRadius: 30, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  idHeader: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: colors.glass.border, paddingBottom: 12, marginBottom: 16 },
  idTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: colors.text.primary },
  editBtn: { fontSize: 14, color: colors.primary, fontWeight: "600" },
  idGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  idTile: { flex: 1, borderRadius: 16, padding: 12 },
  idLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  idValue: { fontSize: 22, fontWeight: "700", color: "white" },
  contactRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 16, padding: 12 },
  contactInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  contactName: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  contactPhone: { fontSize: 12, color: colors.text.secondary },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  locationCard: { backgroundColor: colors.surface.containerHigh, borderRadius: 30, overflow: "hidden", marginBottom: 20, borderWidth: 1, borderColor: colors.glass.border },
  locationPin: { flexDirection: "row", alignItems: "center", gap: 6, margin: 16, alignSelf: "flex-start", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.glass.border },
  locationBadge: { fontSize: 11, fontWeight: "700", color: colors.secondary },
  locationMap: { height: 120, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  locationInfo: { padding: 20 },
  locationAddr: { fontSize: 16, fontWeight: "600", color: colors.text.primary, marginBottom: 4 },
  locationCoords: { fontSize: 12, color: colors.text.secondary, marginBottom: 16 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, justifyContent: "center" },
  shareBtnText: { fontSize: 14, fontWeight: "700", color: colors.onPrimary },
  navBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 80, marginHorizontal: 16, marginBottom: 16, backgroundColor: "rgba(4,20,35,0.6)", borderRadius: 32, borderWidth: 1, borderColor: colors.glass.border },
  navBtn: { flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 12 },
  navBtnActive: {},
  navActiveLabel: { fontSize: 10, fontWeight: "700", color: colors.primary },
});
