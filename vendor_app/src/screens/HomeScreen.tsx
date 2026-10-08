import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Dimensions, ImageBackground, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import {
  subscribeToVendorJobs,
  subscribeToVendorProfile,
  FirestoreBooking,
  db,
} from '../services/firestoreService';
import { getDoc, doc } from 'firebase/firestore';
import SOSModal from '../components/SOSModal';
import CalendarModal from '../components/CalendarModal';
import JobCard from '../components/JobCard';
import { useNewOrderSound } from '../hooks/useNewOrderSound';

const { width } = Dimensions.get('window');

const HOME_TABS = [
  { key: 'requests', label: 'Requests', icon: 'flash' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'active', label: 'Active', icon: 'radio' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done' },
];

export default function HomeScreen({ navigation }: any) {
  const [, forceUpdate] = useState(0);
  const [activeTab, setActiveTab] = useState('requests');
  const [refreshing, setRefreshing] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (store.vendorId) {
      try {
        const vSnap = await getDoc(doc(db, 'vendors', store.vendorId));
        if (vSnap.exists()) {
          store.syncVendorProfile(vSnap.data());
        }
      } catch (e) {
        console.warn('[HomeScreen] Refresh error:', e);
      }
    }
    forceUpdate(n => n + 1);
    setTimeout(() => setRefreshing(false), 700);
  };

  // 🔔 Play a chime whenever a new order arrives
  useNewOrderSound();

  useEffect(() => {
    let unsubV: (() => void) | null = null;
    let unsubP: (() => void) | null = null;
    let currentSubscribedId = '';

    const startSubscriptions = (uid: string) => {
      if (!uid || uid === currentSubscribedId) return;
      currentSubscribedId = uid;

      if (unsubV) unsubV();
      if (unsubP) unsubP();

      const altIds = [
        store.vendor.docId,
        store.vendor.mobile,
        store.firebaseUid,
      ].filter(Boolean) as string[];

      unsubV = subscribeToVendorJobs(uid, (jobs) => {
        store.syncAssignedJobs(jobs);
      }, altIds);

      unsubP = subscribeToVendorProfile(uid, (profileData) => {
        store.syncVendorProfile(profileData);
      });
    };

    if (store.vendorId) {
      startSubscriptions(store.vendorId);
    }

    const unsubStore = store.subscribe(() => {
      forceUpdate((n) => n + 1);
      if (store.vendorId && store.vendorId !== currentSubscribedId) {
        startSubscriptions(store.vendorId);
      }
    });

    return () => {
      unsubStore();
      unsubV?.();
      unsubP?.();
    };
  }, []);

  const vendor = store.vendor;
  const isLocked = vendor.isLocked || vendor.status === 'locked';

  const requestedJobs = store.getJobsForTab('requests');
  const upcomingJobs = store.getJobsForTab('upcoming');
  const activeJobs = store.getJobsForTab('active');
  const completedJobs = store.getJobsForTab('completed');

  const displayedJobs = store.getJobsForTab(activeTab);

  const displayName = vendor.name || 'Vendor Captain';
  const displayRating = store.effectiveRating ? store.effectiveRating.toFixed(1) : '5.0';
  const realTotalEarnings = completedJobs.reduce((sum, j) => sum + (j.vendorEarnings || 0), 0);
  const displayEarnings = realTotalEarnings.toLocaleString('en-IN');

  // Cancellation counter state (combines rolling cancellations & skips)
  const cancelCount = Math.max(store.cancelCount, store.vendor.cancelCount || 0, store.vendor.skippedCount || 0);
  const cancelLimit = store.CANCEL_LIMIT;
  const cancelBlocked = cancelCount >= cancelLimit;
  const cancelWarning = cancelCount > 0 && !cancelBlocked;
  const cancelColor = cancelBlocked ? '#DC2626' : cancelCount >= 2 ? '#D97706' : '#10B981';
  const cancelBgColor = cancelBlocked ? '#FEF2F2' : cancelCount >= 2 ? '#FFFBEB' : '#F0FDF4';
  const cancelBorderColor = cancelBlocked ? '#FECACA' : cancelCount >= 2 ? '#FDE68A' : '#BBF7D0';

  return (
    <View style={s.root}>
      {/* Top Scenic Banner & Header */}
      <View style={s.headerContainer}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80' }}
          style={s.headerBgImage}
          imageStyle={{ opacity: 0.35 }}
        >
          <LinearGradient
            colors={['rgba(246,247,249,0.35)', 'rgba(246,247,249,0.88)', '#F6F7F9']}
            style={s.headerGradient}
          />
          <SafeAreaView edges={['top']} style={s.safeHeader}>
            {/* Header Top Bar: Brand, Calendar & Notification Bell */}
            <View style={s.topBarRow}>
              <View style={s.brandPill}>
                <Ionicons name="shield-checkmark" size={13} color="#0D3325" />
                <Text style={s.brandPillText}>URBAN CAPTAIN</Text>
              </View>

              <View style={s.topActions}>
                {/* Calendar Button */}
                <TouchableOpacity
                  style={s.iconButton}
                  onPress={() => setCalendarVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={18} color="#0D3325" />
                </TouchableOpacity>

                {/* Notification Bell */}
                <TouchableOpacity
                  style={s.iconButton}
                  onPress={() => navigation.navigate('Notifications')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="notifications-outline" size={19} color="#0D3325" />
                  {store.unreadCount > 0 && <View style={s.notifBadge} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Greeting Row */}
            <View style={s.profileRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                style={s.avatarWrap}
              >
                <Image
                  source={{
                    uri:
                      vendor.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
                  }}
                  style={s.avatar}
                />
                <View style={s.onlineDot} />
              </TouchableOpacity>

              <View style={s.nameBlock}>
                <Text style={s.greetingText}>Welcome Back,</Text>
                <Text style={s.captainName} numberOfLines={1}>{displayName}</Text>
              </View>

              {/* Rating Badge */}
              <View style={s.ratingBadge}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={s.ratingText}>{displayRating}</Text>
              </View>
            </View>

            {/* Stats Cards (Earnings & Completed) */}
            <View style={s.kpiRow}>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>TOTAL EARNED</Text>
                <Text style={s.kpiValue}>₹{displayEarnings}</Text>
                <Text style={s.kpiSub}>80% Net Payout</Text>
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>COMPLETED JOBS</Text>
                <Text style={s.kpiValue}>{completedJobs.length}</Text>
                <Text style={s.kpiSub}>Verified 5★ Quality</Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* ── Cancellation Counter Card ─────────────────────────────────────── */}
      <View style={[s.cancelCard, { backgroundColor: cancelBgColor, borderColor: cancelBorderColor }]}>
        <View style={s.cancelCardTop}>
          <View style={s.cancelCardLeft}>
            <Ionicons
              name={cancelBlocked ? 'lock-closed' : 'close-circle-outline'}
              size={16}
              color={cancelColor}
            />
            <Text style={[s.cancelCardTitle, { color: cancelColor }]}>
              {cancelBlocked
                ? 'Account Blocked — Cannot Go Online'
                : cancelCount === 0
                ? 'Job Cancellation Limit'
                : `Warning: ${cancelCount} Cancellation${cancelCount > 1 ? 's' : ''} This Week`}
            </Text>
          </View>
          <Text style={[s.cancelCardCount, { color: cancelColor }]}>
            {cancelCount}/{cancelLimit}
          </Text>
        </View>

        {/* 3-segment progress bar */}
        <View style={s.cancelSegments}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                s.cancelSegment,
                i < cancelCount && { backgroundColor: cancelColor },
                i < cancelCount && { opacity: 1 },
              ]}
            />
          ))}
        </View>

        <Text style={[s.cancelCardSub, { color: cancelColor }]}>
          {cancelBlocked
            ? 'You have been temporarily blocked. Contact Admin or wait 7 days to reset.'
            : cancelCount === 0
            ? '3 cancellations in 7 days will temporarily block your account'
            : `${cancelLimit - cancelCount} more cancellation${cancelLimit - cancelCount > 1 ? 's' : ''} will block your account for 7 days`}
        </Text>
      </View>

      {/* Auto-Lock Alert Banner if Locked */}
      {isLocked && (
        <View style={s.lockedBanner}>
          <Ionicons name="lock-closed" size={20} color="#DC2626" />
          <View style={{ flex: 1 }}>
            <Text style={s.lockedTitle}>Account Temporarily Locked</Text>
            <Text style={s.lockedDesc}>
              {vendor.lockReason || 'Locked due to 3 skipped service requests or customer complaint review. Contact Admin to unlock.'}
            </Text>
          </View>
        </View>
      )}

      {/* 4 Workflow Tabs: Requests, Upcoming, Active, Completed */}
      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
          {HOME_TABS.map((t) => {
            const count = store.getJobsForTab(t.key).length;
            const isActive = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setActiveTab(t.key)}
                style={[s.tabPill, isActive && s.tabPillActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={t.icon as any}
                  size={14}
                  color={isActive ? '#FFFFFF' : '#475569'}
                />
                <Text style={[s.tabPillText, isActive && s.tabPillTextActive]}>
                  {t.label}
                  {count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Jobs List for active tab */}
      <ScrollView
        style={s.contentScroll}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />}
      >
        {displayedJobs.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name="briefcase-outline" size={54} color="#CBD5E1" />
            <Text style={s.emptyTitle}>No {activeTab} jobs right now</Text>
            <Text style={s.emptySub}>
              {activeTab === 'requests'
                ? 'Incoming customer bookings will appear here instantly.'
                : `You do not have any ${activeTab} bookings.`}
            </Text>
          </View>
        ) : (
          displayedJobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onPress={(j) => {
                store.setCurrentJob(j.jobId);
                navigation.navigate('JobDetails', { jobId: j.jobId });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Floating One-Tap SOS Button */}
      <TouchableOpacity
        style={s.floatingSOS}
        onPress={() => setSosVisible(true)}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#EF4444', '#B91C1C']} style={s.floatingSOSGrad}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <Text style={s.floatingSOSText}>SOS</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Emergency SOS Modal */}
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />

      {/* Schedule Calendar Modal */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onSelectJob={(j) => {
          store.setCurrentJob(j.jobId);
          navigation.navigate('JobDetails', { jobId: j.jobId });
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  headerContainer: {
    backgroundColor: '#0D3325',
  },
  headerBgImage: {
    width: '100%',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 51, 37, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(13, 51, 37, 0.2)',
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0D3325',
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameBlock: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  captainName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10.5,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 1,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  lockedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  lockedDesc: {
    fontSize: 11.5,
    color: '#991B1B',
    lineHeight: 16,
    marginTop: 2,
  },
  // Cancellation counter card
  cancelCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  cancelCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cancelCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  cancelCardCount: {
    fontSize: 15,
    fontWeight: '900',
  },
  cancelSegments: {
    flexDirection: 'row',
    gap: 6,
  },
  cancelSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  cancelCardSub: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  tabsWrap: {
    backgroundColor: '#F6F7F9',
    paddingVertical: 10,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#0D3325',
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
  },
  floatingSOS: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingSOSGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
  },
  floatingSOSText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
