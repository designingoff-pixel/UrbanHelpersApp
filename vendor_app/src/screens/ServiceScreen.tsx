import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Modal, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { updateBookingStatus, updateBookingAudio } from '../services/firestoreService';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ServiceScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [, forceUpdate] = useState(0);
  const [paused, setPaused] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uploading, setUploading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => forceUpdate((n) => n + 1));

    const job = store.getJob(jobId);
    if (job) updateBookingStatus(job.bookingId, 'in_progress');

    // Start audio recording
    const startAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(rec);
      } catch (err: any) {
        console.warn('Audio start error:', err);
      }
    };
    startAudio();

    timerRef.current = setInterval(() => {
      if (!paused) store.tickRecording();
    }, 1000);

    return () => {
      unsub();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(() => store.tickRecording(), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const job = store.getJob(jobId);
  if (!job) return null;

  const defaultChecklist = [
    'Inspect service area and equipment',
    'Execute deep cleaning protocol',
    'Disinfect high-touch surfaces',
    'Final quality inspection with customer',
  ];
  const checklistItems = job.checklist.length > 0 ? job.checklist : defaultChecklist;
  const doneCount = job.checklistDone.length;
  const totalCount = checklistItems.length;
  const progressRatio = totalCount > 0 ? doneCount / totalCount : 0;

  const handleToggleItem = (item: string) => {
    store.toggleChecklist(jobId, item);
  };

  const handleStopRecordingAndComplete = async () => {
    Alert.alert(
      'Stop Service Recording',
      'Are you sure the service is complete? This will finalize your job and upload the safety recording.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Job',
          onPress: async () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setUploading(true);

            if (recording) {
              try {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                if (uri && job) {
                  const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/kzqaiull/video/upload';
                  const response = await (FileSystem as any).uploadAsync?.(cloudinaryUrl, uri, {
                    httpMethod: 'POST',
                    uploadType: (FileSystem as any).FileSystemUploadType?.MULTIPART ?? 0,
                    fieldName: 'file',
                    parameters: { upload_preset: 'Urban Helpers' },
                  });
                  if (response.status === 200) {
                    const data = JSON.parse(response.body);
                    await updateBookingAudio(job.bookingId, data.secure_url);
                  }
                }
              } catch (err) {
                console.warn('Upload error:', err);
              }
            }

            store.completeJob(jobId);
            if (job) updateBookingStatus(job.bookingId, 'completed');
            setUploading(false);
            navigation.navigate('Complete', { jobId });
          },
        },
      ]
    );
  };

  const vendorAvatar =
    store.vendor.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* ── Header with Back + Mic ────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        {/* Top Recording Status Pill */}
        <View style={s.recordingStatusPill}>
          <View style={s.recordingRedDot} />
          <Text style={s.recordingStatusText}>RECORDING {formatTime(store.recordingSeconds)}</Text>
        </View>

        <TouchableOpacity style={s.micBtn} activeOpacity={0.7}>
          <Ionicons name="mic-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Main Dark Forest Green Card ───────────────────────── */}
        <LinearGradient
          colors={['#0D3325', '#164E3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroServiceCard}
        >
          {/* Vendor Avatar + In Progress Title Row */}
          <View style={s.heroCardTopRow}>
            <View style={s.vendorAvatarWrap}>
              <Image source={{ uri: vendorAvatar }} style={s.vendorAvatarImg} />
            </View>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={s.inProgressSmall}>In Progress:</Text>
              <Text style={s.inProgressServiceTitle}>{job.serviceName || 'Full Home Cleaning'}</Text>
              <View style={s.customerMetaRow}>
                <Ionicons name="person" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={s.customerMetaText}>with {job.customerName || 'Visweswaran .P'}</Text>
              </View>
            </View>
          </View>

          {/* Safety Shield Badge Pill inside Card */}
          <View style={s.safetyShieldPill}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text style={s.safetyShieldText}>
              Service recording is active for transparency and safety.
            </Text>
          </View>
        </LinearGradient>

        {/* ── Service Checklist Card ────────────────────────────── */}
        <View style={s.card}>
          <View style={s.checklistHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="clipboard-outline" size={18} color="#0D3325" />
              <Text style={s.checklistTitle}>Service Checklist</Text>
            </View>
            <Text style={s.checklistRatioText}>{doneCount}/{totalCount}</Text>
          </View>

          {/* Progress Bar */}
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: `${Math.max(6, progressRatio * 100)}%` }]} />
          </View>

          {/* Checklist Items */}
          <View style={{ marginTop: 12, gap: 10 }}>
            {checklistItems.map((item, index) => {
              const isDone = job.checklistDone.includes(item);
              return (
                <TouchableOpacity
                  key={`chk-${index}`}
                  style={[s.checklistItemRow, isDone && s.checklistItemRowDone]}
                  onPress={() => handleToggleItem(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isDone ? '#10B981' : '#9CA3AF'}
                  />
                  <Text style={[s.checklistItemText, isDone && s.checklistItemTextDone]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Action Buttons Row ────────────────────────────────── */}
        <View style={s.actionsRow}>
          {/* Pause / Resume */}
          <TouchableOpacity
            style={s.pauseBtn}
            onPress={() => setPaused(!paused)}
            activeOpacity={0.8}
          >
            <Ionicons name={paused ? 'play' : 'pause'} size={18} color="#111827" />
            <Text style={s.pauseBtnText}>{paused ? 'Resume' : 'Pause'}</Text>
          </TouchableOpacity>

          {/* Stop Recording / Complete */}
          <TouchableOpacity
            style={s.stopBtn}
            onPress={handleStopRecordingAndComplete}
            activeOpacity={0.85}
          >
            <Ionicons name="stop" size={18} color="#FFFFFF" />
            <Text style={s.stopBtnText}>Stop Recording</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bottom Decorative Trust Artwork ───────────────────── */}
        <View style={s.bottomTrustWrap}>
          <View style={s.houseSparkleIconWrap}>
            <Ionicons name="home-outline" size={28} color="#0D3325" />
            <Ionicons name="sparkles" size={14} color="#10B981" style={s.sparkleBadge} />
          </View>
          <Text style={s.trustMainText}>Service in Progress...</Text>
          <Text style={s.trustSubText}>Keeping your trust, always</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F7F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recordingStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13,51,37,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  recordingRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 6 },

  // ── Main Hero Card ───────────────────────────────────────────────────────
  heroServiceCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  vendorAvatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  vendorAvatarImg: {
    width: '100%',
    height: '100%',
  },
  inProgressSmall: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  inProgressServiceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  customerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  customerMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },

  safetyShieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  safetyShieldText: {
    flex: 1,
    fontSize: 11,
    color: '#FFFFFF',
    lineHeight: 16,
    fontWeight: '500',
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  checklistHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  checklistRatioText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  checklistItemRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  checklistItemText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  checklistItemTextDone: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },

  // ── Actions Row ──────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pauseBtn: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pauseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  stopBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  stopBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ── Bottom Trust ─────────────────────────────────────────────────────────
  bottomTrustWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  houseSparkleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  sparkleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  trustMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  trustSubText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
