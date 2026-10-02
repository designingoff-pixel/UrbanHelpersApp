import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

export default function CompleteScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const job = store.getJob(jobId);
  if (!job) return null;

  const secs = store.recordingSeconds;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const durationStr = h > 0 ? `${h}h ${m}m` : `${m || 1}m`;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconWrap}>
          <LinearGradient colors={['#34d399', '#0d9488']} style={styles.iconCircle}>
            <Ionicons name="trophy" size={52} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Service Completed!</Text>
        <Text style={styles.subtitle}>Great job! Your earnings and verified job proof have been recorded.</Text>

        {/* Summary Card */}
        <View style={styles.card}>
          {[
            { label: 'Customer', value: job.customerName },
            { label: 'Service', value: job.serviceName },
            { label: 'Duration', value: durationStr },
          ].map(({ label, value }) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
          ))}

          {/* Work Verification Photos Preview */}
          {(job.beforePhoto || job.afterPhoto) && (
            <View style={[styles.photoSection, styles.bordered]}>
              <Text style={styles.rowLabel}>Work Verification Photos</Text>
              <View style={styles.photoRow}>
                {job.beforePhoto && (
                  <View style={styles.photoThumbWrap}>
                    <Image source={{ uri: job.beforePhoto }} style={styles.photoThumb} />
                    <Text style={styles.photoTag}>Before</Text>
                  </View>
                )}
                {job.afterPhoto && (
                  <View style={styles.photoThumbWrap}>
                    <Image source={{ uri: job.afterPhoto }} style={styles.photoThumb} />
                    <Text style={styles.photoTag}>After</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={[styles.row, styles.bordered]}>
            <Text style={styles.rowLabel}>Payment Status</Text>
            <View style={styles.paidBadge}>
              <View style={styles.paidDot} />
              <Text style={styles.paidText}>🟢 PAID</Text>
            </View>
          </View>

          <View style={[styles.row, styles.bordered]}>
            <Text style={styles.rowLabel}>Your Net Earnings (80%)</Text>
            <Text style={styles.earningsValue}>₹{job.vendorEarnings}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Earnings' })} activeOpacity={0.85} style={{ borderRadius: Radius.full, overflow: 'hidden' }}>
            <LinearGradient colors={[Colors.gradientBlueStart, Colors.gradientBlueEnd]} style={styles.actionBtn}>
              <Ionicons name="wallet" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>View Earnings &amp; History</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} style={styles.secondaryBtn} activeOpacity={0.85}>
            <Ionicons name="home" size={20} color={Colors.onSurface} />
            <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.midnightNavy },
  scroll: { flexGrow: 1, alignItems: 'center', padding: Spacing.containerPadding, paddingTop: 60, paddingBottom: 60 },
  iconWrap: { marginBottom: 20 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', ...Shadows.cardSoft },
  title: { ...Typography.displayLg, color: Colors.onSurface, textAlign: 'center', marginBottom: 6 },
  subtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 },
  card: {
    width: '100%', backgroundColor: Colors.darkNavy, borderRadius: Radius.xl,
    padding: Spacing.containerPadding, borderWidth: 1, borderColor: Colors.outlineVariant + '30',
    ...Shadows.cardSoft, gap: 12, marginBottom: 28,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  rowValue: { ...Typography.bodyLg, color: Colors.onSurface, fontWeight: '600' },
  bordered: { paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '30' },
  photoSection: { gap: 8 },
  photoRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  photoThumbWrap: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  photoTag: {
    position: 'absolute', bottom: 3, left: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#FFFFFF',
    fontSize: 9, fontWeight: '700', paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 4,
  },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paidDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  paidText: { ...Typography.labelMd, color: '#4ade80' },
  earningsValue: { ...Typography.displayLg, color: '#4ade80', fontSize: 30 },
  actions: { width: '100%', gap: 14 },
  actionBtn: { height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionBtnText: { ...Typography.headlineMd, color: '#fff' },
  secondaryBtn: {
    height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: Colors.darkNavy, borderWidth: 1, borderColor: Colors.outlineVariant,
    borderRadius: Radius.full,
  },
  secondaryBtnText: { ...Typography.headlineMd, color: Colors.onSurface },
});
