import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/AppStore';

interface Props {
  route: any;
  navigation: any;
}

export default function VendorAuthOTPScreen({ route, navigation }: Props) {
  const {
    vendorId = 'VND-0000',
    docId = '',
    name = 'Vendor Partner',
    mobile = '9876543210',
    serviceCategory = '',
    otp = '123456',
  } = route.params || {};

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleDigitChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    if (clean.length > 1) {
      const split = clean.slice(0, 6).split('');
      for (let i = 0; i < split.length; i++) {
        newDigits[i] = split[i];
      }
      setDigits(newDigits);
      const nextIdx = Math.min(split.length, 5);
      inputRefs.current[nextIdx]?.focus();
      setFocusedIndex(nextIdx);
      return;
    }

    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    setTimerSeconds(45);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Sent', `A fresh 6-digit OTP has been sent to +91 ${mobile}`);
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits of the OTP.');
      return;
    }

    if (code !== '123456' && code !== String(otp)) {
      Alert.alert('Invalid OTP', 'The entered code does not match. Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        vendorId,
        docId: docId || vendorId,
        name,
        mobile,
        serviceCategory,
      };

      await AsyncStorage.setItem('@vendor_session', JSON.stringify(sessionData));
      store.setFirebaseUser(vendorId, name, mobile);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err: any) {
      console.error('[VendorAuthOTP] Verify error:', err);
      Alert.alert('Login Error', err.message ?? 'Failed to finalize session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#064E3B" />
              <Text style={styles.backText}>Change Vendor ID</Text>
            </TouchableOpacity>

            <View style={styles.vendorIdPill}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.vendorIdText}>{vendorId}</Text>
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineRow}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit OTP to registered mobile{' '}
              <Text style={styles.mobileHighlight}>+91 {mobile}</Text> for partner{' '}
              <Text style={styles.mobileHighlight}>{name}</Text>.
            </Text>
          </View>

          {/* 6 Digit OTP Input Boxes */}
          <View style={styles.otpBoxesRow}>
            {digits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => {
                  inputRefs.current[idx] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === idx && styles.otpBoxFocused,
                  Boolean(digit) && styles.otpBoxFilled,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                onFocus={() => setFocusedIndex(idx)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend Timer Row */}
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 5 }} />
            {timerSeconds > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in <Text style={styles.timerBold}>{formatTimer(timerSeconds)}</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendBtnText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify & Continue Button */}
          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={loading}
            style={styles.verifyTouch}
          >
            <LinearGradient
              colors={['#059669', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.verifyBtnText}>Verify & Enter App</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Trust Badge Card */}
          <View style={styles.trustCard}>
            <View style={styles.trustIconWrap}>
              <Ionicons name="shield-checkmark" size={22} color="#059669" />
            </View>
            <View style={styles.trustTextWrap}>
              <Text style={styles.trustTitle}>Urban Helpers Partner Network</Text>
              <Text style={styles.trustSub}>Orders are assigned directly by Urban Helpers Administration.</Text>
            </View>
          </View>

          {/* Demo Hint */}
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>
              Testing Demo Code: <Text style={styles.demoCode}>123456</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FCF9',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
  vendorIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  vendorIdText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  headlineRow: {
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#064E3B',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  mobileHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFocused: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: '#10B981',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  timerText: {
    fontSize: 13,
    color: '#64748B',
  },
  timerBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    textDecorationLine: 'underline',
  },
  verifyTouch: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
    marginVertical: 16,
  },
  verifyBtn: {
    height: 54,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F9F0',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    gap: 12,
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustTextWrap: {
    flex: 1,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 2,
  },
  trustSub: {
    fontSize: 11,
    color: '#047857',
  },
  demoBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  demoCode: {
    fontWeight: '700',
    color: '#059669',
  },
});
