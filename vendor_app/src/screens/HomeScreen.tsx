import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  StyleSheet, Image, Alert, ActivityIndicator, Dimensions, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import {
  subscribeToVendorJobs,
  subscribeToNewRequests,
  acceptJob,
  setVendorOnlineStatus,
  FirestoreBooking,
} from '../services/firestoreService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [, forceUpdate] = useState(0);
  const [newRequests, setNewRequests] = useState<FirestoreBooking[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    let unsubV: (() => void) | null = null;
    let unsubN: (() => void) | null = null;

    const startSubscriptions = (uid: string) => {
      if (unsubV) unsubV();
      if (unsubN) unsubN();

      unsubV = subscribeToVendorJobs(uid, (jobs) => {
        store.syncAssignedJobs(jobs);
      });

      unsubN = subscribeToNewRequests((requests) => {
        setNewRequests(requests);
        if (store.vendor.isOnline) {
          store.syncNewRequests(requests);
        }
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
      unsubN?.();
    };
  }, []);

  const vendor = store.vendor;
  const assignedJobs = store.jobs.filter(
    (j) => j.status === 'ADMIN_ASSIGNED' || j.status === 'ACCEPTED' || j.status === 'NAVIGATING' || j.status === 'ARRIVED' || j.status === 'SERVICE_STARTED'
  );
  const todayJobsCount = store.jobs.filter(
    (j) => j.status === 'COMPLETED' && j.date === 'Today'
  ).length;

  // ── Online toggle ────────────────────────────────────────────────────────
  const handleToggleOnline = async (v: boolean) => {
    store.toggleOnline(v);
    if (!v) {
      setNewRequests([]);
      store.syncNewRequests([]);
    }
    if (store.vendorId) {
      await setVendorOnlineStatus(store.vendorId, v).catch(() => {});
    }
  };

  const displayName = vendor.name || 'Viswesh';
  const displayRating = vendor.rating ? vendor.rating.toFixed(1) : '4.8';
  const displayEarnings = store.totalEarnings > 0 ? store.totalEarnings.toLocaleString('en-IN') : '1,247';

  return (
    <View style={s.root}>
      {/* Top Scenic Banner & Header */}
      <View style={s.headerContainer}>
        {/* Scenic Mountain Background Banner */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80' }}
          style={s.headerBgImage}
          imageStyle={{ opacity: 0.38 }}
        >
          <LinearGradient
            colors={['rgba(246,247,249,0.3)', 'rgba(246,247,249,0.85)', '#F6F7F9']}
            style={s.headerGradient}
          />
          <SafeAreaView edges={['top']} style={s.safeHeader}>
            {/* Header Top Bar: Notification Bell */}
            <View style={s.topBarRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={s.notifBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={22} color="#111827" />
                <View style={s.notifRedDot} />
              </TouchableOpacity>
            </View>

            {/* Profile Info Area */}
            <View style={s.profileRow}>
              {/* Left Column: Avatar + Greeting + Badge + Quote */}
              <View style={s.profileLeft}>
                <View style={s.avatarWrapper}>
                  <Image
                    source={{
                      uri: vendor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
                    }}
                    style={s.avatarImg}
                  />
                  {/* Blue Verified Checkmark Badge */}
                  <View style={s.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                </View>

                <View style={{ marginTop: 6 }}>
                  <Text style={s.greetingSub}>Good Morning,</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.vendorNameText}>{displayName}</Text>
                    <View style={s.nameVerifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
                    </View>
                  </View>

                  {/* Vendor Captain Tag */}
                  <View style={s.captainTag}>
                    <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                    <Text style={s.captainTagText}>Vendor Captain</Text>
                  </View>

                  {/* Motivational Quote */}
                  <Text style={s.mottoText}>Small steps every day{'\n'}create big results.</Text>
                </View>
              </View>

              {/* Right Column: Polo Shirt / Vendor Captain Badge Illustration */}
              <View style={s.profileRightIllustration}>
                <View style={s.captainShirtPill}>
                  <Ionicons name="person" size={44} color="#0D3325" style={{ opacity: 0.85 }} />
                  <View style={s.shirtBadgeTag}>
                    <Text style={s.shirtBadgeTagText}>VENDOR</Text>
                    <Text style={s.shirtBadgeTagText}>CAPTAIN</Text>
                  </View>
                </View>
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
        {/* ── Ready to receive jobs card ─────────────────────────── */}
        <View style={s.onlineCard}>
          <View style={s.onlineIconWrap}>
            <Ionicons name="briefcase" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={s.onlineTitle}>You're ready to receive</Text>
            <Text style={s.onlineTitle}>new jobs.</Text>
            <Text style={s.onlineSub}>Stay online and keep going!</Text>
          </View>
          <Switch
            value={vendor.isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#10B981' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor="rgba(255,255,255,0.2)"
          />
        </View>

        {/* ── Stats 3-card Row ────────────────────────────────────── */}
        <View style={s.statsRow}>
          {/* Card 1: Today's Jobs */}
          <View style={s.statCard}>
            <View style={[s.statIconCircle, { backgroundColor: '#E8F8F0' }]}>
              <Ionicons name="calendar-outline" size={16} color="#10B981" />
            </View>
            <Text style={s.statHeaderLabel}>TODAY'S JOBS</Text>
            <Text style={s.statBigNumber}>{todayJobsCount}</Text>
            <Text style={s.statFooterMuted}>No jobs yet</Text>
          </View>

          {/* Card 2: Earnings */}
          <View style={s.statCard}>
            <View style={[s.statIconCircle, { backgroundColor: '#E8F8F0' }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>₹</Text>
            </View>
            <Text style={s.statHeaderLabel}>EARNINGS</Text>
            <Text style={s.statBigNumber}>₹{displayEarnings}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="arrow-up" size={11} color="#10B981" />
              <Text style={s.statFooterGreen}>12% <Text style={s.statFooterMuted}>Vs yesterday</Text></Text>
            </View>
          </View>

          {/* Card 3: Rating */}
          <View style={s.statCard}>
            <View style={[s.statIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="star" size={15} color="#8B5CF6" />
            </View>
            <Text style={s.statHeaderLabel}>RATING</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.statBigNumber}>{displayRating}</Text>
              <Ionicons name="star" size={14} color="#F59E0B" />
            </View>
            <Text style={s.statFooterMuted}>(124 reviews)</Text>
          </View>
        </View>

        {/* ── Assigned to You Section ───────────────────────────── */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>Assigned to You</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Jobs')} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={13} color="#0D3325" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Job Cards */}
        {assignedJobs.length === 0 ? (
          /* Default reference placeholder card when no live job is assigned yet */
          <TouchableOpacity
            style={s.jobCard}
            activeOpacity={0.9}
            onPress={() => {
              if (store.jobs.length > 0) {
                navigation.navigate('JobDetails', { jobId: store.jobs[0].jobId });
              } else {
                Alert.alert('No Jobs', 'Waiting for new customer bookings.');
              }
            }}
          >
            {/* Top row */}
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
                <Text style={s.jobTitleText}>Full Home Cleaning</Text>
                <View style={s.jobMetaRow}>
                  <Ionicons name="person-outline" size={13} color="#6B7280" />
                  <Text style={s.jobCustomerName}>Customer: Visweswaran .P</Text>
                </View>
                <View style={s.jobMetaRow}>
                  <Ionicons name="location-outline" size={13} color="#6B7280" />
                  <Text style={s.jobDistanceText}>Nearby • 1.2 km</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>

            {/* Divider */}
            <View style={s.jobDivider} />

            {/* Bottom Bar: Schedule & Earnings */}
            <View style={s.jobCardBottom}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={s.jobDateText}>Sep 30 • 1:26 PM</Text>
              </View>
              <Text style={s.jobPriceText}>₹480</Text>
            </View>
          </TouchableOpacity>
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
                    <Text style={s.jobDistanceText}>Nearby • {job.distance || '1.2 km'}</Text>
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
    paddingVertical: 6,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  notifRedDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  profileLeft: {
    flex: 1,
  },
  avatarWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImg: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
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
  greetingSub: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  vendorNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  nameVerifiedBadge: {
    marginLeft: 2,
  },
  captainTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  captainTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D3325',
  },
  mottoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },

  profileRightIllustration: {
    paddingTop: 10,
    alignItems: 'center',
  },
  captainShirtPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,51,37,0.06)',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(13,51,37,0.1)',
  },
  shirtBadgeTag: {
    backgroundColor: '#0D3325',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    marginTop: 2,
  },
  shirtBadgeTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  // ── Online Card ──────────────────────────────────────────────────────────
  onlineCard: {
    backgroundColor: '#0D3325',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  onlineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  onlineSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // ── Stats 3-card Row ─────────────────────────────────────────────────────
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
    borderColor: '#EBECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statHeaderLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statBigNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },
  statFooterMuted: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  statFooterGreen: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },

  // ── Section ──────────────────────────────────────────────────────────────
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D3325',
  },

  // ── Job Card ─────────────────────────────────────────────────────────────
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
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
    backgroundColor: '#E5F3EB',
  },
  jobThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  captainBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#0D3325',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  captainBadgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  jobCustomerName: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  jobDistanceText: {
    fontSize: 12,
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
    color: '#4B5563',
    fontWeight: '600',
  },
  jobPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D3325',
  },
});
