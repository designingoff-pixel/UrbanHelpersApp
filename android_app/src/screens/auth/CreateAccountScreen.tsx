import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

export default function CreateAccountScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPass = password;

    if (!cleanName) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }
    if (!cleanEmail) {
      Alert.alert("Email Required", "Please enter a valid email address.");
      return;
    }
    if (cleanPass.length < 6) {
      Alert.alert("Password Too Short", "Please enter a password with at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const user = userCred.user;

      await updateProfile(user, { displayName: cleanName });

      // Save user record in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: cleanName,
        displayName: cleanName,
        email: cleanEmail,
        createdAt: serverTimestamp(),
        profileCompleted: false,
      }, { merge: true });

      await AsyncStorage.setItem("@customer_logged_in", "true");

      // Navigate to fill profile details with pre-filled name & email
      navigation.navigate("CreateProfile", {
        name: cleanName,
        email: cleanEmail,
      } as any);
    } catch (err: any) {
      console.warn("Create account error:", err);
      Alert.alert("Registration Error", err.message || "Could not register account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        {/* Top Illustration: Journey Starts Here */}
        <View style={styles.topIllustrationWrap}>
          <Image
            source={require("../../../assets/signup_journey.jpg")}
            style={styles.topIllustrationImg}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start your journey to better health and home.</Text>

        {/* Full Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full name</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor="#94A3B8"
              style={styles.inputField}
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email address</Text>
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

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              style={styles.inputField}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Create Account Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleCreateAccount}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Create Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>

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
  topIllustrationWrap: {
    width: "100%",
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 6,
    backgroundColor: "#F1F5F9",
  },
  topIllustrationImg: {
    width: "100%",
    height: "100%",
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
    marginBottom: 16,
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
  primaryBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0056D2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
    marginBottom: 16,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
