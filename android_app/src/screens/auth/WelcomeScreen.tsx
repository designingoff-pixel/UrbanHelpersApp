import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top House + Hand Logo Badge */}
        <View style={styles.logoBadgeWrap}>
          <View style={styles.logoBadge}>
            <Ionicons name="home" size={26} color="#0056D2" />
            <Ionicons name="hand-left" size={14} color="#0056D2" style={styles.handIcon} />
          </View>
        </View>

        {/* Hero Illustration */}
        <View style={styles.heroWrap}>
          <Image
            source={require("../../../assets/welcome_hero.jpg")}
            style={styles.heroImg}
            resizeMode="cover"
          />
        </View>

        {/* Brand House Icon in Blue */}
        <View style={styles.brandIconWrap}>
          <View style={styles.brandHouseIcon}>
            <Ionicons name="home" size={32} color="#0056D2" />
            <Ionicons name="hand-left" size={16} color="#0056D2" style={styles.brandHand} />
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
              <Ionicons name="home" size={18} color="#15803D" />
            </View>
            <Text style={styles.pillLabel}>Home{"\n"}Services</Text>
          </View>

          <View style={styles.pillItem}>
            <View style={[styles.pillIconWrap, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="heart" size={18} color="#2563EB" />
            </View>
            <Text style={styles.pillLabel}>Health{"\n"}& Wellness</Text>
          </View>

          <View style={styles.pillItem}>
            <View style={[styles.pillIconWrap, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="people" size={18} color="#7E22CE" />
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

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  logoBadgeWrap: {
    alignSelf: "flex-start",
    marginTop: 6,
    marginBottom: 8,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  handIcon: {
    position: "absolute",
    bottom: 12,
  },
  heroWrap: {
    width: "100%",
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    marginVertical: 6,
    backgroundColor: "#F1F5F9",
  },
  heroImg: {
    width: "100%",
    height: "100%",
  },
  brandIconWrap: {
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  brandHouseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  brandHand: {
    position: "absolute",
    bottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    alignSelf: "flex-start",
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    alignSelf: "flex-start",
    lineHeight: 19,
    marginBottom: 16,
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  pillItem: {
    alignItems: "center",
    flex: 1,
  },
  pillIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  pillLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 14,
  },
  actionsWrap: {
    width: "100%",
    gap: 10,
    marginBottom: 16,
  },
  primaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0056D2",
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
  },
  secondaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryBtnText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
  },
  footerLink: {
    fontSize: 13,
    color: "#0056D2",
    fontWeight: "800",
  },
});
