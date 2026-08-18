import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import {
  verifyVendorOTP,
  formatOTPTimer,
  getVendorById,
} from "@/services/recordingService";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyYourHelper">;

export default function VerifyYourHelperScreen({ navigation, route }: Props) {
  const { bookingId, vendorId } = route.params;
  const vendor = getVendorById(vendorId);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [otpError, setOtpError] = useState<string | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => formatOTPTimer(seconds);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) return;
    if (isNaN(Number(text)) && text !== "") return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setOtpError(null);

    if (text !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((digit) => digit !== "")) {
      Keyboard.dismiss();
    }
  };

  const handleBackspace = (index: number) => {
    if (otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOTP = otp.join("");
    if (enteredOTP.length < 4) return;

    const result = verifyVendorOTP(bookingId, enteredOTP);
    if (result.success) {
      navigation.navigate("HelperVerified", { bookingId, vendorId });
    } else {
      setOtpError(result.reason ?? "Invalid OTP.");
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Illustration */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.illustrationSection}>
          <View style={s.illustrationContainer}>
            <View style={s.glowBg} />
            <Image
              source={{
                uri: "https://via.placeholder.com/280",
              }}
              style={s.illustration}
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(380)}
          style={s.titleSection}
        >
          <Text style={s.title}>Verify Your Helper</Text>
          <Text style={s.subtitle}>
            Ask your helper for the 4-digit verification code shown on their
            Urban Helpers app.
          </Text>
        </Animated.View>

        {/* OTP Input */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(380)}
          style={s.otpSection}
        >
          <View style={s.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  s.otpInput,
                  digit !== "" && s.otpInputFilled,
                  otpError !== null && s.otpInputError,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    handleBackspace(index);
                  }
                }}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="•"
                placeholderTextColor="rgba(207, 188, 255, 0.3)"
              />
            ))}
          </View>
          {otpError && (
            <Text style={s.otpErrorText}>{otpError}</Text>
          )}
        </Animated.View>

        {/* Timer */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(380)}
          style={s.timerSection}
        >
          <Ionicons name="timer-outline" size={16} color="#06d6a0" />
          <Text style={s.timerText}>
            OTP expires in {formatTime(timeLeft)}
          </Text>
        </Animated.View>

        {/* Safety Message */}
        <Animated.View
          entering={FadeInDown.delay(240).duration(380)}
          style={s.safetyCard}
        >
          <Ionicons name="shield" size={20} color="#118ab2" />
          <Text style={s.safetyText}>
            Only start the service after confirming the helper's identity.
          </Text>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={s.bottomActions}>
        <LinearGradient
          colors={["#118ab2", "#06d6a0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.verifyBtn}
        >
          <Pressable
            onPress={handleVerify}
            disabled={!otp.every((d) => d !== "")}
            style={[
              s.verifyBtnInner,
              !otp.every((d) => d !== "") && { opacity: 0.5 },
            ]}
          >
            <Text style={s.verifyBtnText}>Verify Helper</Text>
          </Pressable>
        </LinearGradient>

        <Pressable
          onPress={() => {
            setTimeLeft(180);
            setOtp(["", "", "", ""]);
            setOtpError(null);
            inputRefs.current[0]?.focus();
          }}
          style={s.resendBtn}
        >
          <Text style={s.resendBtnText}>Didn't receive a code?</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(33, 31, 36, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  illustrationSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  illustrationContainer: {
    position: "relative",
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  glowBg: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(6, 214, 160, 0.2)",
    opacity: 0.5,
  },
  illustration: {
    width: 280,
    height: 280,
    borderRadius: 32,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  otpSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  otpInput: {
    width: 64,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(29, 27, 32, 1)",
    borderWidth: 1,
    borderColor: "rgba(148, 142, 156, 1)",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  otpInputFilled: {
    borderColor: "#06d6a0",
    backgroundColor: "rgba(6, 214, 160, 0.08)",
  },
  otpInputError: {
    borderColor: "#ffb4ab",
    backgroundColor: "rgba(255, 180, 171, 0.08)",
  },
  otpErrorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#ffb4ab",
    textAlign: "center",
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#06d6a0",
  },
  safetyCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(29, 27, 32, 1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "flex-start",
  },
  safetyText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  bottomActions: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  verifyBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  verifyBtnInner: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resendBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  resendBtnText: {
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: "none",
  },
});
