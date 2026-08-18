import React from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "MyBookings">;

const MOCK_BOOKINGS = [
  {
    id: "UH-20481",
    service: "Home Cleaning",
    subService: "Full Home Cleaning",
    vendor: "Rahul Kumar",
    date: "Today, 4:30 PM",
    status: "confirmed",
    price: "₹1,999",
    icon: "sparkles",
    gradient: ["#00bcd4", "#0097a7"] as [string, string],
  },
  {
    id: "UH-20380",
    service: "RO Service",
    subService: "Filter Change",
    vendor: "Priya Sharma",
    date: "Tomorrow, 10:00 AM",
    status: "pending",
    price: "₹399",
    icon: "water",
    gradient: ["#0284c7", "#38bdf8"] as [string, string],
  },
  {
    id: "UH-20271",
    service: "Pest Control",
    subService: "Anti-Cockroach",
    vendor: "Suresh Patel",
    date: "Aug 20, 9:00 AM",
    status: "completed",
    price: "₹499",
    icon: "bug",
    gradient: ["#15803d", "#4ade80"] as [string, string],
  },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MyBookingsScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>My Bookings</Text>
        <Pressable style={s.filterBtn}>
          <Ionicons name="filter-outline" size={20} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <Animated.View entering={FadeInDown.duration(300)} style={s.filterTabs}>
        {["All", "Active", "Completed", "Cancelled"].map((tab, i) => (
          <Pressable key={tab} style={[s.filterTab, i === 0 && s.filterTabActive]}>
            <Text style={[s.filterTabText, i === 0 && s.filterTabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {MOCK_BOOKINGS.map((booking, i) => (
          <Animated.View
            key={booking.id}
            entering={FadeInDown.delay(i * 80).duration(350)}
          >
            <Pressable
              onPress={() => navigation.navigate("BookingConfirmed", {
                categoryId: "cleaning",
                subServiceId: "cl-full",
                dayIndex: 0,
                slotIndex: 2,
              })}
              style={s.bookingCard}
            >
              {/* Left gradient accent */}
              <LinearGradient
                colors={booking.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={s.accentBar}
              />

              <View style={s.bookingBody}>
                {/* Top row */}
                <View style={s.bookingTop}>
                  <View style={[s.serviceIconWrap, { backgroundColor: booking.gradient[0] + "22" }]}>
                    <Ionicons name={booking.icon as any} size={22} color={booking.gradient[0]} />
                  </View>
                  <View style={s.bookingInfo}>
                    <Text style={s.serviceName}>{booking.service}</Text>
                    <Text style={s.subServiceName}>{booking.subService}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[booking.status] + "22" }]}>
                    <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[booking.status] }]} />
                    <Text style={[s.statusText, { color: STATUS_COLORS[booking.status] }]}>
                      {STATUS_LABELS[booking.status]}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={s.divider} />

                {/* Bottom row */}
                <View style={s.bookingBottom}>
                  <View style={s.metaItem}>
                    <Ionicons name="person-outline" size={13} color={colors.text.secondary} />
                    <Text style={s.metaText}>{booking.vendor}</Text>
                  </View>
                  <View style={s.metaItem}>
                    <Ionicons name="calendar-outline" size={13} color={colors.text.secondary} />
                    <Text style={s.metaText}>{booking.date}</Text>
                  </View>
                  <Text style={s.priceText}>{booking.price}</Text>
                </View>

                {/* Booking ID */}
                <Text style={s.bookingId}>#{booking.id}</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {/* Empty state hint */}
        <Animated.View entering={FadeInDown.delay(320).duration(350)} style={s.emptyHint}>
          <Ionicons name="calendar-outline" size={40} color="rgba(255,255,255,0.15)" />
          <Text style={s.emptyHintText}>More bookings will appear here</Text>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  filterTabs: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  filterTabActive: {
    backgroundColor: "#00bcd4",
    borderColor: "#00bcd4",
  },
  filterTabText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },
  filterTabTextActive: { color: "white" },
  scroll: { paddingHorizontal: 16 },
  bookingCard: {
    flexDirection: "row", marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  accentBar: { width: 5 },
  bookingBody: { flex: 1, padding: 14 },
  bookingTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  serviceIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  bookingInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  subServiceName: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginBottom: 12 },
  bookingBottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: colors.text.secondary },
  priceText: { marginLeft: "auto", fontSize: 15, fontWeight: "700", color: "#00bcd4" },
  bookingId: { fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6 },
  emptyHint: { alignItems: "center", gap: 8, marginTop: 16, paddingVertical: 24 },
  emptyHintText: { fontSize: 13, color: "rgba(255,255,255,0.25)" },
});
