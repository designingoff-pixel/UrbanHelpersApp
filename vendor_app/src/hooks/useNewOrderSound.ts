/**
 * useNewOrderSound — plays a loud alert siren & vibrates whenever a new
 * booking request arrives in the vendor store.
 *
 * Designed to shout loud and alert the vendor even when running in the background.
 */

import { useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { store } from '../store/AppStore';
import { triggerLoudNewOrderNotification } from '../services/notificationService';

// ─── High-intensity loud alert siren (alarm / dispatch siren) ─────────────
const LOUD_ALARM_SOUND_URI =
  'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3';

let activeSoundInstance: Audio.Sound | null = null;

export function stopLoudOrderAlert() {
  Vibration.cancel();
  if (activeSoundInstance) {
    activeSoundInstance.stopAsync().catch(() => {});
  }
}

export function useNewOrderSound() {
  const soundRef     = useRef<Audio.Sound | null>(null);
  const prevCountRef = useRef<number>(-1);

  // ── Load sound and configure maximum volume & audio mode ───────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: LOUD_ALARM_SOUND_URI },
          { shouldPlay: false, volume: 1.0, isLooping: false }
        );

        if (mounted) {
          soundRef.current = sound;
          activeSoundInstance = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (err) {
        console.warn('[useNewOrderSound] Could not load loud alert sound:', err);
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

  // ── Watch store for new incoming requests ──────────────────────────────────
  useEffect(() => {
    const playLoudAlert = async () => {
      try {
        // 1. Heavy urgent vibration pattern: 1s vibrate, 400ms pause, 1s vibrate...
        Vibration.vibrate([0, 1000, 400, 1000, 400, 1000, 400, 1000]);

        // 2. Play alert sound at max volume
        if (soundRef.current) {
          await soundRef.current.setVolumeAsync(1.0);
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
        }

        // 3. Post a loud heads-up local notification
        const latestJobs = store.getJobsForTab('requests');
        const latest = latestJobs[0];
        if (latest) {
          triggerLoudNewOrderNotification(
            latest.serviceName || 'New Service',
            `₹${latest.vendorEarnings || 600}`,
            latest.address || 'Nearby',
            latest.jobId
          );
        }
      } catch (err) {
        console.warn('[useNewOrderSound] Loud playback error:', err);
      }
    };

    const unsubscribe = store.subscribe(() => {
      const currentCount = store.getJobsForTab('requests').length;

      if (prevCountRef.current === -1) {
        prevCountRef.current = currentCount;
        return;
      }

      if (currentCount > prevCountRef.current) {
        // A new customer booking just placed! Shout loud!
        playLoudAlert();
      }

      prevCountRef.current = currentCount;
    });

    return unsubscribe;
  }, []);
}
