import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { useAuth } from "@/context/AuthContext";
import { Booking, BookingStatus, subscribeToUserBookings } from "@/services/bookingService";
import { SERVICE_CATEGORIES } from "./servicesData";

type Props = NativeStackScreenProps<RootStackParamList, "MyBookings">;

const DEFAULT_GRADIENT: [string, string] = ["#00bcd4", "#0097a7"];

function categoryFor(booking: Booking) {
  return SERVICE_CATEGORIES.find((c) => c.name === booking.serviceCategory);
}

function formatScheduledAt(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return `${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${time}`;
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "#f59e0b",
  assigned: "#38bdf8",
  accepted: "#38bdf8",
  en_route: "#38bdf8",
  arrived: "#f59e0b",
  in_progress: "#22c55e",
  completed: "#6366f1",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  assigned: "Assigned",
  accepted: "Accepted",
  en_route: "En route",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MyBookingsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserBookings(user.uid, (result) => {
      setBookings(result);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

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
        {!user && (
          <View style={s.emptyHint}>
            <Ionicons name="log-in-outline" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={s.emptyHintText}>Sign in to see your bookings</Text>
            <Pressable onPress={() => navigation.navigate("SignIn")} style={s.signInBtn}>
              <Text style={s.signInBtnText}>Sign In</Text>
            </Pressable>
          </View>
        )}

        {user && loading && (
          <View style={s.emptyHint}>
            <ActivityIndicator color="#00bcd4" />
          </View>
        )}

        {user && !loading && bookings.map((booking, i) => {
          const category = categoryFor(booking);
          const gradient = category?.gradient ?? DEFAULT_GRADIENT;
          return (
            <Animated.View key={booking.id} entering={FadeInDown.delay(i * 80).duration(350)}>
              <Pressable
                onPress={() => navigation.navigate("BookingConfirmed", {
                  bookingId: booking.id,
                  categoryId: category?.id ?? SERVICE_CATEGORIES[0].id,
                  subServiceId: category?.subServices.find((sv) => sv.name === booking.subServiceName)?.id
                    ?? category?.subServices[0]?.id
                    ?? SERVICE_CATEGORIES[0].subServices[0].id,
                  dayIndex: 0,
                  slotIndex: 1,
                })}
                style={s.bookingCard}
              >
                {/* Left gradient accent */}
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={s.accentBar}
                />

                <View style={s.bookingBody}>
                  {/* Top row */}
                  <View style={s.bookingTop}>
                    <View style={[s.serviceIconWrap, { backgroundColor: gradient[0] + "22" }]}>
                      <Ionicons name={(category?.icon as any) ?? "sparkles"} size={22} color={gradient[0]} />
                    </View>
                    <View style={s.bookingInfo}>
                      <Text style={s.serviceName}>{booking.serviceCategory}</Text>
                      <Text style={s.subServiceName}>{booking.subServiceName}</Text>
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
                      <Text style={s.metaText}>{booking.vendorName}</Text>
                    </View>
                    <View style={s.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color={colors.text.secondary} />
                      <Text style={s.metaText}>{formatScheduledAt(booking.scheduledAt)}</Text>
                    </View>
                    <Text style={s.priceText}>{booking.priceLabel}</Text>
                  </View>

                  {/* Booking ID */}
                  <Text style={s.bookingId}>#{booking.id.slice(-8).toUpperCase()}</Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        {user && !loading && bookings.length === 0 && (
          <Animated.View entering={FadeInDown.delay(320).duration(350)} style={s.emptyHint}>
            <Ionicons name="calendar-outline" size={40} color="rgba(255,255,255,0.15)" />
            <Text style={s.emptyHintText}>No bookings yet — book a service to see it here</Text>
          </Animated.View>
        )}

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
  emptyHintText: { fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", paddingHorizontal: 24 },
  signInBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, backgroundColor: "#00bcd4",
  },
  signInBtnText: { fontSize: 13, fontWeight: "700", color: "white" },
});
