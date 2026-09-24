import { useState, useEffect } from 'react';
import {
  getSubscriptionInfo,
  initSubscriptionService,
  onSubscriptionChange,
  isFeatureLocked,
  activateSubscription,
  cancelSubscription,
  SubscriptionInfo,
  PremiumFeature,
} from '../services/subscriptionService';

export const useSubscription = () => {
  const [subInfo, setSubInfo] = useState<SubscriptionInfo>(getSubscriptionInfo());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTriggerFeature, setModalTriggerFeature] = useState<string | null>(null);

  useEffect(() => {
    initSubscriptionService().then((info) => setSubInfo(info));
    const unsubscribe = onSubscriptionChange((info) => {
      setSubInfo(info);
    });
    return unsubscribe;
  }, []);

  const checkAndGate = (feature: PremiumFeature, featureTitle?: string): boolean => {
    const locked = isFeatureLocked(feature);
    if (locked) {
      setModalTriggerFeature(featureTitle || 'This premium feature');
      setIsModalVisible(true);
      return false; // Prevent action
    }
    return true; // Allowed
  };

  const openUpgradeModal = (featureTitle?: string) => {
    setModalTriggerFeature(featureTitle || 'Urban VIP Membership');
    setIsModalVisible(true);
  };

  const closeUpgradeModal = () => {
    setIsModalVisible(false);
  };

  const subscribeToVip = async () => {
    const res = await activateSubscription('vip', 'Urban Care & Safety VIP');
    setIsModalVisible(false);
    return res;
  };

  return {
    subInfo,
    isVip: subInfo.isActive && subInfo.tier !== 'free',
    isFeatureLocked,
    checkAndGate,
    openUpgradeModal,
    closeUpgradeModal,
    isModalVisible,
    modalTriggerFeature,
    subscribeToVip,
    cancelSubscription,
  };
};
