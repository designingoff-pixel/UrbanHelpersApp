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
import { db, storage } from '../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { audioRecordingService } from '../services/audioRecordingService';
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

  // 1. AC / Air Conditioner (Must be checked before generic "clean")
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
  // 2. RO / Water Purifier
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
  // 3. Pest Control
  if (text.includes('pest') || text.includes('cockroach') || text.includes('termite')) {
    return [
      'Identify infestation hotspots & entry gaps',
      'Chemical dilution & safety preparation check',
      'Targeted gel baiting & crack-and-crevice perimeter spray',
      'Safety briefing on ventilation to customer',
      'Capture Before & After treatment photos',
    ];
  }
  // 4. Plumbing
  if (text.includes('plumb') || text.includes('pipe') || text.includes('drain') || text.includes('tap')) {
    return [
      'Inspect pipeline joints, valves & pressure test',
      'Isolate main water line & disassemble faulty fittings',
      'Replace worn washers, seals, cartridges or pipes',
      'Re-pressurize system & verify zero leaks',
      'Capture Before & After repair photos',
    ];
  }
  // 5. Electrical
  if (text.includes('electr') || text.includes('wire') || text.includes('switch') || text.includes('fan')) {
    return [
      'Voltage & circuit continuity safety check',
      'Inspect wiring insulation and terminal tightness',
      'Replace or repair malfunctioning electrical components',
      'Test load capacity and grounding safety',
      'Capture Before & After service photos',
    ];
  }
  // 6. Home Cleaning / Maid / Housekeeping
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

  // Subscribe to background audio recording service state
  useEffect(() => {
    const unsub = audioRecordingService.subscribe((state) => {
      if (state.jobId === jobId || !state.jobId) {
        setIsAudioRecording(state.isRecording);
        setRecordingDurationSecs(state.durationSecs);
      }
    });
    return () => unsub();
  }, [jobId]);

  // Automatically start voice recording upon entering active service if not already recording
  useEffect(() => {
    const startAutoRecord = async () => {
      if (job && !job.audioUrl && !audioUri) {
        if (!audioRecordingService.isRecordingForJob(job.jobId)) {
          await audioRecordingService.startBackgroundRecording(job.jobId);
        }
      }
    };
    startAutoRecord();
  }, [job?.jobId]);

  // Clean up playback sound on unmount (note: background voice recording continues uninterrupted!)
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      // Audio recording deliberately continues in the background until service completion!
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

  // ── Photo Picker Handler (Compressed & Storage-Uploaded) ───────────────────
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
                aspect: [4, 3],
                quality: 0.25,
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
                aspect: [4, 3],
                quality: 0.25,
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
    setUploadingPhoto(type);
    try {
      let finalPhotoUrl = '';
      const photoTimestamp = Date.now();
      const storagePath = `proofs/${job.bookingId || job.jobId}_${type}_${photoTimestamp}.jpg`;

      // 1. Upload photo directly to Firebase Storage
      if (storage) {
        try {
          const storageRef = ref(storage, storagePath);
          if (asset.base64) {
            await uploadString(storageRef, asset.base64, 'base64', { contentType: 'image/jpeg' });
            finalPhotoUrl = await getDownloadURL(storageRef);
          } else {
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
            finalPhotoUrl = await getDownloadURL(storageRef);
          }
          console.log(`[savePhotoData] ${type} photo successfully uploaded to Firebase Storage:`, finalPhotoUrl);
        } catch (storageErr) {
          console.warn('[savePhotoData] Storage upload failed:', storageErr);
        }
      }

      // 2. Strict validation: Never store oversized Base64 data URIs into Firestore document
      if (!finalPhotoUrl || finalPhotoUrl.startsWith('data:') || finalPhotoUrl.startsWith('file://')) {
        throw new Error('Photo could not be uploaded to cloud storage. Please check your internet connection and try again.');
      }

      if (type === 'before') {
        setBeforePhoto(finalPhotoUrl);
        store.updateJobPhotos(job.jobId, finalPhotoUrl, undefined);
        await updateBookingPhotos(job.jobId, { beforePhoto: finalPhotoUrl, beforePhotoPath: storagePath });
      } else {
        setAfterPhoto(finalPhotoUrl);
        store.updateJobPhotos(job.jobId, undefined, finalPhotoUrl);
        await updateBookingPhotos(job.jobId, { afterPhoto: finalPhotoUrl, afterPhotoPath: storagePath });
      }

      Alert.alert('✅ Photo Saved', `${type === 'before' ? 'Before' : 'After'} service proof attached successfully.`);
    } catch (err: any) {
      console.warn('[savePhotoData] Upload error:', err?.message || err);
      Alert.alert('Upload Error', err?.message || 'Could not save photo proof. Please retry.');
    } finally {
      setUploadingPhoto(null);
    }
  };

  // ── Audio Recording Handlers (Automatic & Storage-Uploaded) ────────────────
  const handleStartAudioRecording = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlayingAudio(false);
      await audioRecordingService.startBackgroundRecording(job.jobId);
    } catch (e: any) {
      console.warn('Start recording error:', e);
    }
  };

  const handleStopAudioRecording = async (): Promise<string | null> => {
    setSavingAudio(true);
    try {
      const finalUrl = await audioRecordingService.stopAndSaveRecording(job.jobId);
      if (finalUrl && !finalUrl.startsWith('file://')) {
        setAudioUri(finalUrl);
        job.audioUrl = finalUrl;
        return finalUrl;
      }
      return null;
    } catch (e: any) {
      console.warn('Stop recording error:', e);
      return null;
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
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      let playUri = audioUri;
      if (audioUri.startsWith('data:')) {
        const base64Data = audioUri.split(',')[1] || audioUri;
        const tempDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
        const tempFile = `${tempDir}playback_${job.jobId}.m4a`;
        await FileSystem.writeAsStringAsync(tempFile, base64Data, {
          encoding: 'base64' as any,
        });
        playUri = tempFile;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: playUri },
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
      setIsPlayingAudio(false);
    }
  };

  const handleRerecord = async () => {
    Alert.alert(
      'Re-record Voice Proof?',
      'Discard current recording and record a fresh voice proof?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record Fresh',
          style: 'destructive',
          onPress: async () => {
            try {
              if (soundRef.current) {
                await soundRef.current.stopAsync().catch(() => {});
                await soundRef.current.unloadAsync().catch(() => {});
                soundRef.current = null;
              }
              setIsPlayingAudio(false);
              setAudioUri(null);
              setRecordingDurationSecs(0);
              job.audioUrl = undefined;
              await audioRecordingService.discardRecording();
              await updateBookingAudio(job.jobId, '');
              await audioRecordingService.startBackgroundRecording(job.jobId);
            } catch (err) {
              console.warn('Reset audio error:', err);
            }
          },
        },
      ]
    );
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

  // ── Helper to ensure any evidence (photo or audio) is hosted in Firebase Storage as a compact URL ──
  const ensureCloudUrl = async (
    rawVal: string | null,
    type: 'before' | 'after' | 'audio',
    jobId: string
  ): Promise<{ url: string; storagePath?: string } | null> => {
    if (!rawVal) return null;
    // Already a remote cloud download URL
    if (rawVal.startsWith('http://') || rawVal.startsWith('https://')) {
      return { url: rawVal };
    }

    if (!storage) {
      console.warn('[ensureCloudUrl] Firebase storage instance not available');
      return null;
    }

    const isAudio = type === 'audio';
    const ext = isAudio ? 'm4a' : 'jpg';
    const contentType = isAudio ? 'audio/mp4' : 'image/jpeg';
    const storagePath = isAudio
      ? `audio_proofs/${jobId}_${Date.now()}.${ext}`
      : `proofs/${jobId}_${type}_${Date.now()}.${ext}`;
    const storageRef = ref(storage, storagePath);

    // If it's a Base64 Data URI from a legacy or offline state, migrate it to Firebase Storage immediately
    if (rawVal.startsWith('data:')) {
      try {
        const base64Content = rawVal.split(',')[1] || rawVal;
        await uploadString(storageRef, base64Content, 'base64', { contentType });
        const downloadUrl = await getDownloadURL(storageRef);
        console.log(`[ensureCloudUrl] Successfully migrated Base64 ${type} to Firebase Storage:`, downloadUrl);
        return { url: downloadUrl, storagePath };
      } catch (err) {
        console.warn(`[ensureCloudUrl] Failed to migrate Base64 ${type} to Storage:`, err);
        return null;
      }
    }

    // If it's a local file URI (file:///...), read and upload to Firebase Storage
    if (rawVal.startsWith('file://')) {
      try {
        const base64Content = await FileSystem.readAsStringAsync(rawVal, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await uploadString(storageRef, base64Content, 'base64', { contentType });
        const downloadUrl = await getDownloadURL(storageRef);
        console.log(`[ensureCloudUrl] Successfully uploaded local ${type} file to Firebase Storage:`, downloadUrl);
        return { url: downloadUrl, storagePath };
      } catch (err) {
        console.warn(`[ensureCloudUrl] Failed to upload local ${type} file to Storage:`, err);
        return null;
      }
    }

    return null;
  };

  // ── Finish & Complete Service ─────────────────────────────────────────────
  const handleConfirmComplete = async () => {
    if (isFinishing) return;

    const currentBefore = beforePhoto || job.beforePhoto || null;
    const currentAfter = afterPhoto || job.afterPhoto || null;
    const currentChecklistItems = job.checklist && job.checklist.length > 0
      ? job.checklist
      : getDynamicChecklist(job.serviceType, job.serviceName);

    if (!currentBefore) {
      Alert.alert('Missing Before Photo', 'Please capture the Before Work proof photo before finalizing.');
      return;
    }

    if (!currentAfter) {
      Alert.alert('Missing After Photo', 'Please capture the After Work proof photo before finalizing.');
      return;
    }

    if (job.checklistDone.length < currentChecklistItems.length) {
      Alert.alert(
        'Incomplete Checklist',
        `Please complete all ${currentChecklistItems.length} steps in the service checklist (${job.checklistDone.length}/${currentChecklistItems.length} completed).`
      );
      return;
    }

    const hasActiveAudio = isAudioRecording || audioRecordingService.isRecordingForJob(job.jobId);
    const existingAudio = audioUri || job.audioUrl;
    if (!hasActiveAudio && (!existingAudio || existingAudio.startsWith('file://')) && recordingDurationSecs === 0) {
      Alert.alert('Missing Voice Proof', 'Please record the voice recording proof before finalizing.');
      return;
    }

    setIsFinishing(true);
    try {
      let finalAudioUrl: string | null = (existingAudio && !existingAudio.startsWith('file://') && !existingAudio.startsWith('data:'))
        ? existingAudio
        : null;

      // If audio is actively recording or not yet uploaded, stop & upload to cloud now
      if (hasActiveAudio || !finalAudioUrl) {
        try {
          const uploadedUrl = await handleStopAudioRecording();
          if (uploadedUrl && !uploadedUrl.startsWith('file://') && !uploadedUrl.startsWith('data:')) {
            finalAudioUrl = uploadedUrl;
          }
        } catch (audioErr) {
          console.warn('Final audio capture error:', audioErr);
        }
      }

      // 1. Ensure all evidence pieces are uploaded to Firebase Storage (migrating any Base64/local files)
      const beforeUploaded = await ensureCloudUrl(currentBefore, 'before', job.jobId);
      const afterUploaded = await ensureCloudUrl(currentAfter, 'after', job.jobId);
      const audioUploaded = await ensureCloudUrl(finalAudioUrl || existingAudio || null, 'audio', job.jobId);

      // Verify that all required evidence is hosted in cloud storage
      if (!beforeUploaded?.url || !afterUploaded?.url || !audioUploaded?.url) {
        Alert.alert(
          'Unable to Finalize Service',
          'Unable to finalize the service because some evidence could not be saved. Your service has not been marked as completed. Please retry.'
        );
        setIsFinishing(false);
        return;
      }

      const cleanBefore = beforeUploaded.url;
      const cleanAfter = afterUploaded.url;
      const cleanAudio = audioUploaded.url;
      const audioStoragePath = audioUploaded.storagePath || `audio_proofs/${job.jobId}.m4a`;

      const audioMetadata = {
        storagePath: audioStoragePath,
        contentType: 'audio/mp4',
        uploadStatus: 'completed',
        recordedAt: new Date().toISOString(),
        bookingId: job.jobId,
        evidenceType: 'voice_proof',
      };

      store.completeJob(job.jobId);
      job.audioUrl = cleanAudio;
      job.beforePhoto = cleanBefore;
      job.afterPhoto = cleanAfter;

      // 2. Persist compact metadata to Firestore (under 2KB payload, guaranteed << 1MB limit)
      await updateDoc(doc(db, 'bookings', job.jobId), {
        status: 'service_ended',
        serviceEndedAt: serverTimestamp(),
        paymentStatus: 'paid',
        beforePhoto: cleanBefore,
        afterPhoto: cleanAfter,
        beforePhotoPath: beforeUploaded.storagePath || null,
        afterPhotoPath: afterUploaded.storagePath || null,
        audioUrl: cleanAudio,
        audioPath: audioStoragePath,
        audioMetadata,
        checklistDone: job.checklistDone,
        checklist: checklistItems,
      });

      // 3. Also trigger stats update in firestoreService
      await updateBookingStatus(job.jobId, 'service_ended', store.vendorId || undefined, job.vendorEarnings);

      setCompleteModalVisible(false);
      navigation.navigate('Complete', { jobId: job.jobId });
    } catch (err: any) {
      console.error('[handleConfirmComplete] Service finalization failed:', err?.message || err);
      Alert.alert(
        'Unable to Finalize Service',
        'Unable to finalize the service because some evidence could not be saved. Your service has not been marked as completed. Please retry.'
      );
    } finally {
      setIsFinishing(false);
    }
  };

  const checklistItems = job.checklist && job.checklist.length > 0
    ? job.checklist
    : getDynamicChecklist(job.serviceType, job.serviceName);

  const doneCount = job.checklistDone.length;
  const totalCount = checklistItems.length;

  const hasBefore = !!(beforePhoto || job.beforePhoto);
  const hasAfter = !!(afterPhoto || job.afterPhoto);
  const hasAudio = !!(audioUri || job.audioUrl || isAudioRecording || recordingDurationSecs > 0);
  const isChecklistDone = totalCount > 0 && doneCount >= totalCount;

  const proofsCompletedCount = (hasBefore ? 1 : 0) + (hasAfter ? 1 : 0) + (hasAudio ? 1 : 0) + (isChecklistDone ? 1 : 0);
  const isAllProofsReady = proofsCompletedCount === 4;

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

        {/* Automated Voice Recording Monitoring Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mic" size={18} color="#059669" />
            <Text style={styles.sectionTitle}>AUTOMATIC SERVICE AUDIO RECORDING</Text>
          </View>
          <Text style={styles.sectionSub}>
            Automated background audio monitoring for service quality &amp; customer security.
          </Text>

          <View style={styles.audioRecordBox}>
            {isAudioRecording ? (
              <View style={styles.recordingActiveWrap}>
                <View style={styles.recordingPulseDot} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                    Service Audio Monitoring Active
                  </Text>
                  <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 2 }}>
                    Recording in progress: {formatTime(recordingDurationSecs)} (Auto-stops on completion)
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.audioSavedWrap}>
                <View style={styles.audioSavedInfo}>
                  <Ionicons
                    name={audioUri ? "checkmark-circle" : "mic-circle"}
                    size={20}
                    color={audioUri ? "#10B981" : "#F59E0B"}
                  />
                  <Text style={styles.audioSavedText}>
                    {audioUri
                      ? "Audio proof recorded & securely attached to booking"
                      : "Voice recording standing by • Active during service"}
                  </Text>
                </View>
                {audioUri && (
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
                )}
              </View>
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
          <LinearGradient
            colors={isAllProofsReady ? ['#0D3325', '#164E3A'] : ['#475569', '#334155']}
            style={styles.completeBtnGrad}
          >
            <Ionicons
              name={isAllProofsReady ? "checkmark-done-circle" : "lock-closed"}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.completeBtnText}>
              {isAllProofsReady
                ? "Complete & Finalize Service"
                : `Complete & Finalize Service (${proofsCompletedCount}/4 Proofs Ready)`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation & Proof Verification Modal */}
      <Modal visible={completeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons
              name={isAllProofsReady ? "checkmark-circle" : "alert-circle"}
              size={54}
              color={isAllProofsReady ? "#10B981" : "#EF4444"}
            />
            <Text style={styles.confirmTitle}>
              {isAllProofsReady ? "Complete Service?" : "Mandatory Proofs Missing"}
            </Text>
            <Text style={styles.confirmSub}>
              {isAllProofsReady
                ? "All required verification photos, voice recording, and checklist steps are recorded. Ready to finalize service."
                : "Without recording all verification photos, voice proof, and completing all checklist steps, the service cannot be ended."}
            </Text>

            {/* Proofs Status Breakdown */}
            <View style={styles.proofsStatusBox}>
              <View style={styles.proofRow}>
                <Ionicons
                  name={hasBefore ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={hasBefore ? "#10B981" : "#EF4444"}
                />
                <Text style={styles.proofLabel}>1. Before Service Photo</Text>
                <Text style={[styles.proofBadge, hasBefore ? styles.proofBadgeDone : styles.proofBadgePending]}>
                  {hasBefore ? "Captured" : "Missing"}
                </Text>
              </View>

              <View style={styles.proofRow}>
                <Ionicons
                  name={hasAfter ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={hasAfter ? "#10B981" : "#EF4444"}
                />
                <Text style={styles.proofLabel}>2. After Service Photo</Text>
                <Text style={[styles.proofBadge, hasAfter ? styles.proofBadgeDone : styles.proofBadgePending]}>
                  {hasAfter ? "Captured" : "Missing"}
                </Text>
              </View>

              <View style={styles.proofRow}>
                <Ionicons
                  name={hasAudio ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={hasAudio ? "#10B981" : "#EF4444"}
                />
                <Text style={styles.proofLabel}>3. Voice Recording Proof</Text>
                <Text style={[styles.proofBadge, hasAudio ? styles.proofBadgeDone : styles.proofBadgePending]}>
                  {audioUri ? "Attached" : isAudioRecording ? "Recording" : recordingDurationSecs > 0 ? "Recorded" : "Missing"}
                </Text>
              </View>

              <View style={styles.proofRow}>
                <Ionicons
                  name={isChecklistDone ? "checkmark-circle" : "close-circle"}
                  size={18}
                  color={isChecklistDone ? "#10B981" : "#EF4444"}
                />
                <Text style={styles.proofLabel}>4. Service Checklist</Text>
                <Text style={[styles.proofBadge, isChecklistDone ? styles.proofBadgeDone : styles.proofBadgePending]}>
                  {doneCount}/{totalCount} Done
                </Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCompleteModalVisible(false)}
                disabled={isFinishing}
              >
                <Text style={styles.cancelBtnText}>{isAllProofsReady ? "Back" : "Go Back & Complete"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, !isAllProofsReady && styles.confirmBtnDisabled]}
                onPress={handleConfirmComplete}
                disabled={!isAllProofsReady || isFinishing}
              >
                {isFinishing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.confirmBtnText, !isAllProofsReady && styles.confirmBtnTextDisabled]}>
                    {isAllProofsReady ? "Yes, Complete" : "Requirements Pending"}
                  </Text>
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
  confirmBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  confirmBtnTextDisabled: {
    color: '#F1F5F9',
    fontSize: 12,
  },
  proofsStatusBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 4,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proofLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  proofBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  proofBadgeDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#059669',
  },
  proofBadgePending: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#DC2626',
  },
});
