/**
 * useNewOrderSound — plays the notification chime ONCE when a new booking arrives in real-time.
 * 
 * Features:
 * - Module-level singleton cache of notified IDs so it survives screen transitions & unmounts.
 * - Persistent storage in AsyncStorage.
 * - On app launch / open, seeds all existing jobs as already seen/notified (NEVER plays on open).
 * - Only plays sound ONCE when a new assignment/broadcast arrives live while app is active.
 * - When app is closed/off, Admin Web sends Expo Push Notification to vendor's pushToken.
 */

import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/AppStore';
import { triggerLoudNewOrderNotification } from '../services/notificationService';

const NOTIFICATION_SOUND_ASSET = require('../../assets/sounds/notification_sound.mp3');

const NOTIFIED_STORAGE_KEY = '@urban_helpers_notified_job_ids_v2';
const CANCELLED_STORAGE_KEY = '@urban_helpers_notified_cancelled_ids_v2';

// Module-level persistent cache across all hook invocations
const globalNotifiedIds = new Set<string>();
const globalCancelledIds = new Set<string>();
const appLaunchTimestamp = Date.now();
let lastPlayedSound: Audio.Sound | null = null;

// Pre-load stored IDs into memory
AsyncStorage.getItem(NOTIFIED_STORAGE_KEY).then((raw) => {
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach((id: string) => globalNotifiedIds.add(id));
    } catch (_) {}
  }
}).catch(() => {});

AsyncStorage.getItem(CANCELLED_STORAGE_KEY).then((raw) => {
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach((id: string) => globalCancelledIds.add(id));
    } catch (_) {}
  }
}).catch(() => {});

export function stopLoudOrderAlert() {
  Vibration.cancel();
  if (lastPlayedSound) {
    lastPlayedSound.stopAsync().catch(() => {});
  }
}

export async function playOrderChimeSound(type: 'new_order' | 'cancelled' = 'new_order') {
  try {
    Vibration.vibrate(type === 'cancelled' ? [0, 300, 150, 300] : [0, 200, 100, 200]);

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      NOTIFICATION_SOUND_ASSET,
      { shouldPlay: true, volume: 1.0, isLooping: false }
    );

    lastPlayedSound = sound;

    sound.setOnPlaybackStatusUpdate((st) => {
      if (st.isLoaded && st.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (lastPlayedSound === sound) lastPlayedSound = null;
      }
    });
  } catch (err) {
    console.warn('[playOrderChimeSound] error:', err);
  }
}

export function useNewOrderSound() {
  const initialSyncDoneRef = useRef(false);

  useEffect(() => {
    let active = true;

    const persistNotifiedIds = async () => {
      try {
        const arr = Array.from(globalNotifiedIds).slice(-200);
        await AsyncStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(arr));
        const arrC = Array.from(globalCancelledIds).slice(-200);
        await AsyncStorage.setItem(CANCELLED_STORAGE_KEY, JSON.stringify(arrC));
      } catch (_) {}
    };

    const unsubscribe = store.subscribe(() => {
      try {
        const allJobs = store.jobs || [];
        const currentRequests = store.getJobsForTab('requests') || [];

        // ON FIRST RUN: Seed ALL existing jobs into globalNotifiedIds so opening the app NEVER plays sound!
        if (!initialSyncDoneRef.current) {
          allJobs.forEach((j) => globalNotifiedIds.add(j.jobId));
          currentRequests.forEach((j) => globalNotifiedIds.add(j.jobId));
          initialSyncDoneRef.current = true;
          persistNotifiedIds();
          return;
        }

        // Live check: only trigger sound for genuinely NEW requests arriving while app is active
        let playedAny = false;
        for (const job of currentRequests) {
          if (!globalNotifiedIds.has(job.jobId)) {
            globalNotifiedIds.add(job.jobId);
            persistNotifiedIds();

            // Guard against stale jobs: if assigned > 3 minutes ago, it's not a real-time event
            const jobTime = job.createdAt || 0;
            const isFresh = (Date.now() - jobTime) < 180000 || jobTime > appLaunchTimestamp;

            if (!playedAny && isFresh) {
              playedAny = true;
              playOrderChimeSound('new_order');
              triggerLoudNewOrderNotification(
                job.serviceName || 'New Service Assignment',
                `₹${job.vendorEarnings || 600}`,
                job.address || 'Nearby',
                job.jobId
              );
            }
          }
        }

        // Newly cancelled jobs
        for (const job of allJobs) {
          if (job.status === 'CANCELLED' && !globalCancelledIds.has(job.jobId)) {
            globalCancelledIds.add(job.jobId);
            persistNotifiedIds();
            playOrderChimeSound('cancelled');
          }
        }
      } catch (err) {
        console.warn('[useNewOrderSound] listener error:', err);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
}
