import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { store } from '../store/AppStore';
import { Job } from '../data/types';
import JobCard from './JobCard';

const { width } = Dimensions.get('window');

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectJob: (job: Job) => void;
}

export default function CalendarModal({ visible, onClose, onSelectJob }: CalendarModalProps) {
  const [selectedDateOffset, setSelectedDateOffset] = useState(0); // 0 = today, 1 = tomorrow, -1 = yesterday, etc.

  const days = [-2, -1, 0, 1, 2, 3, 4, 5, 6].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      offset,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      fullDateStr: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      isToday: offset === 0,
    };
  });

  const selectedDay = days.find(d => d.offset === selectedDateOffset) || days[2];

  // Filter jobs for selected day
  const allJobs = store.jobs;
  const filteredJobs = allJobs.filter(j => {
    if (selectedDay.isToday) {
      return j.date === 'Today' || j.date === selectedDay.fullDateStr || j.status === 'SERVICE_STARTED' || j.status === 'NAVIGATING';
    }
    return j.date === selectedDay.fullDateStr;
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <LinearGradient colors={['#0D3325', '#164E3A']} style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.badgePill}>
                <Ionicons name="calendar" size={13} color="#34D399" />
                <Text style={styles.badgePillText}>SCHEDULE CALENDAR</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>Daily Bookings &amp; Schedules</Text>
            <Text style={styles.headerSub}>
              Select a date to inspect scheduled requests, assigned upcoming jobs, and completed history.
            </Text>

            {/* Date strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
              {days.map(d => {
                const isSelected = d.offset === selectedDateOffset;
                return (
                  <TouchableOpacity
                    key={d.offset}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    onPress={() => setSelectedDateOffset(d.offset)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                      {d.isToday ? 'Today' : d.dayName}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.dateNumberActive]}>
                      {d.dateNum}
                    </Text>
                    <Text style={[styles.monthText, isSelected && styles.monthTextActive]}>
                      {d.monthName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </LinearGradient>

          {/* Job List for Selected Date */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.statusRow}>
              <Text style={styles.selectedHeading}>
                {selectedDay.isToday ? "Today's Schedule" : `Schedule for ${selectedDay.fullDateStr}`}
              </Text>
              <Text style={styles.countBadge}>{filteredJobs.length} bookings</Text>
            </View>

            {filteredJobs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-clear-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Bookings Scheduled</Text>
                <Text style={styles.emptySub}>
                  No active or scheduled customer requests for {selectedDay.isToday ? 'today' : selectedDay.fullDateStr}.
                </Text>
              </View>
            ) : (
              filteredJobs.map(j => (
                <JobCard
                  key={j.jobId}
                  job={j}
                  onPress={job => {
                    onClose();
                    onSelectJob(job);
                  }}
                />
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtnFooter} onPress={onClose}>
              <Text style={styles.closeBtnText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    width: '100%',
    height: '84%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginBottom: 14,
  },
  dateStrip: {
    gap: 8,
    paddingBottom: 4,
  },
  dateCard: {
    width: 58,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  dateCardActive: {
    backgroundColor: '#34D399',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dayTextActive: {
    color: '#0D3325',
    fontWeight: '800',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dateNumberActive: {
    color: '#0D3325',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  monthTextActive: {
    color: '#0D3325',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  selectedHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  countBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeBtnFooter: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
