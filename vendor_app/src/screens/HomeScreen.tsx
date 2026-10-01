import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Dimensions, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import {
  subscribeToVendorJobs,
  subscribeToVendorProfile,
  FirestoreBooking,
} from '../services/firestoreService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let unsubV: (() => void) | null = null;
    let unsubP: (() => void) | null = null;

    const startSubscriptions = (uid: string) => {
      if (unsubV) unsubV();
      if (unsubP) unsubP();

      unsubV = subscribeToVendorJobs(uid, (jobs) => {
        store.syncAssignedJobs(jobs);
      });

      unsubP = subscribeToVendorProfile(uid, (profileData) => {
        store.syncVendorProfile(profileData);
      });
    };

    if (store.vendorId) {
      startSubscriptions(store.vendorId);
    }

    const unsubStore = store.subscribe(() => {
      forceUpdate((n) => n + 1);
      if (!unsubV && store.vendorId) {
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
  const assignedJobs = store.jobs.filter(
    (j) => j.status === 'ADMIN_ASSIGNED' || j.status === 'ACCEPTED' || j.status === 'NAVIGATING' || j.status === 'ARRIVED' || j.status === 'SERVICE_STARTED'
  );
  const completedJobs = store.jobs.filter((j) => j.status === 'COMPLETED');
  const todayJobsCount = completedJobs.filter((j) => j.date === 'Today').length;
  const realTotalEarnings = completedJobs.reduce((sum, j) => sum + (j.vendorEarnings || 0), 0);

  const displayName = vendor.name || 'Viswesh';
  const displayRating = store.effectiveRating ? store.effectiveRating.toFixed(1) : '5.0';
  const displayEarnings = realTotalEarnings.toLocaleString('en-IN');

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
            {/* Header Top Bar: Brand & Notification Bell */}
            <View style={s.topBarRow}>
              <View style={s.brandPill}>
                <Ionicons name="shield-checkmark" size={13} color="#0D3325" />
                <Text style={s.brandPillText}>URBAN CAPTAIN</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={s.notifBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={20} color="#111827" />
                {store.unreadCount > 0 && <View style={s.notifRedDot} />}
              </TouchableOpacity>
            </View>

            {/* Profile Info Area */}
            <View style={s.profileRow}>
              {/* Avatar + Verified Badge */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={s.avatarWrapper}
                activeOpacity={0.85}
              >
                <Image
                  source={{
                    uri: vendor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
                  }}
                  style={s.avatarImg}
                />
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Name & Details Column */}
              <View style={s.profileDetailsCol}>
                <Text style={s.greetingSub}>Good Day,</Text>
                <View style={s.nameBadgeRow}>
                  <Text style={s.vendorNameText} numberOfLines={1}>{displayName}</Text>
                  <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                </View>

                {/* Vendor Captain Tag */}
                <View style={s.captainTag}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={s.captainTagText}>Vendor Captain</Text>
                  <Text style={s.captainRatingText}>★ {displayRating}</Text>
                </View>

                {/* Motivational Quote */}
                <Text style={s.mottoText} numberOfLines={2}>
                  "The best way to find yourself is to lose yourself in the service of others."
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Stats 3-card Row ────────────────────────────────────── */}
        <View style={s.statsRow}>
          {/* Card 1: Today's Jobs */}
          <View style={s.statCard}>
            <View style={[s.statIconCircle, { backgroundColor: '#E8F8F0' }]}>
              <Ionicons name="calendar-outline" size={16} color="#10B981" />
            </View>
            <Text style={s.statHeaderLabel}>TODAY'S JOBS</Text>
            <Text style={s.statBigNumber}>{todayJobsCount}</Text>
            <Text style={s.statFooterMuted}>{todayJobsCount > 0 ? `${todayJobsCount} Done` : 'No jobs yet'}</Text>
          </View>

          {/* Card 2: Earnings */}
          <View style={s.statCard}>
            <View style={[s.statIconCircle, { backgroundColor: '#E8F8F0' }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>₹</Text>
            </View>
            <Text style={s.statHeaderLabel}>EARNINGS</Text>
            <Text style={s.statBigNumber}>₹{displayEarnings}</Text>
            <Text style={s.statFooterMuted}>Total Payouts</Text>
          </View>

          {/* Card 3: Rating */}
          <View style={s.statCard}>
            <View style={[s.statIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="star" size={15} color="#8B5CF6" />
            </View>
            <Text style={s.statHeaderLabel}>RATING</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.statBigNumber}>{displayRating}</Text>
              <Ionicons name="star" size={13} color="#F59E0B" />
            </View>
            <Text style={s.statFooterMuted}>Verified Score</Text>
          </View>
        </View>

        {/* ── Assigned to You Section ───────────────────────────── */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Assigned to You</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.viewAllText}>View All ({assignedJobs.length})</Text>
              <Ionicons name="arrow-forward" size={13} color="#0D3325" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Real Job Cards or Clean Empty State */}
        {assignedJobs.length === 0 ? (
          <View style={s.emptyAssignedCard}>
            <View style={s.emptyIconCircle}>
              <Ionicons name="briefcase-outline" size={26} color="#0D3325" />
            </View>
            <Text style={s.emptyAssignedTitle}>No Active Jobs Assigned</Text>
            <Text style={s.emptyAssignedSub}>
              {vendor.isOnline
                ? "You're online! As soon as an order is assigned to you, it will appear here in real time."
                : 'Turn on your Online switch above to start receiving customer service requests.'}
            </Text>
          </View>
        ) : (
          assignedJobs.map((job) => (
            <TouchableOpacity
              key={job.jobId}
              style={s.jobCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('JobDetails', { jobId: job.jobId })}
            >
              <View style={s.jobCardTop}>
                <View style={s.jobThumbnailWrap}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80' }}
                    style={s.jobThumbnailImg}
                  />
                </View>

                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <View style={s.captainBadgePill}>
                    <Text style={s.captainBadgePillText}>URBAN CAPTAIN</Text>
                  </View>
                  <Text style={s.jobTitleText}>{job.serviceName}</Text>
                  <View style={s.jobMetaRow}>
                    <Ionicons name="person-outline" size={13} color="#6B7280" />
                    <Text style={s.jobCustomerName}>Customer: {job.customerName}</Text>
                  </View>
                  <View style={s.jobMetaRow}>
                    <Ionicons name="location-outline" size={13} color="#6B7280" />
                    <Text style={s.jobDistanceText}>{job.address || 'Nearby Location'}</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>

              <View style={s.jobDivider} />

              <View style={s.jobCardBottom}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={s.jobDateText}>{job.date} • {job.time}</Text>
                </View>
                <Text style={s.jobPriceText}>₹{job.vendorEarnings}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F7F9' },

  headerContainer: {
    backgroundColor: '#F6F7F9',
    overflow: 'hidden',
  },
  headerBgImage: {
    width: '100%',
    paddingBottom: 16,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeHeader: {
    paddingHorizontal: 16,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(13,51,37,0.15)',
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D3325',
    letterSpacing: 0.5,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notifRedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 14,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileDetailsCol: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vendorNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  captainTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  captainTagText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0D3325',
  },
  captainRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  mottoText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 15,
    fontStyle: 'italic',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },

  onlineCard: {
    backgroundColor: '#0D3325',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  onlineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statHeaderLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statBigNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  statFooterMuted: {
    fontSize: 10.5,
    color: '#9CA3AF',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D3325',
  },

  emptyAssignedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyAssignedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptyAssignedSub: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  jobCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobThumbnailWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  jobThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  captainBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  captainBadgePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  jobCustomerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  jobDistanceText: {
    fontSize: 11.5,
    color: '#6B7280',
  },
  jobDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  jobCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  jobPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D3325',
  },
});
