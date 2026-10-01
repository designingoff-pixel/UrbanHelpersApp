import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';

const SERVICE_EMOJI: Record<string, string> = {
  'Home Cleaning': '🏠',
  Plumbing: '🔧',
  'RO Service': '💧',
  Electrical: '⚡',
  'Appliance Repair': '🔌',
  'Pest Control': '🐛',
  Carpentry: '🪚',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function EarningsScreen({ navigation }: any) {
  const [, forceUpdate] = useState(0);
  useEffect(() => store.subscribe(() => forceUpdate((n) => n + 1)), []);

  const completed = store.jobs.filter((j) => j.status === 'COMPLETED');
  const realTotalEarnings = completed.reduce((sum, j) => sum + (j.vendorEarnings || 0), 0);
  const realTodayEarnings = completed
    .filter((j) => j.date === 'Today')
    .reduce((sum, j) => sum + (j.vendorEarnings || 0), 0);

  // Group 7-day earnings by day of week (Monday=0 ... Sunday=6)
  const todayDayIdx = (new Date().getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  const dailyEarnings = [0, 0, 0, 0, 0, 0, 0];
  dailyEarnings[todayDayIdx] = realTodayEarnings;

  // Populate from completed jobs timestamps if available
  completed.forEach((job) => {
    if (job.completedAt) {
      const d = new Date(job.completedAt);
      const dayIdx = (d.getDay() + 6) % 7;
      if (dayIdx !== todayDayIdx) {
        dailyEarnings[dayIdx] += job.vendorEarnings || 0;
      }
    }
  });

  const maxBarValue = Math.max(...dailyEarnings, 500);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings &amp; Payouts</Text>
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
          <Text style={styles.heroLabel}>TODAY'S REAL EARNINGS</Text>
          <Text style={styles.heroAmount}>₹{realTodayEarnings.toLocaleString('en-IN')}</Text>
          <View style={styles.heroTrend}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.heroTrendText}>Direct verified earnings</Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Total Completed</Text>
              <Text style={styles.heroStatValue}>{completed.length} Orders</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Total Lifetime</Text>
              <Text style={styles.heroStatValue}>₹{realTotalEarnings.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 7-Day Chart based on real earnings */}
        <View style={styles.chartCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.chartTitle}>7-Day Earnings Activity</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669' }}>
              ₹{dailyEarnings.reduce((a, b) => a + b, 0).toLocaleString('en-IN')} This Week
            </Text>
          </View>

          <View style={styles.chartBars}>
            {dailyEarnings.map((val, i) => {
              const pct = val > 0 ? Math.min(1, val / maxBarValue) : 0;
              const isToday = i === todayDayIdx;
              return (
                <View key={i} style={styles.barWrap}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: val > 0 ? `${Math.max(pct * 100, 15)}%` : '4%',
                          backgroundColor: isToday ? '#10B981' : val > 0 ? '#0D3325' : '#E5E7EB',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      isToday && { color: '#0D3325', fontWeight: '800' },
                    ]}
                  >
                    {DAY_LABELS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Completed Jobs History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Orders ({completed.length})</Text>
          {completed.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="wallet-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No completed jobs yet.</Text>
              <Text style={styles.emptySubText}>
                When you finish customer service orders, your real earnings and payout records will appear here.
              </Text>
            </View>
          ) : (
            completed.map((job) => (
              <View key={job.jobId} style={styles.jobItem}>
                <View style={styles.jobEmoji}>
                  <Text style={{ fontSize: 20 }}>{SERVICE_EMOJI[job.serviceType] || '🏠'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobName}>{job.serviceName}</Text>
                  <Text style={styles.jobCustomer}>{job.customerName} • {job.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.jobAmount}>+₹{job.vendorEarnings}</Text>
                  <View style={styles.paidRow}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.paidText}>PAID</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 90 }} />
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  scroll: { padding: 16 },

  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  heroTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 16,
  },
  heroTrendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  heroStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 14,
  },
  heroStat: { flex: 1 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 12 },
  heroStatLabel: { fontSize: 11.5, color: 'rgba(255,255,255,0.65)' },
  heroStatValue: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  chartTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barTrack: { width: 14, height: '85%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 6, fontWeight: '600' },

  section: { marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 12 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  emptySubText: { fontSize: 12.5, color: '#9CA3AF', textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },

  jobItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  jobEmoji: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  jobCustomer: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  jobAmount: { fontSize: 15, fontWeight: '800', color: '#0D3325' },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  paidText: { fontSize: 10.5, fontWeight: '800', color: '#10B981' },
});
