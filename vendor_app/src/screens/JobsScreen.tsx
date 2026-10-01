import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { subscribeToVendorJobs } from '../services/firestoreService';
import JobCard from '../components/JobCard';
import { Spacing, Radius } from '../theme';

const TABS = [
  { key: 'requests', label: 'Requests' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function JobsScreen({ navigation }: any) {
  const [tab, setTab] = useState('active');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    const startSub = (uid: string) => {
      if (unsub) unsub();
      unsub = subscribeToVendorJobs(uid, (jobs) => {
        store.syncAssignedJobs(jobs);
      });
    };
    if (store.vendorId) startSub(store.vendorId);
    const unsubStore = store.subscribe(() => {
      forceUpdate((n) => n + 1);
      if (!unsub && store.vendorId) startSub(store.vendorId);
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
          <Text style={styles.title}>Your Jobs</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              activeOpacity={0.8}
            >
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
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {jobs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={56} color="#9CA3AF" />
            <Text style={styles.emptyText}>No {tab} jobs right now.</Text>
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
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#FFFFFF' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  tabsWrapper: { backgroundColor: '#F6F7F9', paddingVertical: 4 },
  tabs: { paddingHorizontal: 16, gap: 8, paddingBottom: 6 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#0D3325',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },
  scroll: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 14 },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
});
