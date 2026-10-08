import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;
const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Hero Art */}
        <View style={styles.heroCard}>
          <Image
            source={require("../../../assets/welcome_hero.png")}
            style={styles.heroImg}
            resizeMode="contain"
          />
        </View>

        {/* Brand House Icon in Blue */}
        <View style={styles.brandIconWrap}>
          <View style={styles.brandHouseIcon}>
            <Ionicons name="home" size={28} color="#0056D2" />
          </View>
        </View>

        {/* Headlines */}
        <Text style={styles.title}>
          One App.{"\n"}Better Health.{"\n"}Better Home.{"\n"}Better Living.
        </Text>

        <Text style={styles.subtitle}>
          Book trusted professionals for your home, health, and everyday needs — all in one place.
        </Text>

        {/* 3 Service Badges */}
        <View style={styles.pillsRow}>
          <View style={styles.pillItem}>
            <View style={[styles.pillIconWrap, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="home" size={20} color="#15803D" />
            </View>
            <Text style={styles.pillLabel}>Home{"\n"}Services</Text>
          </View>

          <View style={styles.pillItem}>
            <View style={[styles.pillIconWrap, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="heart" size={20} color="#2563EB" />
            </View>
            <Text style={styles.pillLabel}>Health{"\n"}& Wellness</Text>
          </View>

          <View style={styles.pillItem}>
            <View style={[styles.pillIconWrap, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="people" size={20} color="#7E22CE" />
            </View>
            <Text style={styles.pillLabel}>Emergency{"\n"}Support</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("SignIn")}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("CreateAccount")}
            activeOpacity={0.88}
          >
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footerWrap}>
          <Ionicons name="shield-checkmark" size={14} color="#059669" />
          <Text style={styles.footerText}>100% Verified Professionals · Instant Support</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: "center",
  },
  heroCard: {
    width: width - 48,
    height: 190,
    backgroundColor: "#EFF6FF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  heroImg: {
    width: "90%",
    height: "90%",
  },
  brandIconWrap: {
    marginBottom: 12,
  },
  brandHouseIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 22,
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 26,
    gap: 8,
  },
  pillItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pillIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  pillLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 15,
  },
  actionsWrap: {
    width: "100%",
    gap: 12,
    marginBottom: 18,
  },
  primaryBtn: {
    backgroundColor: "#0056D2",
    borderRadius: 16,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  secondaryBtnText: {
    color: "#0F172A",
    fontSize: 15.5,
    fontWeight: "700",
  },
  footerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  footerText: {
    fontSize: 11.5,
    color: "#059669",
    fontWeight: "600",
  },
});
