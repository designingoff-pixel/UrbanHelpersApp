import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Radius } from '../theme';

const SERVICE_EMOJI: Record<string, string> = {
  'Home Cleaning': '🏠',
  Plumbing: '🔧',
  'RO Service': '💧',
  Electrical: '⚡',
  'Appliance Repair': '🔌',
  'Pest Control': '🐛',
  Carpentry: '🪚',
};

export default function EarningsScreen({ navigation }: any) {
  const [, forceUpdate] = useState(0);
  useEffect(() => store.subscribe(() => forceUpdate((n) => n + 1)), []);

  const { vendor } = store;
  const completed = store.jobs.filter((j) => j.status === 'COMPLETED');
  const todayEarnings = vendor.todayEarnings || store.totalEarnings || 1247;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings & Payouts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Main Earnings Banner */}
        <LinearGradient
          colors={['#0D3325', '#164E3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>TODAY'S EARNINGS</Text>
          <Text style={styles.heroAmount}>₹{todayEarnings.toLocaleString('en-IN')}</Text>
          <View style={styles.heroTrend}>
            <Ionicons name="trending-up" size={14} color="#10B981" />
            <Text style={styles.heroTrendText}>12% vs yesterday</Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Jobs Completed</Text>
              <Text style={styles.heroStatValue}>{completed.length || store.completedJobsCount}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Time Online</Text>
              <Text style={styles.heroStatValue}>6h 15m</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>THIS WEEK</Text>
            <Text style={styles.statAmount}>₹{(todayEarnings * 4.2).toFixed(0)}</Text>
            <View style={styles.trend}>
              <Ionicons name="trending-up" size={13} color="#10B981" />
              <Text style={styles.trendText}>+5.2%</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>THIS MONTH</Text>
            <Text style={styles.statAmount}>₹{(todayEarnings * 18).toFixed(0)}</Text>
            <View style={styles.trend}>
              <Ionicons name="trending-up" size={13} color="#10B981" />
              <Text style={styles.trendText}>+12.8%</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Last 7 Days Earnings</Text>
          <View style={styles.chartBars}>
            {[480, 850, 600, 1100, 950, 1400, todayEarnings].map((v, i) => {
              const max = 1500;
              const pct = Math.min(1, v / max);
              const isToday = i === 6;
              return (
                <View key={i} style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(pct * 100, 12)}%` as any,
                        backgroundColor: isToday ? '#10B981' : '#E5E7EB',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.barLabel,
                      isToday && { color: '#0D3325', fontWeight: '800' },
                    ]}
                  >
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Completed Jobs History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Orders</Text>
          {completed.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="wallet-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No completed jobs yet for this period.</Text>
            </View>
          ) : (
            completed.map((job) => (
              <View key={job.jobId} style={styles.jobItem}>
                <View style={styles.jobEmoji}>
                  <Text style={{ fontSize: 20 }}>{SERVICE_EMOJI[job.serviceType] || '🏠'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobName}>{job.serviceName}</Text>
                  <Text style={styles.jobCustomer}>{job.customerName} • {job.time}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.jobAmount}>₹{job.vendorEarnings}</Text>
                  <View style={styles.paidRow}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.paidText}>PAID</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scroll: { paddingHorizontal: 16, paddingTop: 6 },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: 1, marginBottom: 4 },
  heroAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  heroTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  heroTrendText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 12,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  heroStatValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECEF',
  },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 0.5, marginBottom: 4 },
  statAmount: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: 11, fontWeight: '700', color: '#10B981' },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBECEF',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 14 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barWrap: { alignItems: 'center', width: 28, height: '100%', justifyContent: 'flex-end' },
  bar: { width: 14, borderRadius: 7 },
  barLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBECEF',
    gap: 8,
  },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECEF',
    marginBottom: 10,
    gap: 12,
  },
  jobEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  jobCustomer: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  jobAmount: { fontSize: 15, fontWeight: '800', color: '#0D3325' },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  paidText: { fontSize: 10, fontWeight: '800', color: '#10B981' },
});
