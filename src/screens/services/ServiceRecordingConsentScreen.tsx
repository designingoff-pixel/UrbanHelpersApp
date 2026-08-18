import React from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceRecordingConsent">;

const BENEFITS = [
  "Service verification",
  "Safety",
  "Dispute resolution",
  "Service quality review",
];

export default function ServiceRecordingConsentScreen({
  navigation,
  route,
}: Props) {
  const { bookingId, vendorId } = route.params;
  const [recordingConsent, setRecordingConsent] = React.useState(false);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Service Recording</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.duration(350)}
          style={s.heroSection}
        >
          <View style={s.heroImageWrap}>
            <Image
              source={{
                uri: "https://via.placeholder.com/240",
              }}
              style={s.heroImage}
            />
          </View>
          <Text style={s.heroText}>
            Urban Helpers can record the service session to help protect both
            the customer and the helper.
          </Text>
        </Animated.View>

        {/* Information Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(380)}
          style={s.infoCard}
        >
          <View style={s.infoHeader}>
            <View style={s.infoIconWrap}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#cfbcff"
              />
            </View>
            <Text style={s.infoTitle}>Recording Benefits</Text>
          </View>

          {BENEFITS.map((benefit, index) => (
            <View key={index} style={s.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#e7c365"
                style={{ marginTop: 2 }}
              />
              <Text style={s.benefitText}>{benefit}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Privacy Warning */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(380)}
          style={s.privacyCard}
        >
          <Ionicons name="information-circle" size={20} color="#ffb4ab" />
          <Text style={s.privacyText}>
            Recording will begin only after you confirm. Both parties should be
            informed that recording is active.
          </Text>
        </Animated.View>

        {/* Consent Checkbox */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(380)}
          style={s.consentSection}
        >
          <Pressable
            onPress={() => setRecordingConsent(!recordingConsent)}
            style={s.checkboxRow}
          >
            <View
              style={[
                s.checkbox,
                recordingConsent && { backgroundColor: "#cfbcff", borderColor: "#cfbcff" },
              ]}
            >
              {recordingConsent && (
                <Ionicons name="checkmark" size={16} color="#381e72" />
              )}
            </View>
            <Text style={s.consentText}>
              I agree to record this service session
            </Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={s.actionsBottom}>
        <LinearGradient
          colors={["#00c6ff", "#0072ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.startBtn}
        >
          <Pressable
            onPress={() => {
              if (recordingConsent) {
                navigation.navigate("RecordingInProgress", { bookingId, vendorId });
              }
            }}
            disabled={!recordingConsent}
            style={[s.startBtnInner, !recordingConsent && { opacity: 0.5 }]}
          >
            <Ionicons name="videocam" size={20} color="white" />
            <Text style={s.startBtnText}>Start Recording</Text>
          </Pressable>
        </LinearGradient>

        <Pressable
          onPress={() => navigation.navigate("RecordingInProgress", { bookingId, vendorId })}
          style={s.skipBtn}
        >
          <Text style={s.skipBtnText}>Continue Without Recording</Text>
        </Pressable>

        <Pressable onPress={() => {}}>
          <Text style={s.policyLink}>View Recording & Privacy Policy</Text>
        </Pressable>
      </View>
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
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(29, 27, 32, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#cfbcff",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  heroImageWrap: {
    width: "100%",
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "rgba(43, 41, 47, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  infoCard: {
    backgroundColor: "rgba(11, 29, 42, 1)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(77, 68, 101, 0.5)",
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(207, 188, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
    marginTop: 2,
  },
  privacyCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(147, 0, 10, 0.2)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 180, 171, 0.2)",
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  consentSection: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.glass.border,
    justifyContent: "center",
    alignItems: "center",
  },
  consentText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    fontWeight: "500",
  },
  actionsBottom: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  startBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  startBtnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(43, 41, 47, 1)",
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  policyLink: {
    fontSize: 12,
    color: "#cfbcff",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
  },
});
