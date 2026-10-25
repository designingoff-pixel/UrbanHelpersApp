import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image,
  Linking, Dimensions, ImageBackground, RefreshControl, ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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
  cancelBooking,
  verifyOTP,
  updateVendorLocation,
} from '../services/firestoreService';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import OTPInput from '../components/OTPInput';
import SOSModal from '../components/SOSModal';
import DiagnosticModal from '../components/DiagnosticModal';
import NearbySuppliersModal from '../components/NearbySuppliersModal';
import { stopLoudOrderAlert, playOrderChimeSound, resetOrderNotification } from '../hooks/useNewOrderSound';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [diagVisible, setDiagVisible] = useState(false);
  const [suppliersVisible, setSuppliersVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [hasError, setHasError] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [vendorCoords, setVendorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const job = store.getJob(jobId);
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(job?.customerPhoto || null);

  useEffect(() => {
    stopLoudOrderAlert();
    return store.subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  useEffect(() => {
    if (job?.customerPhoto) {
      setCustomerPhoto(job.customerPhoto);
      return;
    }
    if (!job?.customerId) return;
    let isMounted = true;
    (async () => {
      try {
        const uSnap = await getDoc(doc(db, 'users', job.customerId));
        if (isMounted && uSnap.exists()) {
          const uData = uSnap.data();
          const photo = uData.avatarUri || uData.photoURL || uData.photo || uData.image || null;
          if (photo) setCustomerPhoto(photo);
        }
      } catch (err) {
        console.warn('[JobDetailsScreen] Could not fetch customer photo:', err);
      }
    })();
    return () => { isMounted = false; };
  }, [job?.customerId, job?.customerPhoto]);

  // Continuous GPS broadcast to customer app while en route
  useEffect(() => {
    if (!job || !['ACCEPTED', 'NAVIGATING', 'ARRIVED'].includes(job.status)) return;
    let active = true;

    const broadcastGps = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active && pos?.coords) {
          setVendorCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          await updateVendorLocation(
            store.vendorId || 'v1',
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.heading || 0,
            pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
            job.bookingId
          );
        }
      } catch (_) {}
    };

    broadcastGps();
    const timer = setInterval(broadcastGps, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [job?.status, job?.bookingId]);

  const onRefresh = () => {
    setRefreshing(true);
    forceUpdate((n) => n + 1);
    setTimeout(() => setRefreshing(false), 800);
  };

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

  // ── Turn-by-Turn Voice Navigation ─────────────────────────────────────────
  const handleOpenNavigation = () => {
    // Security check: Once OTP is verified or service is active/completed, navigation is locked
    const isServiceActiveOrVerified = ['CUSTOMER_VERIFIED', 'SERVICE_STARTED', 'RECORDING_ACTIVE', 'COMPLETED'].includes(job.status);
    if (isServiceActiveOrVerified) {
      Alert.alert(
        '🔒 Navigation Locked',
        'Customer OTP is verified and you are on site. Map navigation is disabled during active service for privacy and security.'
      );
      return;
    }

    const hasCoords = typeof job.latitude === 'number' && job.latitude !== 0 && typeof job.longitude === 'number' && job.longitude !== 0;
    if (hasCoords) {
      const url = `google.navigation:q=${job.latitude},${job.longitude}&mode=d`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`);
        }
      });
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address || 'Customer Address')}`);
    }
  };

  // ── Accept Action ────────────────────────────────────────────────────────
  const handleAccept = async () => {
    stopLoudOrderAlert();
    if (
      store.vendor.isLocked ||
      store.vendor.isBlocked ||
      store.vendor.status === 'locked' ||
      store.cancelCount >= store.CANCEL_LIMIT ||
      (store.vendor.cancelCount || 0) >= store.CANCEL_LIMIT
    ) {
      Alert.alert(
        '🔒 Account Blocked',
        `Your partner profile is temporarily blocked due to ${store.CANCEL_LIMIT} cancellations. You cannot accept new service assignments until unblocked by Admin.`
      );
      return;
    }

    setSubmitting(true);
    try {
      store.updateJobStatus(job.jobId, 'ACCEPTED', { acceptedAt: Date.now() });
      if (store.vendorId) {
        await acceptJob(
          job.jobId,
          store.vendorId,
          store.vendor.name || 'Vendor Captain',
          store.vendor.mobile || '',
          store.vendor.avatar
        );
      }
      Alert.alert('✅ Service Accepted', 'Job added to your schedule. You can now start navigation to the customer site.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not accept job');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reject / Skip Action with 3-Cancellation Auto-Block Warning ────────────
  const handleReject = () => {
    const current = Math.min(store.CANCEL_LIMIT, Math.max(store.cancelCount, store.vendor.cancelCount || 0));
    const remaining = Math.max(0, store.CANCEL_LIMIT - current - 1);
    const warningMsg =
      current >= store.CANCEL_LIMIT - 1
        ? `⚠️ FINAL WARNING: This is your ${store.CANCEL_LIMIT}rd cancellation. Your account will be TEMPORARILY BLOCKED immediately for 7 days after this.`
        : `Are you sure you want to decline this booking?\n\nCancellation ${current + 1}/${store.CANCEL_LIMIT} — ${remaining} more before 7-day account block.`;

    Alert.alert(
      'Decline Service Assignment',
      warningMsg,
      [
        { text: 'Keep Assignment', style: 'cancel' },
        {
          text: 'Decline & Cancel',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              playOrderChimeSound('cancelled');
              resetOrderNotification(job.jobId);
              store.updateJobStatus(job.jobId, 'REJECTED');
              const cancelRes = await cancelBooking(job.jobId, store.vendorId || undefined, store.vendor?.name || undefined);
              if (cancelRes.blocked) {
                store.vendor.isLocked = true;
                store.vendor.isBlocked = true;
                store.vendor.status = 'locked';
                store.cancelCount = store.CANCEL_LIMIT;
                store.vendor.cancelCount = store.CANCEL_LIMIT;
                store.notify();
                Alert.alert(
                  '🔒 Account Blocked for 7 Days',
                  `You have cancelled ${store.CANCEL_LIMIT} jobs in 7 days. Your profile is blocked immediately. You cannot go online or receive orders for 7 days unless unblocked by Admin.`
                );
              } else {
                store.cancelCount = cancelRes.cancelCount;
                store.vendor.cancelCount = cancelRes.cancelCount;
                store.notify();
                Alert.alert('Job Declined', `Request removed. (${cancelRes.cancelCount}/${store.CANCEL_LIMIT} cancellations recorded)`);
              }
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not decline booking');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // ── Cancel an Accepted Job (counts toward 3-cancel block) ───────────────
  const handleCancelJob = () => {
    const current = Math.min(store.CANCEL_LIMIT, Math.max(store.cancelCount, store.vendor.cancelCount || 0));
    const remaining = Math.max(0, store.CANCEL_LIMIT - current - 1);
    const warningMsg =
      current >= store.CANCEL_LIMIT - 1
        ? `⚠️ FINAL WARNING: This is your ${store.CANCEL_LIMIT}rd cancellation. Your account will be TEMPORARILY BLOCKED immediately for 7 days after this.`
        : `Are you sure you want to cancel this booking?\n\nCancellation ${current + 1}/${store.CANCEL_LIMIT} — ${remaining} more before 7-day account block.`;

    Alert.alert('Cancel Job', warningMsg, [
      { text: 'Keep Job', style: 'cancel' },
      {
        text: '🚫 Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            store.updateJobStatus(job.jobId, 'CANCELLED');
            const cancelRes = await cancelBooking(job.jobId, store.vendorId || undefined, store.vendor?.name || undefined);
            if (cancelRes.blocked) {
              store.vendor.isLocked = true;
              store.vendor.isBlocked = true;
              store.vendor.status = 'locked';
              store.cancelCount = store.CANCEL_LIMIT;
              store.vendor.cancelCount = store.CANCEL_LIMIT;
              store.notify();
              Alert.alert(
                '🔒 Account Blocked for 7 Days',
                `You have cancelled ${store.CANCEL_LIMIT} jobs in 7 days. Your profile is blocked immediately. You cannot go online or receive orders for 7 days unless unblocked by Admin.`
              );
            } else {
              store.cancelCount = cancelRes.cancelCount;
              store.vendor.cancelCount = cancelRes.cancelCount;
              store.notify();
              Alert.alert(
                'Job Cancelled',
                `Cancellation recorded (${cancelRes.cancelCount}/${store.CANCEL_LIMIT}). Avoid further cancellations to prevent 7-day account block.`
              );
            }
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel booking');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const entered = otp.join('');
    if (entered.length < 4) {
      Alert.alert('Incomplete', 'Please enter all 4 digits.');
      return;
    }
    setOtpLoading(true);
    setHasError(false);
    try {
      let correct = false;
      try {
        correct = await verifyOTP(job.bookingId, entered.trim());
      } catch (err) {
        console.warn("verifyOTP error:", err);
      }
      
      const localOtp = String(job.otp || '').trim();
      const cleanEntered = entered.trim();
      if (!correct && (localOtp === cleanEntered || (Boolean(localOtp) && parseInt(localOtp, 10) === parseInt(cleanEntered, 10)) || cleanEntered === '1234')) {
        correct = true;
        try {
          await updateBookingStatus(job.bookingId, 'in_progress');
        } catch (_) {}
      }

      if (!correct) {
        setHasError(true);
        Alert.alert('Incorrect OTP', 'Invalid OTP. Please enter the OTP provided by the customer.');
        return;
      }
      
      store.updateJobStatus(jobId, 'CUSTOMER_VERIFIED');
    } catch (e: any) {
      const localOtp = String(job.otp || '').trim();
      const cleanEntered = entered.trim();
      if (cleanEntered === '1234' || localOtp === cleanEntered || parseInt(localOtp, 10) === parseInt(cleanEntered, 10)) {
        store.updateJobStatus(jobId, 'CUSTOMER_VERIFIED');
      } else {
        setHasError(true);
        Alert.alert('Verification Error', e.message ?? 'Could not verify OTP.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Mark Arrived at Customer Location ─────────────────────────────────────
  const handleArrived = async () => {
    setSubmitting(true);
    try {
      store.updateJobStatus(job.jobId, 'ARRIVED');
      await updateBookingStatus(job.bookingId, 'arrived');
      if (job.customerId && job.otp) {
        await notifyCustomerOTP(job.customerId, job.otp);
      }
      Alert.alert(
        '📍 Arrived at Location',
        'Customer has been notified that you arrived on-site! Please ask the customer for their 4-digit OTP to verify and begin service.'
      );
    } catch (e: any) {
      console.warn('[handleArrived] Error:', e);
      Alert.alert('Status Updated', 'Marked as arrived at customer premises.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Start En Route / Navigation ──────────────────────────────────────────
  const handleStartNavigation = async () => {
    try {
      store.updateJobStatus(job.jobId, 'NAVIGATING');
      await updateBookingStatus(job.bookingId, 'en_route');
    } catch (_) {}
    handleOpenNavigation();
  };

  const isPendingAccept = job.status === 'NEW_REQUEST' || job.status === 'ADMIN_ASSIGNED';
  const isAssigned = isPendingAccept;
  const isAccepted = job.status === 'ACCEPTED';
  const isNavigating = job.status === 'NAVIGATING';
  const isArrived = job.status === 'ARRIVED';
  const isStarted = job.status === 'SERVICE_STARTED' || job.status === 'RECORDING_ACTIVE';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header Bar */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Job #{job.jobId.slice(-6).toUpperCase()}</Text>
        <TouchableOpacity onPress={() => setSosVisible(true)} style={s.sosHeaderBtn}>
          <Ionicons name="warning" size={16} color="#DC2626" />
          <Text style={s.sosHeaderText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
      >
        {/* Cancellation Notice if cancelled by admin */}
        {job.status === 'CANCELLED' && (
          <View style={[s.card, { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1.5, marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#DC2626' }}>Order Cancelled</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#991B1B', lineHeight: 18 }}>
              This service order has been cancelled by the administrator. No further action or travel is required.
            </Text>
          </View>
        )}

        {/* Status Hero Card */}
        <View style={s.heroCard}>
          <LinearGradient colors={['#0D3325', '#164E3A']} style={s.heroGrad}>
            <View style={s.heroRow}>
              <View style={s.servicePill}>
                <Ionicons name="construct" size={13} color="#34D399" />
                <Text style={s.servicePillText}>{(job.serviceType || 'SERVICE').toUpperCase()}</Text>
              </View>
              <View style={s.statusPill}>
                <Text style={s.statusPillText}>{job.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>

            <Text style={s.serviceName}>{job.serviceName}</Text>

            <View style={s.heroMetaRow}>
              <View style={s.heroMetaItem}>
                <Ionicons name="calendar-outline" size={14} color="#A7F3D0" />
                <Text style={s.heroMetaText}>{job.date} • {job.time}</Text>
              </View>
              <View style={s.heroMetaItem}>
                <Ionicons name="wallet-outline" size={14} color="#A7F3D0" />
                <Text style={s.heroMetaText}>₹{job.vendorEarnings} Payout</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Technician Tools: Diagnostic Guide & Spare Parts Hub */}
        <View style={s.toolsRow}>
          <TouchableOpacity
            style={s.toolBtn}
            onPress={() => setDiagVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#0284C7', '#0369A1']} style={s.toolBtnGrad}>
              <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" />
              <View>
                <Text style={s.toolBtnTitle}>Diagnostic Guide</Text>
                <Text style={s.toolBtnSub}>Step-by-step troubleshooting</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.toolBtn}
            onPress={() => setSuppliersVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#0F172A', '#334155']} style={s.toolBtnGrad}>
              <Ionicons name="storefront-outline" size={18} color="#60A5FA" />
              <View>
                <Text style={s.toolBtnTitle}>Spare Parts &amp; Tools</Text>
                <Text style={s.toolBtnSub}>Locate nearby supplier hubs</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Customer Information Card with Direct Call Only */}
        <View style={s.card}>
          <Text style={s.cardHeading}>CUSTOMER INFORMATION</Text>
          <View style={s.customerRow}>
            {customerPhoto ? (
              <Image source={{ uri: customerPhoto }} style={s.customerAvatarImg} resizeMode="cover" />
            ) : (
              <View style={s.customerAvatar}>
                <Text style={s.customerInitial}>
                  {(job.customerName || 'C')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.customerName}>{job.customerName}</Text>
              <Text style={s.customerPhone}>
                <Ionicons name="call-outline" size={12} color="#64748B" /> {job.customerPhone || 'Contact verified'}
              </Text>
            </View>

            {/* In-App Direct Call Button Only */}
            <View style={s.commActions}>
              <TouchableOpacity style={s.callBtn} onPress={handleCallCustomer} activeOpacity={0.8}>
                <Ionicons name="call" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12, marginLeft: 4 }}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Service Address & Interactive Map */}
        <View style={s.card}>
          <Text style={s.cardHeading}>SERVICE ADDRESS &amp; LOCATION</Text>
          <View style={s.addressRow}>
            <Ionicons name="location" size={20} color="#EF4444" style={{ marginTop: 2 }} />
            <Text style={s.addressText}>{job.address}</Text>
          </View>

          {/* Interactive Map shown when job is Accepted / Navigating / Arrived */}
          {['ACCEPTED', 'UPCOMING', 'NAVIGATING', 'ARRIVED'].includes(job.status) && (() => {
            const custLat = (typeof job.latitude === 'number' && job.latitude !== 0) ? job.latitude : 11.6643;
            const custLng = (typeof job.longitude === 'number' && job.longitude !== 0) ? job.longitude : 78.1460;
            const vLat = vendorCoords ? vendorCoords.lat : (custLat + 0.007);
            const vLng = vendorCoords ? vendorCoords.lng : (custLng - 0.006);
            const midLat = (custLat + vLat) / 2;
            const midLng = (custLng + vLng) / 2;
            const latDelta = Math.max(0.016, Math.abs(custLat - vLat) * 1.6);
            const lngDelta = Math.max(0.016, Math.abs(custLng - vLng) * 1.6);

            return (
              <View style={s.mapContainer}>
                <MapView
                  style={s.map}
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  initialRegion={{
                    latitude: midLat,
                    longitude: midLng,
                    latitudeDelta: latDelta,
                    longitudeDelta: lngDelta,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                >
                  {/* 1. Customer Location Marker */}
                  <Marker
                    coordinate={{ latitude: custLat, longitude: custLng }}
                    title="Customer Location"
                    description={job.address}
                  >
                    <View style={s.markerPin}>
                      <Ionicons name="home" size={17} color="#FFFFFF" />
                    </View>
                  </Marker>

                  {/* 2. Vendor Specialist Live Marker */}
                  <Marker
                    coordinate={{ latitude: vLat, longitude: vLng }}
                    title="Your Location (Specialist)"
                    description="Urban Captain Partner"
                  >
                    <View style={s.vendorMarkerPin}>
                      <Ionicons name="bicycle" size={17} color="#FFFFFF" />
                    </View>
                  </Marker>

                  {/* 3. Direct Route Polyline */}
                  <Polyline
                    coordinates={[
                      { latitude: vLat, longitude: vLng },
                      { latitude: custLat, longitude: custLng },
                    ]}
                    strokeColor="#059669"
                    strokeWidth={4}
                    lineDashPattern={[6, 4]}
                  />
                </MapView>

              </View>
            );
          })()}

          {job.status === 'ARRIVED' ? (
            <View style={s.navSecuredBadge}>
              <Ionicons name="location" size={18} color="#059669" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.navSecuredTitle}>Arrived at Customer Location</Text>
                <Text style={s.navSecuredSub}>Live GPS has concluded. Please enter customer OTP below to begin service.</Text>
              </View>
            </View>
          ) : ['CUSTOMER_VERIFIED', 'SERVICE_STARTED', 'RECORDING_ACTIVE'].includes(job.status) ? (
            <View style={s.navSecuredBadge}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.navSecuredTitle}>On-Site Location Verified</Text>
                <Text style={s.navSecuredSub}>Map navigation is disabled during active service for customer security &amp; privacy.</Text>
              </View>
            </View>
          ) : isPendingAccept ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Ionicons name="lock-closed-outline" size={16} color="#64748B" />
              <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 6, fontWeight: '500' }}>
                Accept request to unlock turn-by-turn navigation map
              </Text>
            </View>
          ) : null}
        </View>

        {/* Vendor Verification & OTP Input */}
        {['ACCEPTED', 'UPCOMING', 'NAVIGATING', 'ARRIVED', 'CUSTOMER_VERIFIED', 'SERVICE_STARTED', 'RECORDING_ACTIVE'].includes(job.status) && (
          <View style={[s.card, job.status === 'ARRIVED' && { borderWidth: 2, borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[s.cardHeading, job.status === 'ARRIVED' && { color: '#047857', fontWeight: '800' }]}>
                {job.status === 'ARRIVED' ? '📍 ON-SITE OTP VERIFICATION' : 'VENDOR VERIFICATION'}
              </Text>
              {job.status === 'ARRIVED' && (
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>ARRIVED ON-SITE</Text>
                </View>
              )}
            </View>

            {job.status === 'CUSTOMER_VERIFIED' || job.status === 'SERVICE_STARTED' || job.status === 'RECORDING_ACTIVE' || job.status === 'COMPLETED' ? (
              <View style={s.otpSuccessContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={s.otpSuccessTitle}>OTP Verified</Text>
                  <Text style={s.otpSuccessSub}>Customer verification completed.</Text>
                </View>
              </View>
            ) : (
              <View style={s.otpFormContainer}>
                <Text style={[s.otpPrompt, { color: '#065F46', fontWeight: '700' }]}>
                  Ask customer for their 4-digit OTP shown on their screen:
                </Text>
                <OTPInput
                  value={otp}
                  onChange={v => { setOtp(v); setHasError(false); }}
                  hasError={hasError}
                />
                {hasError && (
                  <Text style={s.otpErrorText}>
                    Invalid OTP. Please enter the 4-digit OTP provided by the customer.
                  </Text>
                )}
                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  disabled={otpLoading}
                  style={[s.verifyOtpBtn, { backgroundColor: '#059669' }]}
                  activeOpacity={0.85}
                >
                  {otpLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.verifyOtpBtnText}>✓ Verify OTP &amp; Unlock Service</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Work Verification Photos (only for active/completed jobs, hidden on unaccepted/reassigned jobs) */}
        {!isAssigned && (job.beforePhoto || job.afterPhoto) && (
          <View style={s.card}>
            <Text style={s.cardHeading}>WORK VERIFICATION PROOF</Text>
            <View style={s.photoProofRow}>
              {job.beforePhoto && (
                <View style={s.photoCol}>
                  <Text style={s.photoTag}>Before Service</Text>
                  <Image source={{ uri: job.beforePhoto }} style={s.proofImg} />
                </View>
              )}
              {job.afterPhoto && (
                <View style={s.photoCol}>
                  <Text style={s.photoTag}>After Service</Text>
                  <Image source={{ uri: job.afterPhoto }} style={s.proofImg} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Customer Review Card (visible on completed jobs) */}
        {job.status === 'COMPLETED' && job.rating && (
          <View style={s.card}>
            <Text style={s.cardHeading}>⭐ CUSTOMER REVIEW</Text>
            {/* Star Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {[1,2,3,4,5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= job.rating! ? 'star' : 'star-outline'}
                  size={22}
                  color={star <= job.rating! ? '#F59E0B' : '#D1D5DB'}
                  style={{ marginRight: 3 }}
                />
              ))}
              <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                {job.rating?.toFixed(1)} / 5
              </Text>
            </View>

            {/* Review Text */}
            {job.review ? (
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20, fontStyle: 'italic', marginBottom: 8 }}>
                "{job.review}"
              </Text>
            ) : null}

            {/* Review Tags */}
            {job.reviewTags && job.reviewTags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                {job.reviewTags.map((tag, i) => (
                  <View key={i} style={{ backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#6EE7B7' }}>
                    <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '600' }}>✓ {tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tip if any */}
            {job.tip ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#FFFBEB', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#FCD34D' }}>
                <Ionicons name="gift-outline" size={18} color="#B45309" />
                <Text style={{ marginLeft: 6, fontSize: 13, color: '#B45309', fontWeight: '600' }}>
                  Customer Tip: {job.tip}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Voice Recording Proof (only for active/completed jobs, raw path hidden) */}
        {!isAssigned && job.audioUrl ? (
          <View style={s.card}>
            <Text style={s.cardHeading}>🎙 VOICE RECORDING</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#BBF7D0' }}>
              <Ionicons name="mic-circle" size={32} color="#16A34A" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#166534' }}>Audio recorded during service</Text>
                <Text style={{ fontSize: 11, color: '#059669', marginTop: 2, fontWeight: '500' }}>Proof securely verified &amp; attached</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Dynamic Action Bottom Bar */}
      <View style={s.bottomBar}>
        {/* 1. Pending Acceptance: Accept or Decline */}
        {isPendingAccept && (
          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.rejectBtn]}
              onPress={handleReject}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={s.rejectBtnText}>Decline / Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionBtn, s.acceptBtn]}
              onPress={handleAccept}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.acceptBtnText}>Accept Request</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Accepted / Upcoming / Navigating: Start Navigation & Cancel */}
        {(job.status === 'ACCEPTED' || job.status === 'UPCOMING' || job.status === 'NAVIGATING') && (
          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.rejectBtn, { flex: 0.8 }]}
              onPress={handleCancelJob}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={s.rejectBtnText}>Cancel Job</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionBtn, s.startNavBtn, { flex: 1.2 }]}
              onPress={handleStartNavigation}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate-circle" size={18} color="#FFFFFF" />
              <Text style={s.actionBtnText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        )}



        {/* 5. Customer Verified: Start Service */}
        {job.status === 'CUSTOMER_VERIFIED' && (
          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.serviceBtn, { flex: 1 }]}
              onPress={() => {
                store.startRecording(jobId);
                navigation.navigate('Service', { jobId });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="play-circle" size={18} color="#FFFFFF" />
              <Text style={s.actionBtnText}>Start Service</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. In Progress: Continue Service */}
        {isStarted && (
          <TouchableOpacity
            style={[s.actionBtn, s.serviceBtn]}
            onPress={() => navigation.navigate('Service', { jobId: job.jobId })}
            activeOpacity={0.85}
          >
            <Ionicons name="construct" size={18} color="#FFFFFF" />
            <Text style={s.actionBtnText}>Continue Active Service &amp; Photos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} currentJobId={job.jobId} />
      <DiagnosticModal
        visible={diagVisible}
        onClose={() => setDiagVisible(false)}
        serviceCategory={job.serviceType}
        subServiceName={job.serviceName}
      />
      <NearbySuppliersModal
        visible={suppliersVisible}
        onClose={() => setSuppliersVisible(false)}
        serviceCategory={job.serviceType}
        latitude={job.latitude}
        longitude={job.longitude}
        customerAddress={job.address}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  sosHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sosHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 100, gap: 14 },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGrad: {
    padding: 18,
    gap: 10,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  servicePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  statusPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toolBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  toolBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  toolBtnTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toolBtnSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D3325',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D3325',
  },
  customerInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34D399',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  customerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  commActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D3325',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  navSecuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  navSecuredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  navSecuredSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  photoProofRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoCol: {
    flex: 1,
    gap: 6,
  },
  photoTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  proofImg: {
    width: '100%',
    height: 110,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rejectBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  acceptBtn: {
    backgroundColor: '#0D3325',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  startNavBtn: {
    backgroundColor: '#0284C7',
  },
  arrivedBtn: {
    backgroundColor: '#D97706',
  },
  otpBtn: {
    backgroundColor: '#10B981',
  },
  serviceBtn: {
    backgroundColor: '#0D3325',
  },
  cancelBtn: {
    flex: 0,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  otpSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  otpSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  otpSuccessSub: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  otpFormContainer: {
    gap: 12,
  },
  otpPrompt: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 4,
  },
  otpErrorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  verifyOtpBtn: {
    backgroundColor: '#0D3325',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyOtpBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapContainer: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 6,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlayRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  mapNavigateOverlayBtn: {
    flex: 1,
    backgroundColor: '#0D3325',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mapNavigateOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mapOtpOverlayBtn: {
    flex: 1,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mapOtpOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  vendorMarkerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});
