import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image,
  Linking, Dimensions, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Job } from '../data/types';
import { Colors, Typography, Spacing, Radius } from '../theme';
import {
  updateBookingStatus, notifyCustomerOTP,
  acceptJob,
  rejectJob,
} from '../services/firestoreService';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [, forceUpdate] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => store.subscribe(() => forceUpdate((n) => n + 1)), []);

  const job = store.getJob(jobId);
  if (!job) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Job Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Job details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Call Customer Handler ────────────────────────────────────────────────
  const handleCallCustomer = () => {
    const phone = job.customerPhone || '9876543210';
    Alert.alert(
      'Call Customer',
      `Call ${job.customerName || 'Customer'} at ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  // ── Accept Job (Screen 2 Action) ──────────────────────────────────────────
  const handleAcceptJob = async () => {
    setSubmitting(true);
    try {
      await acceptJob(
        job.bookingId,
        store.vendorId || 'vendor-1',
        store.vendor.name || 'Viswesh',
        store.vendor.mobile || '9876543210',
        store.vendor.avatar
      );
      store.updateJobStatus(jobId, 'ACCEPTED', { acceptedAt: Date.now() });
      Alert.alert('Job Accepted ✅', 'You have acknowledged and accepted this booking.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not accept job.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Primary Action Based on Status ────────────────────────────────────────
  const isUnaccepted = job.status === 'ADMIN_ASSIGNED' || job.status === 'NEW_REQUEST';
  const isAccepted = !isUnaccepted && job.status !== 'COMPLETED';

  const handleNextStep = async () => {
    switch (job.status) {
      case 'ACCEPTED':
      case 'UPCOMING':
        await updateBookingStatus(job.bookingId, 'en_route').catch(() => {});
        store.updateJobStatus(jobId, 'NAVIGATING');
        navigation.navigate('Map', { jobId });
        return;

      case 'NAVIGATING':
        try {
          await updateBookingStatus(job.bookingId, 'arrived');
          store.updateJobStatus(jobId, 'ARRIVED', { arrivedAt: Date.now() });
          if (job.customerId && job.otp) {
            notifyCustomerOTP(job.customerId, String(job.otp)).catch(console.warn);
          }
          Alert.alert("You've Arrived!", 'Please verify customer OTP to begin.');
        } catch (e: any) {
          Alert.alert('Error', e.message);
        }
        break;

      case 'ARRIVED':
      case 'OTP_PENDING':
        await updateBookingStatus(job.bookingId, 'arrived').catch(() => {});
        store.updateJobStatus(jobId, 'OTP_PENDING');
        navigation.navigate('OTP', { jobId });
        return;

      case 'CUSTOMER_VERIFIED':
      case 'SERVICE_STARTED':
      case 'RECORDING_ACTIVE':
        store.startRecording(jobId);
        navigation.navigate('Service', { jobId });
        return;

      case 'COMPLETED':
        navigation.navigate('Complete', { jobId });
        return;
    }
  };

  const displayDate = job.date || 'Sep 30';
  const displayTime = job.time || '1:26 PM';
  const displayAddress = job.address || 'CVFF+5H9, Morur, Tamil Nadu';
  const displayEarnings = job.vendorEarnings || 480;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* ── Top Header ──────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Job Details</Text>
        <TouchableOpacity style={s.moreBtn} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {isUnaccepted ? (
          /* ══════════════════════════════════════════════════════════
             SCREEN 2: UNACCEPTED / ASSIGNED STATE
             ══════════════════════════════════════════════════════════ */
          <>
            {/* Hero Image Banner with Sofa / Living Room */}
            <View style={s.heroBannerWrap}>
              <ImageBackground
                source={{
                  uri: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1000&q=80',
                }}
                style={s.heroBannerImg}
                imageStyle={{ borderRadius: 24 }}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
                  style={s.heroBannerGradient}
                >
                  <View style={s.heroAssignedBadge}>
                    <Ionicons name="person" size={13} color="#FFFFFF" />
                    <Text style={s.heroAssignedBadgeText}>ASSIGNED BY URBAN CAPTAIN</Text>
                  </View>

                  <Text style={s.heroServiceTitle}>{job.serviceName || 'Full Home Cleaning'}</Text>
                  <Text style={s.heroServiceSub}>Make your home shine ✨</Text>
                </LinearGradient>
              </ImageBackground>
            </View>

            {/* Customer Contact Card */}
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.iconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="call" size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.cardMiniLabel}>Customer</Text>
                  <Text style={s.cardMainValue}>{job.customerName || 'Visweswaran .P'}</Text>
                </View>
                <TouchableOpacity
                  style={s.callBtn}
                  onPress={handleCallCustomer}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={14} color="#0D3325" />
                  <Text style={s.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Earnings Card */}
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Earnings')}
            >
              <View style={s.cardRow}>
                <View style={[s.iconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="wallet" size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.cardMiniLabel}>Your Earnings</Text>
                  <Text style={s.cardMainValue}>₹{displayEarnings}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Job Details Card (Date & Time, Duration, Location) */}
            <View style={s.card}>
              {/* Date & Time */}
              <View style={s.detailRow}>
                <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="calendar-outline" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={s.detailLabel}>Date & Time</Text>
                  <Text style={s.detailValue}>{displayDate} • {displayTime}</Text>
                </View>
              </View>

              <View style={s.innerDivider} />

              {/* Duration */}
              <View style={s.detailRow}>
                <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="time-outline" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={s.detailLabel}>Duration</Text>
                  <Text style={s.detailValue}>{job.estimatedDuration || '1 hr'}</Text>
                </View>
              </View>

              <View style={s.innerDivider} />

              {/* Location */}
              <View style={s.detailRow}>
                <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="location-outline" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={s.detailLabel}>Location</Text>
                  <Text style={s.detailValue} numberOfLines={2}>{displayAddress}</Text>
                </View>
                <TouchableOpacity
                  style={s.mapIconBtn}
                  onPress={() => navigation.navigate('Map', { jobId })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="map-outline" size={18} color="#0D3325" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer Instructions Card */}
            <View style={s.card}>
              <View style={s.detailRow}>
                <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="document-text-outline" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={s.detailLabel}>Customer Instructions</Text>
                  <View style={s.instructionsBox}>
                    <Text style={s.instructionsQuotes}>" "</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* ══════════════════════════════════════════════════════════
             SCREEN 3: ACCEPTED / ACTIVE STATE
             ══════════════════════════════════════════════════════════ */
          <>
            {/* Service Summary Card */}
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={s.serviceIconCircle}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80' }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.acceptedServiceName}>{job.serviceName || 'Full Home Cleaning'}</Text>
                  <Text style={s.bookingIdText} numberOfLines={1}>
                    Booking ID: {job.bookingId || 'I9Vcb5v72k6Q3D6GPutz'}
                  </Text>
                </View>
                <View style={s.assignedStatusPill}>
                  <Text style={s.assignedStatusPillText}>ASSIGNED</Text>
                </View>
              </View>
            </View>

            {/* Customer Card */}
            <TouchableOpacity style={s.card} activeOpacity={0.8} onPress={handleCallCustomer}>
              <View style={s.cardRow}>
                <View style={[s.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                  <Ionicons name="person" size={20} color="#4B5563" />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.cardMiniLabel}>Customer</Text>
                  <Text style={s.cardMainValue}>{job.customerName || 'Visweswaran .P'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Ionicons name="call" size={13} color="#10B981" />
                    <Text style={s.callCustomerLinkText}>Call Customer</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Earnings Card */}
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Earnings')}
            >
              <View style={s.cardRow}>
                <View style={[s.iconCircle, { backgroundColor: '#0D3325' }]}>
                  <Ionicons name="wallet" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.cardMiniLabel}>Your Earnings</Text>
                  <Text style={s.cardMainValue}>₹{displayEarnings}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Date & Time + Duration 2-Col Card */}
            <View style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                    <Ionicons name="calendar-outline" size={15} color="#10B981" />
                  </View>
                  <View>
                    <Text style={s.detailLabel}>Date & Time</Text>
                    <Text style={s.detailValue}>{displayDate} • {displayTime}</Text>
                  </View>
                </View>

                <View style={{ width: 1, height: 36, backgroundColor: '#E5E7EB', marginHorizontal: 8 }} />

                <View style={{ flex: 0.8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                    <Ionicons name="time-outline" size={15} color="#10B981" />
                  </View>
                  <View>
                    <Text style={s.detailLabel}>Duration</Text>
                    <Text style={s.detailValue}>{job.estimatedDuration || '1 hr'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Location Card */}
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.miniIconCircle, { backgroundColor: '#E8F8F0' }]}>
                  <Ionicons name="location-outline" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={s.detailLabel}>Location</Text>
                  <Text style={s.detailValue} numberOfLines={2}>{displayAddress}</Text>
                </View>
                <TouchableOpacity
                  style={s.viewMapPillBtn}
                  onPress={() => navigation.navigate('Map', { jobId })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map" size={13} color="#0D3325" />
                  <Text style={s.viewMapPillBtnText}>View Map</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Status Card */}
            <View style={s.card}>
              <View style={s.cardRow}>
                <View style={[s.iconCircle, { backgroundColor: '#0D3325' }]}>
                  <Ionicons name="cash" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={s.cardMiniLabel}>Payment Status</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={s.paidText}>PAID</Text>
                  </View>
                  <Text style={s.paidSub}>Customer has paid. No cash collection needed.</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Bottom Fixed Action Button ──────────────────────────── */}
      <View style={s.bottomBar}>
        {isUnaccepted ? (
          <TouchableOpacity
            style={[s.primaryBtn, submitting && { opacity: 0.7 }]}
            onPress={handleAcceptJob}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={s.primaryBtnText}>Acknowledge & Accept</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={handleNextStep}
            activeOpacity={0.85}
          >
            <Ionicons
              name={
                job.status === 'ACCEPTED' || job.status === 'UPCOMING'
                  ? 'navigate'
                  : job.status === 'NAVIGATING'
                  ? 'location'
                  : job.status === 'ARRIVED' || job.status === 'OTP_PENDING'
                  ? 'shield-checkmark'
                  : 'play-circle'
              }
              size={18}
              color="#FFFFFF"
            />
            <Text style={s.primaryBtnText}>
              {job.status === 'ACCEPTED' || job.status === 'UPCOMING'
                ? 'Navigate to Customer'
                : job.status === 'NAVIGATING'
                ? "I've Arrived"
                : job.status === 'ARRIVED' || job.status === 'OTP_PENDING'
                ? 'Verify Customer OTP'
                : 'Start Active Service'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F7F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 6 },

  // ── Hero Banner ──────────────────────────────────────────────────────────
  heroBannerWrap: {
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroBannerImg: {
    width: '100%',
    height: '100%',
  },
  heroBannerGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
    borderRadius: 24,
  },
  heroAssignedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13,51,37,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  heroAssignedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroServiceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroServiceSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },

  // ── Card Styles ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMiniLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  cardMainValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  acceptedServiceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  bookingIdText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  assignedStatusPill: {
    backgroundColor: '#0D3325',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assignedStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D3325',
  },
  callCustomerLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  innerDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  mapIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMapPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewMapPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D3325',
  },

  instructionsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  instructionsQuotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  paidText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  paidSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  // ── Bottom Fixed Bar ─────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(246,247,249,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D3325',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    gap: 8,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
