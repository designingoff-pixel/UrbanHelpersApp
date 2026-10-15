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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { updateBookingAudio } from './firestoreService';
import { store } from '../store/AppStore';

const ASYNC_KEY_RECORDING = '@urban_captain_recording_session';

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

      // Critical: Set audio mode to stay active in the background
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Stop any existing dangling recording
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (_) {}
        this.recording = null;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );

      this.recording = recording;
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
        return null;
      }

      // Upload audio to Firebase Storage
      let finalAudioUrl = localUri;
      try {
        const storagePath = `audio_proofs/${jobId}_${Date.now()}.m4a`;
        const audioRef = ref(storage, storagePath);
        const response = await fetch(localUri);
        const blob = await response.blob();
        await uploadBytes(audioRef, blob, { contentType: 'audio/m4a' });
        finalAudioUrl = await getDownloadURL(audioRef);
      } catch (uploadErr) {
        console.warn('[AudioRecordingService] Firebase Storage upload error, saving local URI:', uploadErr);
        finalAudioUrl = localUri;
      }

      // Save to Firestore
      if (finalAudioUrl) {
        await updateBookingAudio(jobId, finalAudioUrl).catch((err) =>
          console.warn('[AudioRecordingService] Firestore updateBookingAudio error:', err)
        );
      }

      return finalAudioUrl;
    } catch (err) {
      console.warn('[AudioRecordingService] stopAndSaveRecording error:', err);
      return localUri;
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
