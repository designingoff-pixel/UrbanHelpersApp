import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { auth, db } from "@/services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "CreateProfile">;
const { width, height } = Dimensions.get("window");

const GENDERS = ["Male", "Female", "Other"] as const;

export default function CreateProfileScreen({ navigation, route }: Props) {
  const params = (route?.params as any) || {};
  const user = auth.currentUser;

  const [name, setName] = useState(params.name || user?.displayName || "");
  const [email, setEmail] = useState(params.email || user?.email || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [gender, setGender] = useState<string>("Male");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      if (user?.uid) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const d = snap.data();
            if (d.name && !name) setName(d.name);
            if (d.email && !email) setEmail(d.email);
            if (d.phone && !phone) setPhone(d.phone);
            if (d.gender) setGender(d.gender);
            if (d.dob) setDob(d.dob);
            if (d.address) setAddress(d.address);
            if (d.emergencyPhone) setEmergencyPhone(d.emergencyPhone);
          }
        } catch (_) {}
      }
    })();
  }, [user?.uid]);

  const handleSaveProfile = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      const activeUser = auth.currentUser;
      const uid = activeUser?.uid || user?.uid || `guest_${Date.now()}`;
      const nowIso = new Date().toISOString();

      const profileData = {
        uid,
        id: uid,
        name: cleanName,
        displayName: cleanName,
        username: cleanName,
        email: email.trim(),
        phone: phone.trim(),
        mobile: phone.trim(),
        gender,
        dob: dob.trim(),
        address: address.trim(),
        deliveryAddress: address.trim(),
        emergencyPhone: emergencyPhone.trim(),
        rewardPoints: 100,
        coins: 100,
        profileCompleted: true,
        role: "customer",
        updatedAt: nowIso,
        createdAt: nowIso,
      };

      if (activeUser?.uid || user?.uid) {
        const targetUid = activeUser?.uid || user?.uid!;
        await setDoc(doc(db, "users", targetUid), profileData, { merge: true });
      }

      await AsyncStorage.setItem(`@customer_profile_${uid}`, JSON.stringify(profileData));
      await AsyncStorage.setItem(`@customer_points_${uid}`, "100");
      await AsyncStorage.setItem("@customer_logged_in", "true");

      setIsSuccess(true);
    } catch (err: any) {
      Alert.alert("Save Error", err.message || "Failed to save profile details.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <ImageBackground
        source={require("../../../assets/success_art.png")}
        style={styles.successBg}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "space-between", padding: 24 }}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={styles.successCheckCircle}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>You're All Set!</Text>
            <Text style={styles.successSub}>
              Your account has been created successfully. Start exploring our services now.
            </Text>

            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "ServicesDashboard" }],
                });
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us personalize your Urban Helpers service experience.
        </Text>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
              placeholderTextColor="#94A3B8"
              style={styles.inputField}
            />
          </View>
        </View>

        {/* Email Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputField}
            />
          </View>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile Phone Number</Text>
          <View style={styles.inputBox}>
            <Ionicons name="call-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.inputField}
            />
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genderPill, gender === g && styles.genderPillActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderPillText, gender === g && styles.genderPillTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Default Service Address</Text>
          <View style={[styles.inputBox, { height: 64, alignItems: "flex-start", paddingTop: 10 }]}>
            <Ionicons name="location-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="House/Flat No., Street, Landmark, City"
              placeholderTextColor="#94A3B8"
              multiline
              style={[styles.inputField, { height: 44 }]}
            />
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date of Birth (Optional)</Text>
          <View style={styles.inputBox}>
            <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#94A3B8"
              style={styles.inputField}
            />
          </View>
        </View>

        {/* Primary Save Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSaveProfile}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Save &amp; Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
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
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderPill: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  genderPillActive: {
    borderColor: "#0056D2",
    backgroundColor: "#0056D2",
  },
  genderPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  genderPillTextActive: {
    color: "#FFFFFF",
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
    marginTop: 14,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  successBg: {
    width,
    height,
    flex: 1,
  },
  successCheckCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  successSub: {
    fontSize: 14.5,
    color: "#475569",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  dashboardBtn: {
    width: "100%",
    height: 54,
    borderRadius: 27,
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
  dashboardBtnText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
  },
});
