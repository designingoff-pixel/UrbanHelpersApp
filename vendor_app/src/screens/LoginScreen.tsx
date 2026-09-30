import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const [vendorId, setVendorId] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyVendor = async () => {
    const cleanId = vendorId.trim().toUpperCase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    if (!cleanId) {
      Alert.alert(
        'Vendor ID Required',
        'Please enter your official Vendor ID provided by Urban Helpers Admin (e.g. VND-1042).'
      );
      return;
    }

    if (cleanMobile.length < 10) {
      Alert.alert(
        'Invalid Mobile Number',
        'Please enter your 10-digit mobile number registered with Admin.'
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Direct doc lookup by ID (e.g. VND-1042)
      let vendorData: any = null;
      let actualDocId = cleanId;

      const docRef = doc(db, 'vendors', cleanId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        vendorData = docSnap.data();
      } else {
        // Query by vendorId field in case docId differs
        const q = query(collection(db, 'vendors'), where('vendorId', '==', cleanId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          actualDocId = qSnap.docs[0].id;
          vendorData = qSnap.docs[0].data();
        }
      }

      if (!vendorData) {
        Alert.alert(
          'Vendor ID Not Found',
          `No registered partner was found with ID "${cleanId}".\n\nVendor accounts are provisioned exclusively by the Urban Helpers Admin. Please contact your administrator.`
        );
        return;
      }

      // Check if mobile matches registered mobile
      const registeredMobile = String(vendorData.mobile || '').replace(/\D/g, '').slice(-10);
      if (registeredMobile && registeredMobile !== cleanMobile) {
        Alert.alert(
          'Mobile Number Mismatch',
          `The mobile number entered (+91 ${cleanMobile}) does not match the registered records for Vendor ID "${cleanId}".\n\nPlease check your details or contact Urban Helpers Admin.`
        );
        return;
      }

      // Navigate to OTP verification
      navigation.navigate('VendorAuthOTP', {
        vendorId: cleanId,
        docId: actualDocId,
        name: vendorData.name || `Partner ${cleanId}`,
        mobile: cleanMobile,
        serviceCategory: vendorData.serviceCategory || '',
        otp: '123456',
      });
    } catch (err: any) {
      console.error('[LoginScreen] Lookup error:', err);
      Alert.alert('Connection Error', err.message ?? 'Could not verify vendor ID. Please try again.');
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
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.logoWrap}>
              <View style={styles.logoIcon}>
                <Ionicons name="construct" size={24} color="#059669" />
                <View style={styles.leafBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                </View>
              </View>
              <View>
                <Text style={styles.logoTitle}>URBAN HELPERS</Text>
                <Text style={styles.logoSubtitle}>PARTNER DISPATCH</Text>
              </View>
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineSection}>
            <Text style={styles.welcomeBackText}>Official Partner Access</Text>
            <Text style={styles.loginTitleText}>Vendor Portal</Text>
            <Text style={styles.subText}>
              Enter your Admin-assigned Vendor ID and registered mobile number to receive OTP.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Vendor ID Input */}
            <View>
              <Text style={styles.inputLabel}>VENDOR ID</Text>
              <View style={styles.inputCard}>
                <Ionicons name="card-outline" size={20} color="#059669" style={styles.inputLeftIcon} />
                <TextInput
                  style={[styles.textInput, { fontWeight: '700', letterSpacing: 1 }]}
                  placeholder="e.g. VND-1042"
                  placeholderTextColor="#94A3B8"
                  value={vendorId}
                  onChangeText={setVendorId}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Registered Mobile Input */}
            <View>
              <Text style={styles.inputLabel}>REGISTERED MOBILE NUMBER</Text>
              <View style={styles.inputCard}>
                <View style={styles.dialCodePill}>
                  <Text style={styles.dialCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.textInput, { marginLeft: 10 }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                />
                <Feather name="phone" size={18} color="#94A3B8" />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleVerifyVendor}
              activeOpacity={0.85}
              disabled={loading}
              style={styles.loginBtnTouch}
            >
              <LinearGradient
                colors={['#059669', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Verify ID & Send OTP</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Notice Box */}
            <View style={styles.securityBox}>
              <View style={styles.securityIconWrap}>
                <Ionicons name="lock-closed" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Admin Provisioned Access Only</Text>
                <Text style={styles.securityText}>
                  Self-registration and email logins are disabled. Only approved partners registered by Urban Helpers Administration can log in.
                </Text>
              </View>
            </View>
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
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 28 : 14,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  leafBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.2,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 2,
  },
  headlineSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  welcomeBackText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginTitleText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#064E3B',
    lineHeight: 34,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  formSection: {
    marginTop: 20,
    gap: 16,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    height: 56,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  dialCodePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dialCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  loginBtnTouch: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  loginBtn: {
    height: 54,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 14,
    gap: 12,
    marginTop: 10,
  },
  securityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 3,
  },
  securityText: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
  },
});
