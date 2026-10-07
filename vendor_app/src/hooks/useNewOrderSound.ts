/**
 * useNewOrderSound — plays a distinctive alert sound whenever a new
 * NEW_REQUEST job appears in the store.
 *
 * Usage: call once inside HomeScreen (or App root).
 * The hook tracks the count of NEW_REQUEST jobs and fires the sound
 * whenever the count increases (i.e. a new order arrived).
 */

import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { store } from '../store/AppStore';

// ─── Free-to-use short "new order" chime (hosted on a public CDN) ────────────
// A crisp, professional 3-tone cash-register / notification ding.
// Replace with your own asset URI (e.g. require('../../assets/new_order.mp3'))
// once you add an audio file to the assets folder.
const NEW_ORDER_SOUND_URI =
  'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export function useNewOrderSound() {
  const soundRef      = useRef<Audio.Sound | null>(null);
  const prevCountRef  = useRef<number>(-1);   // -1 = not yet initialised

  // ── Load sound once on mount ───────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,   // plays even when iOS silent switch is ON
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: NEW_ORDER_SOUND_URI },
          { shouldPlay: false, volume: 1.0 }
        );

        if (mounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (err) {
        console.warn('[useNewOrderSound] Could not load sound:', err);
      }
    })();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  // ── Watch store for new NEW_REQUEST jobs ───────────────────────────────────
  useEffect(() => {
    const playSound = async () => {
      try {
        if (!soundRef.current) return;
        // Rewind to start in case it was already played
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } catch (err) {
        console.warn('[useNewOrderSound] Playback error:', err);
      }
    };

    const unsubscribe = store.subscribe(() => {
      const currentCount = store.getJobsForTab('requests').length;

      if (prevCountRef.current === -1) {
        // First snapshot — just record baseline, don't play
        prevCountRef.current = currentCount;
        return;
      }

      if (currentCount > prevCountRef.current) {
        // A new order just arrived!
        playSound();
      }

      prevCountRef.current = currentCount;
    });

    return unsubscribe;
  }, []);
}
