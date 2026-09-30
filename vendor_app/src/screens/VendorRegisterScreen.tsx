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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  navigation: any;
}

export default function VendorRegisterScreen({ navigation }: Props) {
  const [mobile, setMobile] = useState('');

  const handleSendOTP = () => {
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    navigation.navigate('VendorAuthOTP', {
      mobile: cleanMobile,
      isNewUser: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Logo & Mascot Header */}
          <View style={styles.headerRow}>
            {/* Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.logoIcon}>
                <Ionicons name="home" size={20} color="#059669" />
                <Ionicons name="leaf" size={12} color="#10b981" style={styles.leafBadge} />
              </View>
              <View>
                <Text style={styles.logoTitle}>Urban Helpers</Text>
                <Text style={styles.logoSubtitle}>VENDOR</Text>
              </View>
            </View>

            {/* Mascot Character Image */}
            <View style={styles.mascotWrap}>
              <Image
                source={require('../../assets/vendor_auth/partner_mascot.png')}
                style={styles.mascotImg}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Headline Section */}
          <View style={styles.headlineSection}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.partnerText}>Our Valued Partner</Text>
            <Text style={styles.subText}>
              Join thousands of trusted vendors and grow your business with Urban Helpers.
            </Text>
          </View>

          {/* 4 Feature Value Proposition Cards */}
          <View style={styles.featuresCard}>
            <View style={styles.featuresRow}>
              {/* Feature 1 */}
              <View style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#E6F9F0' }]}>
                  <Ionicons name="storefront-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.featureLabel}>Get More{'\n'}Customers</Text>
              </View>

              {/* Feature 2 */}
              <View style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#E8F2FE' }]}>
                  <Feather name="trending-up" size={24} color="#1E88E5" />
                </View>
                <Text style={styles.featureLabel}>Grow{'\n'}Your Business</Text>
              </View>

              {/* Feature 3 */}
              <View style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#F0ECFC' }]}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#7C4DFF" />
                </View>
                <Text style={styles.featureLabel}>Secure &{'\n'}Reliable</Text>
              </View>

              {/* Feature 4 */}
              <View style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#FEF3E7' }]}>
                  <MaterialCommunityIcons name="handshake-outline" size={26} color="#F57C00" />
                </View>
                <Text style={styles.featureLabel}>Long-Term{'\n'}Partnership</Text>
              </View>
            </View>
          </View>

          {/* Mobile Input Field */}
          <View style={styles.inputContainer}>
            <View style={styles.dialCodeBox}>
              <Text style={styles.dialCode}>+91</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 3 }} />
            </View>
            <View style={styles.verticalDivider} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
            />
            <Ionicons name="call-outline" size={20} color="#94A3B8" style={styles.callIcon} />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            onPress={handleSendOTP}
            activeOpacity={0.85}
            style={styles.sendOtpTouch}
          >
            <LinearGradient
              colors={['#059669', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendOtpBtn}
            >
              <Text style={styles.sendOtpText}>Send OTP</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Script Slogan */}
          <View style={styles.sloganWrap}>
            <Text style={styles.sloganText}>Together We Build Better Communities</Text>
          </View>

          {/* Bottom Link: Already a Partner? Log in */}
          <View style={styles.footerRow}>
            <View style={styles.footerDivider} />
            <View style={styles.footerTextWrap}>
              <Text style={styles.alreadyPartnerText}>Already a Partner? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerDivider} />
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
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 180,
    marginTop: 8,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  leafBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.3,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 2.2,
  },
  mascotWrap: {
    width: 170,
    height: 180,
    position: 'absolute',
    right: -10,
    top: 0,
    zIndex: 1,
  },
  mascotImg: {
    width: '100%',
    height: '100%',
  },
  headlineSection: {
    marginTop: 10,
    maxWidth: '65%',
  },
  welcomeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 2,
  },
  partnerText: {
    fontSize: 27,
    fontWeight: '900',
    color: '#064E3B',
    lineHeight: 33,
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginTop: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    height: 56,
    paddingHorizontal: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dialCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  dialCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  callIcon: {
    marginLeft: 6,
  },
  sendOtpTouch: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  sendOtpBtn: {
    height: 54,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendOtpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sloganWrap: {
    alignItems: 'center',
    marginVertical: 14,
  },
  sloganText: {
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  footerTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  alreadyPartnerText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
    textDecorationLine: 'underline',
  },
});
