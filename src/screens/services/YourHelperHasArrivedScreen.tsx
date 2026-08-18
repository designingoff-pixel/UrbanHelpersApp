import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "YourHelperHasArrived">;

const { width: W } = Dimensions.get("window");

export default function YourHelperHasArrivedScreen({
  navigation,
  route,
}: Props) {
  const { bookingId, vendorId } = route.params;
  // Mock vendor data - in production fetch from API by vendorId
  const vendor = {
    name: "Rahul Kumar",
    service: "Home Cleaning",
    avatar: "https://via.placeholder.com/100",
    rating: 4.8,
    bookingId,
    scheduledTime: "Today • 4:30 PM",
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero Text */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.heroSection}>
          <Text style={s.heroTitle}>Your Helper Has Arrived</Text>
          <Text style={s.heroSub}>
            Please verify their identity before starting the service.
          </Text>
        </Animated.View>

        {/* Hero Image */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)}>
          <Image
            source={{ uri: vendor.avatar }}
            style={s.heroImage}
          />
          <LinearGradient
            colors={["rgba(20, 18, 24, 1)", "rgba(20, 18, 24, 0)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={s.imageFade}
          />
        </Animated.View>

        {/* Vendor Card */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)} style={s.cardSection}>
          <View style={s.vendorCard}>
            {/* Vendor Header */}
            <View style={s.vendorHeader}>
              <Image
                source={{ uri: vendor.avatar }}
                style={s.avatar}
              />
              <View style={s.vendorInfo}>
                <View style={s.nameRow}>
                  <Text style={s.vendorName}>{vendor.name}</Text>
                  <View style={s.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                  </View>
                </View>
                <Text style={s.verifiedText}>Verified Urban Helpers Partner</Text>
                <View style={s.serviceTag}>
                  <Ionicons name="sparkles" size={14} color="#cdc0e9" />
                  <Text style={s.serviceTagText}>{vendor.service}</Text>
                </View>
              </View>
            </View>

            {/* Verification Badges */}
            <View style={s.badgesRow}>
              <View style={s.badge}>
                <Ionicons name="shield-checkmark" size={14} color="#cdc0e9" />
                <Text style={s.badgeText}>Identity Verified</Text>
              </View>
              <View style={s.badge}>
                <Ionicons name="document-text" size={14} color="#cdc0e9" />
                <Text style={s.badgeText}>Background Checked</Text>
              </View>
              <View style={s.badge}>
                <Ionicons name="checkmark-done" size={14} color="#cfbcff" />
                <Text style={s.badgeText}>Service Assigned</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={s.divider} />

            {/* Status Grid */}
            <View style={s.statusGrid}>
              {/* Status Card */}
              <View style={s.statusCard}>
                <View style={s.statusIconWrap}>
                  <Ionicons
                    name="location"
                    size={24}
                    color="#cfbcff"
                    style={{ textAlignVertical: "center" }}
                  />
                </View>
                <Text style={s.statusLabel}>Current Status</Text>
                <Text style={s.statusValue}>Arrived at location</Text>
              </View>

              {/* Booking Details Card */}
              <View style={s.bookingCard}>
                <View style={s.bookingRow}>
                  <Text style={s.bookingLabel}>Booking ID</Text>
                  <Text style={s.bookingValue}>{vendor.bookingId}</Text>
                </View>
                <View style={s.bookingRow}>
                  <Text style={s.bookingLabel}>Scheduled</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.bookingValue}>Today</Text>
                    <Text style={s.bookingTime}>4:30 PM</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(220).duration(380)} style={s.actionsSection}>
          <LinearGradient
            colors={["#00e5ff", "#007bff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.primaryBtn}
          >
            <Pressable
              onPress={() => navigation.navigate("VerifyYourHelper", { bookingId, vendorId })}
              style={s.primaryBtnInner}
            >
              <Ionicons name="qr-code" size={20} color="white" />
              <Text style={s.primaryBtnText}>Verify & Start Service</Text>
            </Pressable>
          </LinearGradient>

          <Pressable
            onPress={() => navigation.navigate("ServicesDashboard")}
            style={s.secondaryBtn}
          >
            <Text style={s.secondaryBtnText}>Need Help?</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#141218",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "rgba(20, 18, 24, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(33, 31, 36, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSub: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginBottom: -2,
  },
  imageFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  cardSection: {
    marginTop: -50,
    marginBottom: 24,
  },
  vendorCard: {
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  vendorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#cfbcff",
  },
  vendorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  verifiedBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 12,
    padding: 2,
  },
  verifiedText: {
    fontSize: 14,
    color: "#cfbcff",
    marginBottom: 6,
    fontWeight: "500",
  },
  serviceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(205, 192, 233, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  serviceTagText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(77, 68, 101, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(205, 192, 233, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "rgba(43, 41, 47, 1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(207, 188, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#cfbcff",
  },
  bookingCard: {
    flex: 1,
    backgroundColor: "rgba(43, 41, 47, 1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
  },
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bookingLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  bookingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  bookingTime: {
    fontSize: 14,
    color: "#e7c365",
    fontWeight: "500",
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  primaryBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
});
