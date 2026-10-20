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
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const isPhone = !identifier.includes("@") && /^[0-9+\s-]{6,15}$/.test(identifier.trim());

  const handleSignIn = async () => {
    const rawInput = identifier.trim();
    const cleanPass = password;

    if (!rawInput) {
      Alert.alert("Input Required", "Please enter your email address or 10-digit mobile number.");
      return;
    }
    if (!cleanPass) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      let resolvedEmail = rawInput.toLowerCase();
      let extractedPhone = "";

      const isMobileInput = !rawInput.includes("@") && /^[0-9+\s-]{7,15}$/.test(rawInput);

      if (isMobileInput) {
        const digits = rawInput.replace(/\D/g, "");
        extractedPhone = digits.length >= 10 ? digits.slice(-10) : digits;

        if (extractedPhone.length < 10) {
          Alert.alert("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
          setLoading(false);
          return;
        }

        // Try looking up registered user by phone or mobile
        try {
          const usersRef = collection(db, "users");
          const qPhone = query(usersRef, where("phone", "==", extractedPhone));
          const phoneSnap = await getDocs(qPhone);

          if (!phoneSnap.empty && phoneSnap.docs[0].data()?.email) {
            resolvedEmail = phoneSnap.docs[0].data().email;
          } else {
            const qPhone91 = query(usersRef, where("phone", "==", `+91${extractedPhone}`));
            const phone91Snap = await getDocs(qPhone91);
            if (!phone91Snap.empty && phone91Snap.docs[0].data()?.email) {
              resolvedEmail = phone91Snap.docs[0].data().email;
            } else {
              const qMobile = query(usersRef, where("mobile", "==", extractedPhone));
              const mobileSnap = await getDocs(qMobile);
              if (!mobileSnap.empty && mobileSnap.docs[0].data()?.email) {
                resolvedEmail = mobileSnap.docs[0].data().email;
              } else {
                resolvedEmail = `${extractedPhone}@urbanhelpers.app`;
              }
            }
          }
        } catch (lookupErr) {
          console.warn("[SignIn] Phone lookup failed, fallback to phone-email:", lookupErr);
          resolvedEmail = `${extractedPhone}@urbanhelpers.app`;
        }
      }

      let firebaseUser = null;
      try {
        const res = await signInWithEmailAndPassword(auth, resolvedEmail, cleanPass);
        firebaseUser = res.user;
      } catch (signInErr: any) {
        if (
          signInErr.code === "auth/user-not-found" ||
          signInErr.code === "auth/invalid-credential" ||
          signInErr.code === "auth/invalid-email"
        ) {
          const createRes = await createUserWithEmailAndPassword(auth, resolvedEmail, cleanPass);
          firebaseUser = createRes.user;
        } else {
          throw signInErr;
        }
      }

      if (firebaseUser) {
        await AsyncStorage.setItem("@customer_logged_in", "true");

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        // If logged in via mobile number, ensure phone field is recorded in user doc
        if (extractedPhone) {
          await setDoc(
            userDocRef,
            {
              phone: extractedPhone,
              mobile: extractedPhone,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }

        if (!userDocSnap.exists() || !userDocSnap.data()?.profileCompleted) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "CreateProfile",
                params: {
                  email: resolvedEmail.endsWith("@urbanhelpers.app") ? "" : resolvedEmail,
                  phone: extractedPhone,
                  name: firebaseUser.displayName || (extractedPhone ? `User ${extractedPhone.slice(-4)}` : resolvedEmail.split("@")[0]),
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

        {/* Top Illustration: Technician Card */}
        <View style={styles.topIllustrationWrap}>
          <Image
            source={require("../../../assets/signin_tech.png")}
            style={styles.topIllustrationImg}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Urban Helpers.</Text>

        {/* Email or Mobile Number Input */}
        <View style={styles.inputGroup}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Text style={styles.inputLabel}>Email or Mobile Number</Text>
            {identifier.trim().length > 0 && (
              <View style={[styles.typeBadge, isPhone ? styles.phoneBadge : styles.emailBadge]}>
                <Ionicons name={isPhone ? "call" : "mail"} size={11} color={isPhone ? "#0D9488" : "#2563EB"} />
                <Text style={[styles.typeBadgeText, { color: isPhone ? "#0D9488" : "#2563EB" }]}>
                  {isPhone ? "Mobile Number" : "Email Address"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.inputBox}>
            <Ionicons
              name={isPhone ? "call-outline" : "mail-outline"}
              size={18}
              color="#64748B"
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="e.g. you@example.com or 98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => navigation.navigate("OTPVerification")}
          >
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
    marginBottom: 6,
  },
  topIllustrationWrap: {
    width: "100%",
    height: 145,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 4,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  topIllustrationImg: {
    width: "92%",
    height: "92%",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 12,
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
    marginBottom: 0,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  phoneBadge: {
    backgroundColor: "#CCFBF1",
  },
  emailBadge: {
    backgroundColor: "#DBEAFE",
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
  },
  inputField: {
    flex: 1,
    fontSize: 14.5,
    color: "#0F172A",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0056D2",
  },
  primaryBtn: {
    backgroundColor: "#0056D2",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  socialButtonsWrap: {
    gap: 10,
  },
  socialBtn: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  footerText: {
    fontSize: 13.5,
    color: "#64748B",
  },
  footerLink: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0056D2",
  },
});
