import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function CompleteScreen({ route, navigation }: any) {
  const { jobId } = route.params || {};
  const [job, setJob] = useState<any>(store.getJob(jobId) || null);

  const [beforePhoto, setBeforePhoto] = useState<string | null>(
    job?.beforePhoto && !job.beforePhoto.startsWith('subcollection:') ? job.beforePhoto : null
  );
  const [afterPhoto, setAfterPhoto] = useState<string | null>(
    job?.afterPhoto && !job.afterPhoto.startsWith('subcollection:') ? job.afterPhoto : null
  );
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Fetch latest booking data and evidence photos if not already available in store
  useEffect(() => {
    if (!job && jobId) {
      getDoc(doc(db, 'bookings', jobId)).then((snap) => {
        if (snap.exists()) {
          const d = { jobId: snap.id, ...snap.data() } as any;
          setJob(d);
          if (d.beforePhoto && !d.beforePhoto.startsWith('subcollection:')) setBeforePhoto(d.beforePhoto);
          if (d.afterPhoto && !d.afterPhoto.startsWith('subcollection:')) setAfterPhoto(d.afterPhoto);
        }
      }).catch(() => {});
    }

    if (jobId) {
      if (!beforePhoto) {
        getDoc(doc(db, 'bookings', jobId, 'evidence', 'beforePhoto'))
          .then((s) => {
            if (s.exists() && s.data().beforePhoto) setBeforePhoto(s.data().beforePhoto);
          })
          .catch(() => {});
      }
      if (!afterPhoto) {
        getDoc(doc(db, 'bookings', jobId, 'evidence', 'afterPhoto'))
          .then((s) => {
            if (s.exists() && s.data().afterPhoto) setAfterPhoto(s.data().afterPhoto);
          })
          .catch(() => {});
      }
      if (!beforePhoto || !afterPhoto) {
        getDoc(doc(db, 'bookings', jobId, 'evidence', 'photos'))
          .then((snap) => {
            if (snap.exists()) {
              const data = snap.data();
              if (data.beforePhoto && !beforePhoto) setBeforePhoto(data.beforePhoto);
              if (data.afterPhoto && !afterPhoto) setAfterPhoto(data.afterPhoto);
            }
          })
          .catch((err) => console.warn('[CompleteScreen] Photo load error:', err));
      }
    }
  }, [jobId, job]);

  // Duration computation
  const secs = store.recordingSeconds;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const durationStr = h > 0 ? `${h}h ${m}m` : `${m || 1}m`;

  const customerName = job?.customerName || 'Urban Helpers';
  const serviceName = job?.serviceName || job?.subServiceName || job?.category || 'Filter Change';
  const earnings = job?.vendorEarnings || Math.round((job?.price || 399) * 0.8) || 319;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.root}>
      {/* Ambient background decoration */}
      <View style={s.ambientBg}>
        <LinearGradient
          colors={['#ECFDF5', '#F0FDF4', '#FFFFFF']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={s.ambientCircleTop} />
        <View style={s.ambientCircleRight} />
      </View>

      {/* Top Header Row with Back Button */}
      <View style={s.topNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={s.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Celebration Header with Mascot ────────────────────────────── */}
        <View style={s.heroContainer}>
          <View style={s.heroTextSide}>
            {/* Celebration Green Checkmark Badge with Confetti */}
            <View style={s.checkBadgeWrap}>
              <LinearGradient colors={['#10B981', '#059669']} style={s.checkCircle}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </LinearGradient>
              {/* Festive confetti dots */}
              <View style={[s.confettiStick, { top: -6, left: 18, transform: [{ rotate: '20deg' }] }]} />
              <View style={[s.confettiStick, { top: 0, right: -4, backgroundColor: '#38BDF8', transform: [{ rotate: '-35deg' }] }]} />
              <View style={[s.confettiDot, { bottom: -3, left: 0, backgroundColor: '#F59E0B' }]} />
              <View style={[s.confettiDot, { bottom: 8, right: -6, backgroundColor: '#EC4899' }]} />
              <View style={[s.confettiDot, { top: -4, left: -4, backgroundColor: '#F59E0B' }]} />
            </View>

            <Text style={s.heroTitleLine1}>Service</Text>
            <Text style={s.heroTitleLine2}>Completed!</Text>

            {/* Cute smile curve accent */}
            <View style={s.smileAccent} />

            <Text style={s.heroSub}>
              Great job! Your earnings and verified job proof have been recorded.
            </Text>
          </View>

          {/* Urban Captain 3D Mascot giving Thumbs Up */}
          <View style={s.mascotSide}>
            <View style={s.thumbsUpRays}>
              <View style={[s.rayLine, { transform: [{ rotate: '-35deg' }] }]} />
              <View style={[s.rayLine, { transform: [{ rotate: '-10deg' }] }]} />
              <View style={[s.rayLine, { transform: [{ rotate: '15deg' }] }]} />
            </View>
            <Image
              source={require('../../assets/vendor_auth/partner_mascot.png')}
              style={s.mascotImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── Job Overview Card ─────────────────────────────────────────────── */}
        <View style={s.infoCard}>
          {/* Customer Row */}
          <View style={s.infoRow}>
            <View style={s.infoIconPill}>
              <Ionicons name="person" size={17} color="#10B981" />
            </View>
            <Text style={s.infoLabel}>Customer</Text>
            <Text style={s.infoValue} numberOfLines={1}>{customerName}</Text>
          </View>

          <View style={s.divider} />

          {/* Service Row */}
          <View style={s.infoRow}>
            <View style={s.infoIconPill}>
              <Ionicons name="construct" size={17} color="#10B981" />
            </View>
            <Text style={s.infoLabel}>Service</Text>
            <Text style={s.infoValue} numberOfLines={1}>{serviceName}</Text>
          </View>

          <View style={s.divider} />

          {/* Duration Row */}
          <View style={s.infoRow}>
            <View style={s.infoIconPill}>
              <Ionicons name="time-outline" size={18} color="#10B981" />
            </View>
            <Text style={s.infoLabel}>Duration</Text>
            <Text style={s.infoValue}>{durationStr}</Text>
          </View>
        </View>

        {/* ── Work Verification Photos Card ─────────────────────────────────── */}
        <View style={s.photoCard}>
          <View style={s.photoCardHeader}>
            <View style={s.photoHeaderLeft}>
              <View style={s.cameraIconBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
              <Text style={s.photoCardTitle}>Work Verification Photos</Text>
            </View>
            <TouchableOpacity
              style={s.viewAllBtn}
              onPress={() => {
                if (beforePhoto) setSelectedPreviewPhoto({ url: beforePhoto, title: 'Before Service Proof' });
                else if (afterPhoto) setSelectedPreviewPhoto({ url: afterPhoto, title: 'After Service Proof' });
              }}
              activeOpacity={0.8}
            >
              <Text style={s.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={12} color="#059669" />
            </TouchableOpacity>
          </View>

          <View style={s.thumbnailsRow}>
            {/* Before Photo */}
            <TouchableOpacity
              style={s.thumbCard}
              activeOpacity={0.85}
              onPress={() => beforePhoto && setSelectedPreviewPhoto({ url: beforePhoto, title: 'Before Service Proof' })}
            >
              {beforePhoto ? (
                <Image source={{ uri: beforePhoto }} style={s.thumbImage} resizeMode="cover" />
              ) : (
                <View style={[s.thumbImage, s.thumbPlaceholder]}>
                  <Ionicons name="image-outline" size={24} color="#94A3B8" />
                  <Text style={s.thumbPlaceholderText}>Captured</Text>
                </View>
              )}
              <View style={s.thumbBadge}>
                <Text style={s.thumbBadgeText}>Before</Text>
              </View>
            </TouchableOpacity>

            {/* After Photo */}
            <TouchableOpacity
              style={s.thumbCard}
              activeOpacity={0.85}
              onPress={() => afterPhoto && setSelectedPreviewPhoto({ url: afterPhoto, title: 'After Service Proof' })}
            >
              {afterPhoto ? (
                <Image source={{ uri: afterPhoto }} style={s.thumbImage} resizeMode="cover" />
              ) : (
                <View style={[s.thumbImage, s.thumbPlaceholder]}>
                  <Ionicons name="checkmark-done" size={24} color="#10B981" />
                  <Text style={s.thumbPlaceholderText}>Completed</Text>
                </View>
              )}
              <View style={[s.thumbBadge, { backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
                <Text style={s.thumbBadgeText}>After</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Your Net Earnings Card ────────────────────────────────────────── */}
        <View style={s.earningsCardWrap}>
          <LinearGradient
            colors={['#D1FAE5', '#ECFDF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.earningsCard}
          >
            {/* Left: 3D Money Bag with Coins */}
            <View style={s.moneyBagWrap}>
              <View style={s.moneyBagBody}>
                <Ionicons name="cash" size={22} color="#FFFFFF" />
              </View>
              <View style={s.moneyCoin1}>
                <Text style={s.coinSymbol}>₹</Text>
              </View>
              <View style={s.moneyCoin2}>
                <Text style={s.coinSymbol}>₹</Text>
              </View>
            </View>

            {/* Center: Net Earnings Amount */}
            <View style={s.earningsCenter}>
              <Text style={s.earningsLabel}>Your Net Earnings</Text>
              <Text style={s.earningsAmount}>₹{earnings}</Text>
            </View>

            {/* Right: 80% Share Badge with celebration burst */}
            <View style={s.shareBadgeWrap}>
              <View style={s.sparkleRays}>
                <View style={[s.sparkleStick, { top: -4, right: 6 }]} />
                <View style={[s.sparkleStick, { top: 4, right: -4, transform: [{ rotate: '45deg' }] }]} />
              </View>
              <View style={s.shareBadgeCircle}>
                <Text style={s.sharePercent}>80%</Text>
                <Text style={s.shareSub}>Share</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <View style={s.actionBtnsContainer}>
          {/* View Earnings & History Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Earnings' })}
            style={s.viewEarningsBtn}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.viewEarningsGrad}
            >
              <Ionicons name="bar-chart" size={19} color="#FFFFFF" />
              <Text style={s.viewEarningsBtnText}>View Earnings &amp; History</Text>
              <Ionicons name="chevron-forward" size={17} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Dashboard Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            style={s.backDashboardBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="home" size={19} color="#064E3B" />
            <Text style={s.backDashboardBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer Encouragement & Skyline ────────────────────────────────── */}
        <View style={s.footerContainer}>
          <Text style={s.footerMotto}>Keep up the great work!</Text>
          <View style={s.heartRow}>
            <Ionicons name="heart-outline" size={15} color="#059669" />
          </View>
          <View style={s.skylineRow}>
            <Ionicons name="home" size={18} color="rgba(16, 185, 129, 0.25)" />
            <Ionicons name="business" size={22} color="rgba(16, 185, 129, 0.22)" style={{ marginHorizontal: 4 }} />
            <Ionicons name="home" size={16} color="rgba(16, 185, 129, 0.25)" />
          </View>
        </View>
      </ScrollView>

      {/* ── Fullscreen Proof Photo Preview Modal ────────────────────────────── */}
      <Modal
        visible={!!selectedPreviewPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPreviewPhoto(null)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{selectedPreviewPhoto?.title || 'Proof Photo'}</Text>
              <TouchableOpacity onPress={() => setSelectedPreviewPhoto(null)} style={s.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {selectedPreviewPhoto?.url ? (
              <Image
                source={{ uri: selectedPreviewPhoto.url }}
                style={s.modalImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  ambientBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientCircleTop: {
    position: 'absolute',
    top: -90,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(209, 250, 229, 0.5)',
  },
  ambientCircleRight: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(236, 253, 245, 0.6)',
  },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  // ── Hero Section ────────────────────────────────────────────────────────────
  heroContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 16,
  },
  heroTextSide: {
    flex: 1,
    paddingRight: 8,
  },
  checkBadgeWrap: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confettiDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  confettiStick: {
    position: 'absolute',
    width: 8,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#10B981',
  },
  heroTitleLine1: {
    fontSize: 27,
    fontWeight: '900',
    color: '#064E3B',
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  heroTitleLine2: {
    fontSize: 27,
    fontWeight: '900',
    color: '#059669',
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  smileAccent: {
    width: 44,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 2,
  },
  mascotSide: {
    width: 140,
    height: 175,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  thumbsUpRays: {
    position: 'absolute',
    top: 36,
    left: 12,
    width: 24,
    height: 24,
  },
  rayLine: {
    position: 'absolute',
    width: 7,
    height: 2,
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
  mascotImg: {
    width: '100%',
    height: '100%',
  },

  // ── Info Card (Customer, Service, Duration) ─────────────────────────────────
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoIconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // ── Work Verification Photos Card ───────────────────────────────────────────
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  photoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbCard: {
    flex: 1,
    height: 94,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  thumbPlaceholderText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  thumbBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  thumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // ── Net Earnings Card ───────────────────────────────────────────────────────
  earningsCardWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  moneyBagWrap: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 12,
  },
  moneyBagBody: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  moneyCoin1: {
    position: 'absolute',
    bottom: -2,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  moneyCoin2: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  coinSymbol: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  earningsCenter: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.2,
  },
  earningsAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  shareBadgeWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleRays: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
  },
  sparkleStick: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
  shareBadgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sharePercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
    lineHeight: 16,
  },
  shareSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#065F46',
  },

  // ── Action Buttons ──────────────────────────────────────────────────────────
  actionBtnsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  viewEarningsBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  viewEarningsGrad: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  viewEarningsBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginLeft: 6,
  },
  backDashboardBtn: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#064E3B',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  backDashboardBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footerContainer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 10,
  },
  footerMotto: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.3,
  },
  heartRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  skylineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // ── Fullscreen Modal Preview ────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 360,
    backgroundColor: '#000000',
  },
});
