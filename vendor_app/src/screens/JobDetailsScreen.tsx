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
import SOSModal from '../components/SOSModal';
import DiagnosticModal from '../components/DiagnosticModal';
import NearbySuppliersModal from '../components/NearbySuppliersModal';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [, forceUpdate] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [diagVisible, setDiagVisible] = useState(false);
  const [suppliersVisible, setSuppliersVisible] = useState(false);

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

  // ── WhatsApp Message Handler ─────────────────────────────────────────────
  const handleChatCustomer = () => {
    const phone = (job.customerPhone || '9876543210').replace(/\D/g, '');
    const msg = encodeURIComponent(`Hello ${job.customerName || 'Customer'}, I am your Urban Captain technician for your ${job.serviceName || 'service'} booking.`);
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${msg}`);
  };

  // ── Turn-by-Turn Voice Navigation ─────────────────────────────────────────
  const handleOpenNavigation = () => {
    if (job.latitude && job.longitude) {
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

  // ── Reject / Skip Action with 3-Skip Auto-Lock Warning ────────────────────
  const handleReject = () => {
    const currentSkips = store.vendor.skippedCount || 0;
    const warningMsg = currentSkips >= 2
      ? `⚠️ WARNING: You have already skipped ${currentSkips} requests. Skipping this 3rd request will AUTOMATICALLY LOCK your partner profile.`
      : `Are you sure you want to decline this booking? (Current skips: ${currentSkips}/3)`;

    Alert.alert(
      'Skip Service Request',
      warningMsg,
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Decline & Skip',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              store.updateJobStatus(job.jobId, 'REJECTED');
              const res = await rejectJob(job.jobId, store.vendorId || undefined);
              if (res.locked) {
                Alert.alert('🔒 Account Locked', 'Your profile has been locked due to 3 consecutive skipped service requests. Please contact Admin to unlock.');
              } else {
                Alert.alert('Job Declined', `Request removed. (${res.skippedCount}/3 skips recorded)`);
              }
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // ── Start Navigation ─────────────────────────────────────────────────────
  const handleStartNavigating = async () => {
    setSubmitting(true);
    try {
      store.updateJobStatus(job.jobId, 'NAVIGATING');
      await updateBookingStatus(job.jobId, 'en_route');
      navigation.navigate('Map', { jobId: job.jobId });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mark Arrived ─────────────────────────────────────────────────────────
  const handleMarkArrived = async () => {
    setSubmitting(true);
    try {
      store.updateJobStatus(job.jobId, 'ARRIVED', { arrivedAt: Date.now() });
      await updateBookingStatus(job.jobId, 'arrived');
      if (job.customerId && job.otp) {
        await notifyCustomerOTP(job.customerId, job.otp);
      }
      navigation.navigate('OTP', { jobId: job.jobId });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isAssigned = job.status === 'ADMIN_ASSIGNED';
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

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
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

        {/* Customer Information Card with Call & WhatsApp */}
        <View style={s.card}>
          <Text style={s.cardHeading}>CUSTOMER INFORMATION</Text>
          <View style={s.customerRow}>
            <View style={s.customerAvatar}>
              <Text style={s.customerInitial}>
                {(job.customerName || 'C')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.customerName}>{job.customerName}</Text>
              <Text style={s.customerPhone}>
                <Ionicons name="call-outline" size={12} color="#64748B" /> {job.customerPhone || 'Contact verified'}
              </Text>
            </View>

            {/* In-App Direct Call & WhatsApp Buttons */}
            <View style={s.commActions}>
              <TouchableOpacity style={s.callBtn} onPress={handleCallCustomer} activeOpacity={0.8}>
                <Ionicons name="call" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={s.chatBtn} onPress={handleChatCustomer} activeOpacity={0.8}>
                <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Service Address & Voice Navigation */}
        <View style={s.card}>
          <Text style={s.cardHeading}>SERVICE ADDRESS &amp; LOCATION</Text>
          <View style={s.addressRow}>
            <Ionicons name="location" size={20} color="#EF4444" style={{ marginTop: 2 }} />
            <Text style={s.addressText}>{job.address}</Text>
          </View>

          <TouchableOpacity style={s.navBtn} onPress={handleOpenNavigation} activeOpacity={0.85}>
            <Ionicons name="navigate-circle" size={20} color="#0D3325" />
            <Text style={s.navBtnText}>Open Turn-by-Turn Voice Navigation</Text>
          </TouchableOpacity>
        </View>

        {/* Work Verification Photos (if completed or taken) */}
        {(job.beforePhoto || job.afterPhoto) && (
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
      </ScrollView>

      {/* Dynamic Action Bottom Bar */}
      <View style={s.bottomBar}>
        {isAssigned && (
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
              <Text style={s.acceptBtnText}>Accept Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <TouchableOpacity
            style={[s.actionBtn, s.startNavBtn]}
            onPress={handleStartNavigating}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text style={s.actionBtnText}>Start Navigation</Text>
          </TouchableOpacity>
        )}

        {isNavigating && (
          <TouchableOpacity
            style={[s.actionBtn, s.arrivedBtn]}
            onPress={handleMarkArrived}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Ionicons name="pin" size={18} color="#FFFFFF" />
            <Text style={s.actionBtnText}>Mark Arrived &amp; Verify OTP</Text>
          </TouchableOpacity>
        )}

        {isArrived && (
          <TouchableOpacity
            style={[s.actionBtn, s.otpBtn]}
            onPress={() => navigation.navigate('OTP', { jobId: job.jobId })}
            activeOpacity={0.85}
          >
            <Ionicons name="key-outline" size={18} color="#FFFFFF" />
            <Text style={s.actionBtnText}>Enter Customer Start OTP</Text>
          </TouchableOpacity>
        )}

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
});
