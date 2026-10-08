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
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    const cleanEmail = email.trim();
    const cleanPass = password;

    if (!cleanEmail) {
      Alert.alert("Email Required", "Please enter your email address to sign in.");
      return;
    }
    if (!cleanPass) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      let firebaseUser = null;
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        firebaseUser = res.user;
      } catch (signInErr: any) {
        if (
          signInErr.code === "auth/user-not-found" ||
          signInErr.code === "auth/invalid-credential" ||
          signInErr.code === "auth/invalid-email"
        ) {
          // Auto-provision user if new
          const createRes = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          firebaseUser = createRes.user;
        } else {
          throw signInErr;
        }
      }

      if (firebaseUser) {
        await AsyncStorage.setItem("@customer_logged_in", "true");

        // Check if user has a profile document in Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data()?.profileCompleted) {
          // New user -> navigate to fill profile details
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "CreateProfile",
                params: {
                  email: cleanEmail,
                  name: firebaseUser.displayName || cleanEmail.split("@")[0],
                } as any,
              },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: "ServicesDashboard" }],
          });
        }
      }
    } catch (err: any) {
      console.warn("Sign in error:", err);
      Alert.alert("Sign In Failed", err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      await AsyncStorage.setItem("@customer_logged_in", "true");
      navigation.reset({
        index: 0,
        routes: [{ name: "ServicesDashboard" }],
      });
    } catch (e: any) {
      Alert.alert("Google Sign-In", e.message || "Failed to sign in with Google.");
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

        {/* Top Illustration: Technician */}
        <View style={styles.topIllustrationWrap}>
          <Image
            source={require("../../../assets/signin_tech.jpg")}
            style={styles.topIllustrationImg}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Urban Helpers.</Text>

        {/* Email Input */}
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

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 10 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
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

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Primary Sign In Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>

        {/* Social Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialButtonsWrap}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignIn}>
            <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert("Apple Sign-In", "Apple authentication available on iOS devices.")}>
            <Ionicons name="logo-apple" size={20} color="#000000" style={{ marginRight: 8 }} />
            <Text style={styles.socialBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={() => navigation.navigate("OTPVerification")}>
            <Ionicons name="call-outline" size={18} color="#0F172A" style={{ marginRight: 8 }} />
            <Text style={styles.socialBtnText}>Continue with Phone</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
            <Text style={styles.footerLink}>Create Account</Text>
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
    marginBottom: 12,
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
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0056D2",
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
    marginBottom: 16,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 11.5,
    color: "#94A3B8",
    fontWeight: "600",
  },
  socialButtonsWrap: {
    gap: 8,
    marginBottom: 16,
  },
  socialBtn: {
    width: "100%",
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  socialBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
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
