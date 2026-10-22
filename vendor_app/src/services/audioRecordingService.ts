/**
 * audioRecordingService.ts
 * Reliable background audio recording service for Urban Captain.
 * 
 * Features:
 * - Persistent module-level Audio.Recording instance that survives React screen unmounts
 * - Background audio recording mode (staysActiveInBackground: true)
 * - Session persistence via AsyncStorage
 * - Automatic AppState handling (continues recording when app is backgrounded or screen locks)
 * - Firebase Storage upload with clean fallback
 */

import { Audio } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { storage, auth } from './firebase';
import { updateBookingAudio } from './firestoreService';
import { store } from '../store/AppStore';

const ASYNC_KEY_RECORDING = '@urban_captain_recording_session';

const OPTIMIZED_AUDIO_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 24000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.IOSAudioQuality.LOW,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 24000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 24000,
  },
};

export interface RecordingSession {
  jobId: string;
  startTime: number;
  uri?: string;
}

type RecordingListener = (state: {
  isRecording: boolean;
  jobId: string | null;
  durationSecs: number;
}) => void;

class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private activeJobId: string | null = null;
  private startTime: number = 0;
  private timer: NodeJS.Timeout | null = null;
  private listeners: Set<RecordingListener> = new Set();
  private appStateSubscription: any = null;

  constructor() {
    this.initAppStateListener();
    this.restoreSessionIfExists();
  }

  private initAppStateListener() {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active' && this.recording && this.startTime > 0) {
          // Immediately notify listeners with the true elapsed time
          this.notify();
        }
      }
    );
  }

  private async restoreSessionIfExists() {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_KEY_RECORDING);
      if (raw) {
        const session: RecordingSession = JSON.parse(raw);
        if (session?.jobId && session?.startTime) {
          // Check if this job is still in an active service state in store
          const job = store.getJob(session.jobId);
          if (job && (job.status === 'SERVICE_STARTED' || job.status === 'RECORDING_ACTIVE')) {
            this.activeJobId = session.jobId;
            this.startTime = session.startTime;
            this.startDurationTimer();
            this.notify();
          } else {
            // Service already finished or cancelled, clear stale session
            await AsyncStorage.removeItem(ASYNC_KEY_RECORDING);
          }
        }
      }
    } catch (e) {
      console.warn('[AudioRecordingService] Session restore error:', e);
    }
  }

  subscribe(listener: RecordingListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (_) {}
    });
  }

  getState() {
    return {
      isRecording: !!this.recording || (!!this.activeJobId && this.startTime > 0),
      jobId: this.activeJobId,
      durationSecs: this.getDurationSecs(),
    };
  }

  getDurationSecs(): number {
    if (!this.startTime) return 0;
    return Math.max(0, Math.floor((Date.now() - this.startTime) / 1000));
  }

  isRecordingForJob(jobId: string): boolean {
    return this.activeJobId === jobId && (!!this.recording || this.startTime > 0);
  }

  getIsRecording(): boolean {
    return !!this.recording;
  }

  getActiveJobId(): string | null {
    return this.activeJobId;
  }

  private startDurationTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.notify();
    }, 1000);
  }

  private stopDurationTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Start recording with background audio mode enabled.
   * If already recording for this job, returns true without restarting.
   */
  async startBackgroundRecording(jobId: string): Promise<boolean> {
    try {
      if (this.recording && this.activeJobId === jobId) {
        return true;
      }

      // Request microphone permissions
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        console.warn('[AudioRecordingService] Microphone permission not granted');
        return false;
      }

      // Set audio mode with safe try/catch for Android compatibility
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (modeErr) {
        console.warn('[AudioRecordingService] Audio mode setup warning:', modeErr);
      }

      // Stop any existing dangling recording
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (_) {}
        this.recording = null;
      }

      let recordingObj: Audio.Recording | null = null;
      try {
        const { recording } = await Audio.Recording.createAsync(
          OPTIMIZED_AUDIO_OPTIONS
        );
        recordingObj = recording;
      } catch (optErr) {
        console.warn('[AudioRecordingService] OPTIMIZED_AUDIO_OPTIONS failed, falling back to LOW_QUALITY:', optErr);
        try {
          const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.LOW_QUALITY
          );
          recordingObj = recording;
        } catch (lowErr) {
          console.warn('[AudioRecordingService] LOW_QUALITY failed, falling back to HIGH_QUALITY:', lowErr);
          const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          recordingObj = recording;
        }
      }

      this.recording = recordingObj;
      this.activeJobId = jobId;
      this.startTime = Date.now();

      // Persist session so app restart knows recording was active
      await AsyncStorage.setItem(
        ASYNC_KEY_RECORDING,
        JSON.stringify({ jobId, startTime: this.startTime })
      );

      this.startDurationTimer();
      this.notify();
      return true;
    } catch (err) {
      console.warn('[AudioRecordingService] startRecording error:', err);
      return false;
    }
  }

  /**
   * Stop recording, upload audio proof, and update booking record.
   */
  async stopAndSaveRecording(jobId: string): Promise<string | null> {
    this.stopDurationTimer();
    let localUri: string | null = null;

    try {
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
          localUri = this.recording.getURI();
        } catch (e) {
          console.warn('[AudioRecordingService] stopAndUnloadAsync error:', e);
        }
        this.recording = null;
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      }).catch(() => {});

      // Clear persisted session
      await AsyncStorage.removeItem(ASYNC_KEY_RECORDING).catch(() => {});
      this.activeJobId = null;
      this.startTime = 0;
      this.notify();

      if (!localUri) {
        console.warn('[AudioRecordingService] No local audio URI found after stopping recording.');
        return null;
      }

      // Verify recorded file exists on device
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
        console.warn('[AudioRecordingService] Local recording file not found:', localUri);
        return null;
      }

      // Read file as Base64 for reliable React Native transfer
      let base64Str: string | null = null;
      try {
        base64Str = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (readErr) {
        console.warn('[AudioRecordingService] FileSystem base64 read error:', readErr);
      }

      let finalAudioUrl: string | null = null;
      let storagePath: string | null = null;
      const recordedTimestamp = Date.now();

      // 1. Upload audio directly to Firebase Storage via uploadString (direct Base64 transfer)
      if (storage && base64Str) {
        storagePath = `audio_proofs/${jobId}_${recordedTimestamp}.m4a`;
        const audioRef = ref(storage, storagePath);
        try {
          if (auth && !auth.currentUser) {
            await signInAnonymously(auth).catch(() => {});
          }
          await uploadString(audioRef, base64Str, 'base64', { contentType: 'audio/mp4' });
          finalAudioUrl = await getDownloadURL(audioRef);
          console.log('[AudioRecordingService] Firebase Storage upload successful:', finalAudioUrl);
        } catch (uploadStringErr) {
          console.warn('[AudioRecordingService] uploadString error, attempting uploadBytes fallback:', uploadStringErr);
          try {
            if (auth && !auth.currentUser) {
              await signInAnonymously(auth).catch(() => {});
            }
            const response = await fetch(localUri);
            const blob = await response.blob();
            await uploadBytes(audioRef, blob, { contentType: 'audio/mp4' });
            finalAudioUrl = await getDownloadURL(audioRef);
            console.log('[AudioRecordingService] uploadBytes fallback successful:', finalAudioUrl);
          } catch (uploadBytesErr) {
            console.warn('[AudioRecordingService] uploadBytes fallback error:', uploadBytesErr);
          }
        }
      }

      // 2. Persist compact cloud reference and metadata to Firestore (NEVER full Base64 binary payload)
      if (finalAudioUrl && !finalAudioUrl.startsWith('file://') && !finalAudioUrl.startsWith('data:')) {
        const audioMetadata = {
          storagePath: storagePath || '',
          fileName: `${jobId}_${recordedTimestamp}.m4a`,
          contentType: 'audio/mp4',
          sizeBytes: fileInfo.size || (base64Str ? Math.round(base64Str.length * 0.75) : 0),
          recordedAt: new Date(recordedTimestamp).toISOString(),
          uploadStatus: 'completed',
          bookingId: jobId,
          evidenceType: 'voice_proof',
        };

        await updateBookingAudio(jobId, finalAudioUrl, {
          storagePath: storagePath || undefined,
          audioMetadata,
        });

        const job = store.getJob(jobId);
        if (job) {
          job.audioUrl = finalAudioUrl;
        }
        return finalAudioUrl;
      }

      // Resilient fallback: Provide portable Base64 Data URI so Admin Web can stream immediately
      if (localUri) {
        let resolvedUri = localUri;
        if (base64Str && base64Str.length < 900000) {
          resolvedUri = `data:audio/mp4;base64,${base64Str}`;
        }
        console.log('[AudioRecordingService] Audio proof saved (local/data URI):', resolvedUri.slice(0, 40));

        const job = store.getJob(jobId);
        if (job) {
          job.audioUrl = resolvedUri;
        }

        const audioMetadata = {
          storagePath: `audio_proofs/${jobId}_${recordedTimestamp}.m4a`,
          fileName: `${jobId}_${recordedTimestamp}.m4a`,
          contentType: 'audio/mp4',
          sizeBytes: fileInfo.size || (base64Str ? Math.round(base64Str.length * 0.75) : 0),
          recordedAt: new Date(recordedTimestamp).toISOString(),
          uploadStatus: resolvedUri.startsWith('data:') ? 'completed' : 'pending_upload',
          bookingId: jobId,
          evidenceType: 'voice_proof',
        };

        await updateBookingAudio(jobId, resolvedUri, {
          storagePath: `audio_proofs/${jobId}_${recordedTimestamp}.m4a`,
          audioMetadata,
        }).catch((e) => console.warn('[AudioRecordingService] updateBookingAudio warning:', e));

        return resolvedUri;
      }

      console.warn('[AudioRecordingService] Audio could not be saved.');
      return null;
    } catch (err) {
      console.warn('[AudioRecordingService] stopAndSaveRecording error:', err);
      return null;
    }
  }

  /**
   * Upload an existing local recording URI to cloud / base64 Data URI manually if automatic upload failed
   */
  async uploadLocalAudioFile(jobId: string, localUri: string): Promise<string | null> {
    try {
      if (!localUri) return null;
      let targetUri = localUri;
      if (targetUri.startsWith('file://')) {
        // Read file as Base64
        const base64Str = await FileSystem.readAsStringAsync(targetUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (base64Str && base64Str.length < 900000) {
          const dataUri = `data:audio/mp4;base64,${base64Str}`;
          await updateBookingAudio(jobId, dataUri, {
            storagePath: `audio_proofs/${jobId}_manual.m4a`,
            audioMetadata: {
              uploadStatus: 'completed',
              uploadedAt: new Date().toISOString(),
              evidenceType: 'voice_proof',
            },
          });
          const job = store.getJob(jobId);
          if (job) job.audioUrl = dataUri;
          return dataUri;
        }
      }
      return targetUri;
    } catch (e) {
      console.warn('[AudioRecordingService] uploadLocalAudioFile error:', e);
      throw e;
    }
  }

  /**
   * Cancel/discard recording without saving.
   */
  async discardRecording(): Promise<void> {
    this.stopDurationTimer();
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (_) {}
      this.recording = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});
    await AsyncStorage.removeItem(ASYNC_KEY_RECORDING).catch(() => {});
    this.activeJobId = null;
    this.startTime = 0;
    this.notify();
  }
}

export const audioRecordingService = new AudioRecordingService();
