import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "OTPVerification">;

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleDigitChange = (val: string, index: number) => {
    const clean = val.replace(/\D/g, "");
    const updated = [...digits];
    updated[index] = clean ? clean.slice(-1) : "";
    setDigits(updated);

    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) {
      Alert.alert("Incomplete Code", "Please enter the 6-digit verification code.");
      return;
    }

    await AsyncStorage.setItem("@customer_logged_in", "true");
    navigation.reset({
      index: 0,
      routes: [{ name: "ServicesDashboard" }],
    });
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(45);
    Alert.alert("Code Resent", "A new 6-digit verification code has been sent to your mobile number.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        {/* Top Illustration: Shield & Phone */}
        <View style={styles.topIllustrationWrap}>
          <Image
            source={require("../../../assets/otp_shield.jpg")}
            style={styles.topIllustrationImg}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Mobile</Text>
        <Text style={styles.subtitle}>
          We've sent a 6 digit OTP to{" "}
          <Text style={{ fontWeight: "700", color: "#0F172A" }}>+91 98765 43210</Text>
        </Text>

        {/* 6 OTP Boxes */}
        <View style={styles.otpRow}>
          {digits.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={el => (inputsRef.current[idx] = el)}
              value={digit}
              onChangeText={val => handleDigitChange(val, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              textAlign="center"
            />
          ))}
        </View>

        {/* Resend Link */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
            <Text style={[styles.resendLink, countdown > 0 ? { color: "#94A3B8" } : null]}>
              {countdown > 0 ? `Resend (00:${String(countdown).padStart(2, "0")})` : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} activeOpacity={0.88}>
          <Text style={styles.primaryBtnText}>Verify</Text>
        </TouchableOpacity>

        {/* Security Footnote Banner */}
        <View style={styles.securityBanner}>
          <Ionicons name="information-circle" size={18} color="#0056D2" style={{ marginRight: 8 }} />
          <Text style={styles.securityText}>
            This helps us keep your account safe and secure.
          </Text>
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
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },
  topIllustrationWrap: {
    width: "100%",
    height: 150,
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
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  otpBoxFilled: {
    borderColor: "#0056D2",
    backgroundColor: "#EFF6FF",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  resendText: {
    fontSize: 12.5,
    color: "#64748B",
  },
  resendLink: {
    fontSize: 12.5,
    color: "#0056D2",
    fontWeight: "700",
  },
  primaryBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0056D2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0056D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  securityText: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "600",
    flex: 1,
  },
});
