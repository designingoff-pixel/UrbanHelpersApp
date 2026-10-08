import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { store } from '../store/AppStore';
import { subscribeToVendorJobs } from '../services/firestoreService';
import JobCard from '../components/JobCard';
import SOSModal from '../components/SOSModal';
import CalendarModal from '../components/CalendarModal';
import { Spacing, Radius } from '../theme';

const TABS = [
  { key: 'requests', label: 'Requests', icon: 'flash' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'active', label: 'Active', icon: 'radio' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done' },
];

export default function JobsScreen({ navigation }: any) {
  const [tab, setTab] = useState('requests');
  const [, forceUpdate] = useState(0);
  const [sosVisible, setSosVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let currentSubscribedId = '';

    const startSub = (uid: string) => {
      if (!uid || uid === currentSubscribedId) return;
      currentSubscribedId = uid;

      if (unsub) unsub();
      const altIds = [
        store.vendor.docId,
        store.vendor.mobile,
        store.firebaseUid,
      ].filter(Boolean) as string[];

      unsub = subscribeToVendorJobs(uid, (jobs) => {
        store.syncAssignedJobs(jobs);
      }, altIds);
    };

    if (store.vendorId) startSub(store.vendorId);
    const unsubStore = store.subscribe(() => {
      forceUpdate((n) => n + 1);
      if (store.vendorId && store.vendorId !== currentSubscribedId) {
        startSub(store.vendorId);
      }
    });

    return () => {
      unsubStore();
      unsub?.();
    };
  }, []);

  const jobs = store.getJobsForTab(tab);
  const vendorAvatar =
    store.vendor.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: vendorAvatar }} style={styles.avatar} />
          <Text style={styles.title}>All Bookings</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setCalendarVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#111827" />
            {store.unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* 4 Workflow Tabs: Requests, Upcoming, Active, Completed */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={t.icon as any}
                size={13}
                color={tab === t.key ? '#FFFFFF' : '#4B5563'}
              />
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
                {store.getJobsForTab(t.key).length > 0 ? ` (${store.getJobsForTab(t.key).length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {jobs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={56} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No {tab} jobs found</Text>
            <Text style={styles.emptyText}>
              {tab === 'requests'
                ? 'New customer service requests will appear here.'
                : `No jobs currently in ${tab} stage.`}
            </Text>
          </View>
        ) : (
          jobs.map((job) => (
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

      {/* Floating SOS Button */}
      <TouchableOpacity
        style={styles.floatingSOS}
        onPress={() => setSosVisible(true)}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.floatingSOSGrad}>
          <Ionicons name="warning" size={18} color="#FFFFFF" />
          <Text style={styles.floatingSOSText}>SOS</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* SOS Modal */}
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />

      {/* Calendar Modal */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onSelectJob={(j) => {
          store.setCurrentJob(j.jobId);
          navigation.navigate('JobDetails', { jobId: j.jobId });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F6F7F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#FFFFFF' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  tabsWrapper: { backgroundColor: '#F6F7F9', paddingVertical: 4 },
  tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 6 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#0D3325',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },
  scroll: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#475569' },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', textAlign: 'center', maxWidth: 260 },
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
