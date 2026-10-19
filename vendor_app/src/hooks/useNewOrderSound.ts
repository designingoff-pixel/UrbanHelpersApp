/**
 * useNewOrderSound — plays a pleasant notification chime & vibrates
 * ONCE when a new booking is assigned to the vendor.
 *
 * Prevents replaying sounds on app startup or for old bookings:
 * - Persists notified booking IDs in AsyncStorage so each booking only chimes ONCE.
 * - Suppresses sound during initial load of existing bookings on app open.
 * - Pleasant, professional dispatch alert chime (comfortable volume, no harsh sirens).
 */

import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/AppStore';
import { triggerLoudNewOrderNotification } from '../services/notificationService';

// ─── Pleasant, modern notification chime (crisp dispatch chime) ────────────
const PLEASANT_CHIME_URI =
  'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3';

const NOTIFIED_STORAGE_KEY = '@urban_helpers_notified_job_ids';

let activeSoundInstance: Audio.Sound | null = null;

export function stopLoudOrderAlert() {
  Vibration.cancel();
  if (activeSoundInstance) {
    activeSoundInstance.stopAsync().catch(() => {});
  }
}

export function useNewOrderSound() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);

  // ── 1. Load sound and configure pleasant audio mode ────────────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: PLEASANT_CHIME_URI },
          { shouldPlay: false, volume: 0.7, isLooping: false }
        );

        if (mounted) {
          soundRef.current = sound;
          activeSoundInstance = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (err) {
        console.warn('[useNewOrderSound] Could not load alert sound:', err);
      }
    })();

    return () => {
      mounted = false;
      Vibration.cancel();
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      if (activeSoundInstance === soundRef.current) {
        activeSoundInstance = null;
      }
    };
  }, []);

  // ── 2. Load previously notified IDs from storage & listen for new jobs ────
  useEffect(() => {
    let active = true;

    // Load persisted notified IDs from AsyncStorage
    AsyncStorage.getItem(NOTIFIED_STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          try {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) {
              arr.forEach((id: string) => notifiedIdsRef.current.add(id));
            }
          } catch (_) {}
        }
        // Mark all existing jobs currently in the store as already known
        // so opening the app NEVER plays sounds for old or already-loaded orders!
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

    const playChimeAlert = async (job: any) => {
      try {
        // 1. Gentle, distinct double-haptic vibration
        Vibration.vibrate([0, 200, 100, 200]);

        // 2. Play pleasant chime sound at comfortable 0.7 volume
        if (soundRef.current) {
          await soundRef.current.setVolumeAsync(0.7);
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
        }

        // 3. Post notification
        triggerLoudNewOrderNotification(
          job.serviceName || 'New Service',
          `₹${job.vendorEarnings || 600}`,
          job.address || 'Nearby',
          job.jobId
        );
      } catch (err) {
        console.warn('[useNewOrderSound] Playback error:', err);
      }
    };

    const persistNotifiedIds = async () => {
      try {
        const arr = Array.from(notifiedIdsRef.current).slice(-200); // keep last 200 IDs
        await AsyncStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(arr));
      } catch (_) {}
    };

    const unsubscribe = store.subscribe(() => {
      // If we haven't finished loading the persisted notified IDs yet, seed them and return
      if (!isInitializedRef.current) {
        const currentRequests = store.getJobsForTab('requests');
        currentRequests.forEach((j) => notifiedIdsRef.current.add(j.jobId));
        return;
      }

      const currentRequests = store.getJobsForTab('requests');
      let playedAny = false;

      // Find any incoming request that has NEVER been notified to the vendor
      for (const job of currentRequests) {
        if (!notifiedIdsRef.current.has(job.jobId)) {
          // This is a brand new assignment!
          notifiedIdsRef.current.add(job.jobId);
          persistNotifiedIds();

          if (!playedAny) {
            playedAny = true;
            playChimeAlert(job);
          }
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
}
