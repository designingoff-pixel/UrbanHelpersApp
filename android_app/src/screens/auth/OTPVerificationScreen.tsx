import React, { useState, useEffect, useRef } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "OTPVerification">;

export default function OTPVerificationScreen({ navigation }: Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Focus next box
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Incomplete Code", "Please enter the 6-digit verification code sent to your device.");
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      await AsyncStorage.setItem("@customer_logged_in", "true");
      navigation.reset({
        index: 0,
        routes: [{ name: "ServicesDashboard" }],
      });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        {/* Top Illustration: Security Shield Card */}
        <View style={styles.topIllustrationWrap}>
          <Image
            source={require("../../../assets/otp_shield.png")}
            style={styles.topIllustrationImg}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to your registered mobile number.
        </Text>

        {/* 6 Digit Inputs */}
        <View style={styles.otpBoxesRow}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => (inputRefs.current[idx] = ref)}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Timer */}
        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.resendTimerText}>
              Resend code in <Text style={styles.resendTimerHighlight}>00:{timer < 10 ? `0${timer}` : timer}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={styles.resendActionText}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Verify & Proceed</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityBadge}>
          <Ionicons name="lock-closed" size={14} color="#059669" />
          <Text style={styles.securityText}>256-Bit Encrypted Authentication</Text>
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
    alignSelf: "flex-start",
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
    marginTop: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 22,
    width: "100%",
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  otpBoxFilled: {
    borderColor: "#0056D2",
    backgroundColor: "#EFF6FF",
  },
  resendRow: {
    marginBottom: 26,
  },
  resendTimerText: {
    fontSize: 13,
    color: "#64748B",
  },
  resendTimerHighlight: {
    fontWeight: "800",
    color: "#0F172A",
  },
  resendActionText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0056D2",
  },
  primaryBtn: {
    width: "100%",
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
    marginBottom: 16,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  securityText: {
    fontSize: 11.5,
    color: "#059669",
    fontWeight: "600",
  },
});
