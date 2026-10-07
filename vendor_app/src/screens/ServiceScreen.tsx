import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Modal, Alert, Dimensions, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { updateBookingStatus, updateBookingAudio, updateBookingPhotos, updateBookingChecklist } from '../services/firestoreService';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import SOSModal from '../components/SOSModal';
import DiagnosticModal from '../components/DiagnosticModal';
import NearbySuppliersModal from '../components/NearbySuppliersModal';

const { width } = Dimensions.get('window');

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getDynamicChecklist(serviceType: string, serviceName: string): string[] {
  const text = `${serviceType} ${serviceName}`.toLowerCase();

  if (text.includes('clean') || text.includes('maid') || text.includes('housekeep')) {
    return [
      'Inspect rooms, surfaces & high-touch areas',
      'Dusting, vacuuming & deep scrubbing of floors',
      'Kitchen counter, sink & appliance degreasing',
      'Bathroom sanitation & tile descaling',
      'Capture Before & After service proof photos',
      'Final walkthrough & customer satisfaction review',
    ];
  }
  if (text.includes('ac') || text.includes('air conditioner') || text.includes('cool')) {
    return [
      'Inspect indoor/outdoor units & power diagnostics',
      'Deep jet cleaning of filters & condenser coils',
      'Check refrigerant gas pressure & leak detection',
      'Measure air output temperature & voltage test',
      'Capture Before & After service proof photos',
      'Complete test run & handover to customer',
    ];
  }
  if (text.includes('ro') || text.includes('water') || text.includes('purif')) {
    return [
      'Test raw inlet TDS and check water pressure',
      'Inspect pre-filter, sediment & activated carbon cartridges',
      'Check RO membrane rejection rate & pump PSI',
      'Sanitize storage tank & test output water purity',
      'Capture Before & After service proof photos',
      'Handover verified pure water sample to customer',
    ];
  }
  if (text.includes('pest') || text.includes('cockroach') || text.includes('termite')) {
    return [
      'Identify infestation hotspots & entry gaps',
      'Chemical dilution & safety preparation check',
      'Targeted gel baiting & crack-and-crevice perimeter spray',
      'Safety briefing on ventilation to customer',
      'Capture Before & After treatment photos',
    ];
  }
  if (text.includes('plumb') || text.includes('pipe') || text.includes('drain') || text.includes('tap')) {
    return [
      'Inspect pipeline joints, valves & pressure test',
      'Isolate main water line & disassemble faulty fittings',
      'Replace worn washers, seals, cartridges or pipes',
      'Re-pressurize system & verify zero leaks',
      'Capture Before & After repair photos',
    ];
  }

  return [
    'Initial pre-service inspection & safety audit',
    'Execute core service procedures with calibrated tools',
    'Inspect and verify operational quality',
    'Capture Before & After work verification photos',
    'Customer demonstration & clean site handover',
  ];
}

