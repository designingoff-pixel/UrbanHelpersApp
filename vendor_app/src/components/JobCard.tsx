import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../data/types';

interface Props {
  job: Job;
  onPress: (job: Job) => void;
}

export default function JobCard({ job, onPress }: Props) {
  const isAssigned = job.assignmentType === 'ADMIN_ASSIGNED';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(job)} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.jobThumbnailWrap}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80' }}
            style={styles.jobThumbnailImg}
          />
        </View>

        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={styles.captainBadgePill}>
            <Text style={styles.captainBadgePillText}>
              {isAssigned ? 'URBAN CAPTAIN' : 'REQUEST'}
            </Text>
          </View>
          <Text style={styles.jobTitleText} numberOfLines={1}>
            {job.serviceName || 'Full Home Cleaning'}
          </Text>
          <View style={styles.jobMetaRow}>
            <Ionicons name="person-outline" size={13} color="#6B7280" />
            <Text style={styles.jobCustomerName} numberOfLines={1}>
              Customer: {job.customerName || 'Visweswaran .P'}
            </Text>
          </View>
          <View style={styles.jobMetaRow}>
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text style={styles.jobDistanceText}>Nearby • {job.distance || '1.2 km'}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>

      <View style={styles.jobDivider} />

      <View style={styles.jobCardBottom}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.jobDateText}>{job.date} • {job.time}</Text>
        </View>
        <Text style={styles.jobPriceText}>₹{job.vendorEarnings}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  cardTop: {
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
