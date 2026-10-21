/**
 * useNewOrderSound — plays the exact melodic notification chime from the admin page
 * when a new booking is assigned to the vendor or when an order is cancelled.
 *
 * Features:
 * - Direct on-demand sound creation (no stale audio instances)
 * - Identical chime as used on the Urban Helpers admin web dashboard
 * - Plays sound when a new job arrives
 * - Plays sound when an order is cancelled
 * - Persists notified IDs so duplicate alerts are suppressed
 */

import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/AppStore';
import { triggerLoudNewOrderNotification } from '../services/notificationService';

// ─── Custom notification sound asset ─────────────────────────────────────────
const NOTIFICATION_SOUND_ASSET = require('../../assets/sounds/notification_sound.mp3');

const NOTIFIED_STORAGE_KEY = '@urban_helpers_notified_job_ids';
const CANCELLED_STORAGE_KEY = '@urban_helpers_notified_cancelled_ids';

let lastPlayedSound: Audio.Sound | null = null;

export function stopLoudOrderAlert() {
  Vibration.cancel();
  if (lastPlayedSound) {
    lastPlayedSound.stopAsync().catch(() => {});
  }
}

/**
 * Plays the platform notification sound on demand for new order or cancellation
 */
export async function playOrderChimeSound(type: 'new_order' | 'cancelled' = 'new_order') {
  try {
    // Distinct haptic vibration pattern
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
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const notifiedCancelledIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    let active = true;

    // Load persisted notified IDs from AsyncStorage
    Promise.all([
      AsyncStorage.getItem(NOTIFIED_STORAGE_KEY),
      AsyncStorage.getItem(CANCELLED_STORAGE_KEY),
    ])
      .then(([storedNew, storedCancelled]) => {
        if (!active) return;
        if (storedNew) {
          try {
            const arr = JSON.parse(storedNew);
            if (Array.isArray(arr)) arr.forEach((id: string) => notifiedIdsRef.current.add(id));
          } catch (_) {}
        }
        if (storedCancelled) {
          try {
            const arr = JSON.parse(storedCancelled);
            if (Array.isArray(arr)) arr.forEach((id: string) => notifiedCancelledIdsRef.current.add(id));
          } catch (_) {}
        }

        // Seed initial known jobs so app startup doesn't blare sounds
        const initialJobs = store.getJobsForTab('requests');
        initialJobs.forEach((j) => notifiedIdsRef.current.add(j.jobId));
        isInitializedRef.current = true;
      })
      .catch(() => {
        if (!active) return;
        const initialJobs = store.getJobsForTab('requests');
        initialJobs.forEach((j) => notifiedIdsRef.current.add(j.jobId));
        isInitializedRef.current = true;
      });

    const persistNotifiedIds = async () => {
      try {
        const arr = Array.from(notifiedIdsRef.current).slice(-200);
        await AsyncStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(arr));
        const arrC = Array.from(notifiedCancelledIdsRef.current).slice(-200);
        await AsyncStorage.setItem(CANCELLED_STORAGE_KEY, JSON.stringify(arrC));
      } catch (_) {}
    };

    const unsubscribe = store.subscribe(() => {
      try {
        if (!isInitializedRef.current) {
          const currentRequests = store.getJobsForTab('requests') || [];
          currentRequests.forEach((j) => notifiedIdsRef.current.add(j.jobId));
          return;
        }

        // 1. Check for incoming new order requests
        const currentRequests = store.getJobsForTab('requests') || [];
        let playedAny = false;

        for (const job of currentRequests) {
          if (!notifiedIdsRef.current.has(job.jobId)) {
            notifiedIdsRef.current.add(job.jobId);
            persistNotifiedIds();

            if (!playedAny) {
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

        // 2. Check for newly cancelled jobs
        const allJobs = store.jobs || [];
        for (const job of allJobs) {
          if (job.status === 'CANCELLED' && !notifiedCancelledIdsRef.current.has(job.jobId)) {
            notifiedCancelledIdsRef.current.add(job.jobId);
            persistNotifiedIds();
            playOrderChimeSound('cancelled');
          }
        }
      } catch (listenerErr) {
        console.warn('[useNewOrderSound] Listener error safely caught:', listenerErr);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
}
