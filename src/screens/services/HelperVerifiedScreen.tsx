import React, { useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "HelperVerified">;

export default function HelperVerifiedScreen({ navigation, route }: Props) {
  const { bookingId, vendorId } = route.params;
  const scaleAnim = useSharedValue(0);

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Success Animation */}
        <Animated.View entering={FadeInDown.duration(350)} style={[s.successContainer, animStyle]}>
          <View style={s.successBg}>
            <View style={s.checkIcon}>
              <Ionicons name="checkmark" size={40} color="#4ade80" />
            </View>
          </View>
        </Animated.View>

        {/* Typography */}
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={s.textSection}>
          <Text style={s.title}>Helper Verified</Text>
          <Text style={s.subtitle}>
            Rahul Kumar is verified for your scheduled service.
          </Text>
        </Animated.View>

        {/* Vendor Card */}
        <Animated.View entering={FadeInDown.delay(160).duration(380)} style={s.vendorCardSection}>
          <View style={s.vendorCard}>
            <View style={s.avatarWrap}>
              <Image
                source={{ uri: "https://via.placeholder.com/80" }}
                style={s.avatar}
              />
            </View>
            <View style={s.vendorInfo}>
              <View style={s.nameRow}>
                <Text style={s.vendorName}>Rahul Kumar</Text>
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                  <Text style={s.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={s.serviceType}>Home Cleaning</Text>
              <Text style={s.bookingId}>#UH-20481</Text>
            </View>
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(380)} style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color="#cfbcff" />
          <Text style={s.infoText}>
            For your safety and service transparency, you can record the
            service session.
          </Text>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={s.actionsBottom}>
        <LinearGradient
          colors={["#cfbcff", "#b8a5e6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.continueBtn}
        >
          <Pressable
            onPress={() => navigation.navigate("ServiceRecordingConsent", { bookingId, vendorId })}
            style={s.continueBtnInner}
          >
            <Text style={s.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#381e72" />
          </Pressable>
        </LinearGradient>

        <Pressable onPress={() => {}} style={s.supportBtn}>
          <Text style={s.supportBtnText}>Contact Support</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0e0d15",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  successContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  successBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(4, 226, 107, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(6, 78, 59, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  textSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  vendorCardSection: {
    marginBottom: 24,
  },
  vendorCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(43, 41, 47, 1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  vendorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4ade80",
  },
  serviceType: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 12,
    color: "rgba(148, 142, 156, 1)",
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(33, 31, 36, 1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
    marginTop: 2,
  },
  actionsBottom: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  continueBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  continueBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#381e72",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  supportBtn: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(43, 41, 47, 1)",
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
});