export default function ServiceScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [, forceUpdate] = useState(0);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Photos state
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  // Modals
  const [sosVisible, setSosVisible] = useState(false);
  const [diagVisible, setDiagVisible] = useState(false);
  const [suppliersVisible, setSuppliersVisible] = useState(false);

  // Audio recording & playback
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordingDurationSecs, setRecordingDurationSecs] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [savingAudio, setSavingAudio] = useState(false);

  useEffect(() => {
    return store.subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  const job = store.getJob(jobId);

  // Load existing photos and audio from job
  useEffect(() => {
    if (job?.beforePhoto) setBeforePhoto(job.beforePhoto);
    if (job?.afterPhoto) setAfterPhoto(job.afterPhoto);
    if (job?.audioUrl) setAudioUri(job.audioUrl);
  }, [job?.beforePhoto, job?.afterPhoto, job?.audioUrl]);

  // Audio recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAudioRecording) {
      interval = setInterval(() => {
        setRecordingDurationSecs((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAudioRecording]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Dynamic checklist initialization
  useEffect(() => {
    if (job && (!job.checklist || job.checklist.length === 0)) {
      const dynamicList = getDynamicChecklist(job.serviceType, job.serviceName);
      store.updateJobStatus(job.jobId, job.status, { checklist: dynamicList });
    }
  }, [job?.jobId]);

  if (!job) return null;

  // ── Photo Picker Handler ──────────────────────────────────────────────────
  const handlePickPhoto = async (type: 'before' | 'after') => {
    try {
      Alert.alert(
        `Capture ${type === 'before' ? 'Before' : 'After'} Photo`,
        'Choose photo source:',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Camera access is required to take verification photos.');
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.6,
                base64: true,
              });
              if (!res.canceled && res.assets && res.assets.length > 0) {
                savePhotoData(type, res.assets[0]);
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Gallery access is required.');
                return;
              }
              const res = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0.6,
                base64: true,
              });
              if (!res.canceled && res.assets && res.assets.length > 0) {
                savePhotoData(type, res.assets[0]);
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const savePhotoData = async (type: 'before' | 'after', asset: ImagePicker.ImagePickerAsset) => {
    const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setUploadingPhoto(type);

    if (type === 'before') {
      setBeforePhoto(dataUri);
      store.updateJobPhotos(job.jobId, dataUri, undefined);
      await updateBookingPhotos(job.jobId, { beforePhoto: dataUri });
    } else {
      setAfterPhoto(dataUri);
      store.updateJobPhotos(job.jobId, undefined, dataUri);
      await updateBookingPhotos(job.jobId, { afterPhoto: dataUri });
    }

    setUploadingPhoto(null);
    Alert.alert('✅ Photo Saved', `${type === 'before' ? 'Before' : 'After'} service proof uploaded to booking record.`);
  };

  // ── Audio Recording Handlers ──────────────────────────────────────────────
  const handleStartAudioRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone Access Needed', 'Please allow microphone access to record audio proof of service.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsAudioRecording(true);
      setRecordingDurationSecs(0);
    } catch (e: any) {
      console.warn('Start recording error:', e);
      Alert.alert('Recording Error', e.message || 'Could not start voice recording.');
    }
  };

  const handleStopAudioRecording = async () => {
    if (!recordingRef.current) return;
    setSavingAudio(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsAudioRecording(false);

      if (uri) {
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const dataUri = `data:audio/m4a;base64,${base64Audio}`;
        setAudioUri(dataUri);
        job.audioUrl = dataUri;
        await updateBookingAudio(job.jobId, dataUri);
        Alert.alert('🎙️ Voice Note Saved', 'Voice recording attached to booking record.');
      }
    } catch (e: any) {
      console.warn('Stop recording error:', e);
      Alert.alert('Error', 'Failed to save recording.');
    } finally {
      setSavingAudio(false);
    }
  };

  const handleTogglePlayback = async () => {
    if (!audioUri) return;
    try {
      if (isPlayingAudio && soundRef.current) {
        await soundRef.current.stopAsync();
        setIsPlayingAudio(false);
        return;
      }
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlayingAudio(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch (e: any) {
      console.warn('Audio playback error:', e);
      Alert.alert('Playback Error', 'Could not play voice recording.');
    }
  };

  // ── Dynamic Checklist Handler with Firestore Sync ──────────────────────────
  const handleToggleCheckItem = async (item: string) => {
    store.toggleChecklist(job.jobId, item);
    forceUpdate((n) => n + 1);
    try {
      await updateBookingChecklist(job.jobId, job.checklistDone, checklistItems);
    } catch (err) {
      console.warn('Checklist sync error:', err);
    }
  };

  // ── Finish & Complete Service ─────────────────────────────────────────────
  const handleConfirmComplete = async () => {
    setIsFinishing(true);
    try {
      store.completeJob(job.jobId);
      await updateBookingStatus(job.jobId, 'completed', store.vendorId || undefined, job.vendorEarnings);
      await updateBookingChecklist(job.jobId, job.checklistDone, checklistItems);

      setCompleteModalVisible(false);
      navigation.navigate('Complete', { jobId: job.jobId });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const checklistItems = job.checklist && job.checklist.length > 0
    ? job.checklist
    : getDynamicChecklist(job.serviceType, job.serviceName);

  const doneCount = job.checklistDone.length;
  const totalCount = checklistItems.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.activeDot} />
          <Text style={styles.headerTitle}>ACTIVE SERVICE</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setSosVisible(true)} style={styles.sosHeaderBtn}>
            <Ionicons name="warning" size={14} color="#DC2626" />
            <Text style={styles.sosHeaderText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Service Hero Card & Timer */}
        <View style={styles.timerCard}>
          <LinearGradient colors={['#0D3325', '#164E3A']} style={styles.timerGrad}>
            <View style={styles.timerRow}>
              <View style={styles.categoryPill}>
                <Ionicons name="construct" size={12} color="#34D399" />
                <Text style={styles.categoryPillText}>{job.serviceType}</Text>
              </View>
              <Text style={styles.timerDisplay}>{formatTime(store.recordingSeconds)}</Text>
            </View>

            <Text style={styles.serviceNameMain}>{job.serviceName}</Text>
            <Text style={styles.customerSub}>Customer: {job.customerName} • {job.address}</Text>
          </LinearGradient>
        </View>

        {/* Quick Technician Tools: Diagnostic Guide & Spare Parts Hub */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => setDiagVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#0284C7', '#0369A1']} style={styles.toolBtnGrad}>
              <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" />
              <View>
                <Text style={styles.toolBtnTitle}>Diagnostic Guide</Text>
                <Text style={styles.toolBtnSub}>Step-by-step SOP</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => setSuppliersVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={['#0F172A', '#334155']} style={styles.toolBtnGrad}>
              <Ionicons name="storefront-outline" size={18} color="#60A5FA" />
              <View>
                <Text style={styles.toolBtnTitle}>Spare Parts Hub</Text>
                <Text style={styles.toolBtnSub}>Find tool shops</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Before & After Work Verification Photos */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={18} color="#0D3325" />
            <Text style={styles.sectionTitle}>BEFORE &amp; AFTER WORK PROOF</Text>
          </View>
          <Text style={styles.sectionSub}>
            Take clear photos before starting and after finishing the service for customer transparency and quality rating.
          </Text>

          <View style={styles.photoGrid}>
            {/* Before Photo Box */}
            <View style={styles.photoBox}>
              <Text style={styles.photoBoxLabel}>1. Before Service</Text>
              {beforePhoto ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: beforePhoto }} style={styles.photoImg} />
                  <TouchableOpacity
                    style={styles.replaceBtn}
                    onPress={() => handlePickPhoto('before')}
                  >
                    <Ionicons name="refresh" size={14} color="#FFFFFF" />
                    <Text style={styles.replaceText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.photoPlaceholder}
                  onPress={() => handlePickPhoto('before')}
                  disabled={uploadingPhoto === 'before'}
                >
                  {uploadingPhoto === 'before' ? (
                    <ActivityIndicator size="small" color="#0D3325" />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={28} color="#64748B" />
                      <Text style={styles.photoAddText}>Take Before Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* After Photo Box */}
            <View style={styles.photoBox}>
              <Text style={styles.photoBoxLabel}>2. After Service</Text>
              {afterPhoto ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: afterPhoto }} style={styles.photoImg} />
                  <TouchableOpacity
                    style={styles.replaceBtn}
                    onPress={() => handlePickPhoto('after')}
                  >
                    <Ionicons name="refresh" size={14} color="#FFFFFF" />
                    <Text style={styles.replaceText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.photoPlaceholder}
                  onPress={() => handlePickPhoto('after')}
                  disabled={uploadingPhoto === 'after'}
                >
                  {uploadingPhoto === 'after' ? (
                    <ActivityIndicator size="small" color="#0D3325" />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={28} color="#64748B" />
                      <Text style={styles.photoAddText}>Take After Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Voice Recording Verification Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mic-outline" size={18} color="#0D3325" />
            <Text style={styles.sectionTitle}>VOICE RECORDING PROOF</Text>
          </View>
          <Text style={styles.sectionSub}>
            Record an audio summary or customer confirmation before completion.
          </Text>

          <View style={styles.audioRecordBox}>
            {isAudioRecording ? (
              <View style={styles.recordingActiveWrap}>
                <View style={styles.recordingPulseDot} />
                <Text style={styles.recordingTimerText}>
                  Recording: {formatTime(recordingDurationSecs)}
                </Text>
                <TouchableOpacity
                  style={styles.stopRecordingBtn}
                  onPress={handleStopAudioRecording}
                  disabled={savingAudio}
                >
                  {savingAudio ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="stop-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.stopRecordingBtnText}>Stop &amp; Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : audioUri ? (
              <View style={styles.audioSavedWrap}>
                <View style={styles.audioSavedInfo}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.audioSavedText}>Voice proof recorded &amp; attached</Text>
                </View>
                <View style={styles.audioActionsRow}>
                  <TouchableOpacity
                    style={styles.playAudioBtn}
                    onPress={handleTogglePlayback}
                  >
                    <Ionicons
                      name={isPlayingAudio ? 'pause' : 'play'}
                      size={16}
                      color="#0D3325"
                    />
                    <Text style={styles.playAudioText}>
                      {isPlayingAudio ? 'Pause' : 'Play Proof'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rerecordBtn}
                    onPress={handleStartAudioRecording}
                  >
                    <Ionicons name="refresh" size={14} color="#64748B" />
                    <Text style={styles.rerecordText}>Re-record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startRecordBtn}
                onPress={handleStartAudioRecording}
              >
                <Ionicons name="mic" size={20} color="#FFFFFF" />
                <Text style={styles.startRecordText}>Start Voice Recording</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dynamic Quality Checklist */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkbox-outline" size={18} color="#0D3325" />
            <Text style={styles.sectionTitle}>SERVICE CHECKLIST ({doneCount}/{totalCount})</Text>
          </View>

          <View style={styles.checklistWrap}>
            {checklistItems.map((item, idx) => {
              const isChecked = job.checklistDone.includes(item);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.checkItem, isChecked && styles.checkItemDone]}
                  onPress={() => handleToggleCheckItem(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? '#10B981' : '#94A3B8'}
                  />
                  <Text style={[styles.checkText, isChecked && styles.checkTextDone]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Complete Service Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => setCompleteModalVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#0D3325', '#164E3A']} style={styles.completeBtnGrad}>
            <Ionicons name="checkmark-done-circle" size={22} color="#FFFFFF" />
            <Text style={styles.completeBtnText}>Complete &amp; Finalize Service</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={completeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons name="checkmark-circle" size={54} color="#10B981" />
            <Text style={styles.confirmTitle}>Complete Service?</Text>
            <Text style={styles.confirmSub}>
              Ensure all checklist steps are completed and verification photos are captured.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCompleteModalVisible(false)}
                disabled={isFinishing}
              >
                <Text style={styles.cancelBtnText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmComplete}
                disabled={isFinishing}
              >
                {isFinishing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Yes, Complete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modals */}
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} currentJobId={job.jobId} />
      <DiagnosticModal
        visible={diagVisible}
        onClose={() => setDiagVisible(false)}
        serviceCategory={job.serviceType}
        subServiceName={job.serviceName}
      />
      <NearbySuppliersModal
        visible={suppliersVisible}
        onClose={() => setSuppliersVisible(false)}
        serviceCategory={job.serviceType}
        latitude={job.latitude}
        longitude={job.longitude}
        customerAddress={job.address}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D3325',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sosHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  scroll: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  timerCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  timerGrad: {
    padding: 18,
    gap: 10,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  timerDisplay: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FFFFFF',
  },
  serviceNameMain: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  customerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toolBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  toolBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  toolBtnTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toolBtnSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  photoBox: {
    flex: 1,
    gap: 6,
  },
  photoBoxLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  photoPlaceholder: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  photoAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  photoPreviewWrap: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  replaceBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  replaceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  audioRecordBox: {
    marginTop: 8,
  },
  startRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D3325',
    paddingVertical: 14,
    borderRadius: 12,
  },
  startRecordText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  recordingActiveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 12,
  },
  recordingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  recordingTimerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
    marginLeft: 8,
  },
  stopRecordingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopRecordingBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  audioSavedWrap: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  audioSavedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioSavedText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
  },
  audioActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playAudioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  playAudioText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D3325',
  },
  rerecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  rerecordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  checklistWrap: {
    gap: 8,
    marginTop: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  checkTextDone: {
    color: '#15803D',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  completeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  confirmSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0D3325',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
