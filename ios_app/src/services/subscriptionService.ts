import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'vip' | 'family_pro';

export type PremiumFeature =
  | 'live_geofence'
  | 'follow_me'
  | 'voice_sos'
  | 'fake_call'
  | 'low_battery_ping'
  | 'fall_detection'
  | 'med_missed_alert'
  | 'unlimited_medical_vault'
  | 'mindfulness_ebooks'
  | 'mindfulness_music'
  | 'stress_ai'
  | 'service_vip_discount'
  | 'shop_points_2x'
  | 'doctor_priority';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt: string | null;
  planName: string;
}

const STORAGE_KEY = '@urban_subscription_state_v1';
type Listener = (info: SubscriptionInfo) => void;
const listeners: Listener[] = [];

let currentSubscription: SubscriptionInfo = {
  tier: 'free',
  isActive: false,
  expiresAt: null,
  planName: 'Free Starter',
};

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn(currentSubscription);
    } catch (e) {
      console.warn('[Subscription] Listener error:', e);
    }
  });
};

// Initialize from storage
export const initSubscriptionService = async (): Promise<SubscriptionInfo> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      currentSubscription = JSON.parse(raw);
    }
  } catch (e) {
    console.log('[Subscription] Error reading storage:', e);
  }
  return currentSubscription;
};

export const getSubscriptionInfo = (): SubscriptionInfo => {
  return currentSubscription;
};

export const isFeatureLocked = (feature: PremiumFeature): boolean => {
  if (currentSubscription.isActive && currentSubscription.tier !== 'free') {
    return false; // Unlocked
  }
  return true; // Locked
};

export const activateSubscription = async (tier: 'vip' | 'family_pro', planName: string): Promise<SubscriptionInfo> => {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1-year pass

  currentSubscription = {
    tier,
    isActive: true,
    expiresAt: expiryDate.toISOString(),
    planName,
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSubscription));
  } catch (e) {
    console.error('[Subscription] Failed saving state:', e);
  }

  notifyListeners();
  return currentSubscription;
};

export const cancelSubscription = async (): Promise<SubscriptionInfo> => {
  currentSubscription = {
    tier: 'free',
    isActive: false,
    expiresAt: null,
    planName: 'Free Starter',
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSubscription));
  } catch (e) {
    console.error('[Subscription] Failed saving state:', e);
  }

  notifyListeners();
  return currentSubscription;
};

export const onSubscriptionChange = (callback: Listener) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};
