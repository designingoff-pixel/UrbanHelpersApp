import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activateSubscription, SubscriptionTier } from '../services/subscriptionService';

const { width } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string | null;
  onSuccess?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  featureName,
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  const perks = [
    { icon: 'navigate-circle', title: 'Live Geo-Fencing & Follow Me', desc: 'Real-time route tracking and perimeter safety alerts' },
    { icon: 'shield-checkmark', title: 'Caregiver & Fall Alerts', desc: 'Instant SOS notifications if medicine is missed or fall detected' },
    { icon: 'folder-open', title: 'Unlimited Medical Cloud Vault', desc: 'Store & 1-tap share prescriptions, lab reports, vaccine cards' },
    { icon: 'headset', title: 'Mindfulness E-Books & Music', desc: 'Full access to wellness library, sleep stories & audio therapy' },
    { icon: 'pricetag', title: '15% VIP Service Discounts', desc: 'Exclusive flat discount on all home & appliance services' },
    { icon: 'sparkles', title: '2x Points Rewards in Shop', desc: 'Double reward coins on every purchase to redeem products' },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await activateSubscription('vip', selectedPlan === 'yearly' ? 'Urban VIP Annual' : 'Urban VIP Monthly');
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.badgeWrap}>
              <Ionicons name="sparkles" size={14} color="#F59E0B" />
              <Text style={styles.badgeText}>URBAN PRO & VIP</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Unlock All Advanced Features</Text>
            {featureName ? (
              <View style={styles.gatedNotice}>
                <Ionicons name="lock-closed" size={15} color="#8B5CF6" />
                <Text style={styles.gatedNoticeText}>
                  <Text style={{ fontWeight: '700' }}>{featureName}</Text> requires an active Urban Pro subscription.
                </Text>
              </View>
            ) : (
              <Text style={styles.subtitle}>Get total peace of mind with 24/7 safety, health monitoring, and member privileges.</Text>
            )}

            {/* Perks List */}
            <View style={styles.perksList}>
              {perks.map((p, idx) => (
                <View key={idx} style={styles.perkRow}>
                  <View style={styles.perkIconWrap}>
                    <Ionicons name={p.icon as any} size={18} color="#4F46E5" />
                  </View>
                  <View style={styles.perkTextWrap}>
                    <Text style={styles.perkTitle}>{p.title}</Text>
                    <Text style={styles.perkDesc}>{p.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Plan Selector */}
            <Text style={styles.planSelectHeader}>Choose Your Plan</Text>
            <View style={styles.plansContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
                onPress={() => setSelectedPlan('yearly')}
              >
                {selectedPlan === 'yearly' && (
                  <View style={styles.saveTag}>
                    <Text style={styles.saveTagText}>SAVE 40%</Text>
                  </View>
                )}
                <Text style={styles.planDuration}>Annual VIP Pass</Text>
                <Text style={styles.planPrice}>₹1,499<Text style={styles.planPeriod}> / year</Text></Text>
                <Text style={styles.planEquivalent}>Just ₹125 / month • Billed annually</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <Text style={styles.planDuration}>Monthly Plan</Text>
                <Text style={styles.planPrice}>₹199<Text style={styles.planPeriod}> / month</Text></Text>
                <Text style={styles.planEquivalent}>Cancel anytime with 1 tap</Text>
              </TouchableOpacity>
            </View>

            {/* Guarantee notice */}
            <View style={styles.guaranteeRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.guaranteeText}>7-day free trial included • No questions asked cancellation</Text>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.btnInner}>
                  <Ionicons name="sparkles" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnText}>Start 7-Day Free Trial & Unlock</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  gatedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  gatedNoticeText: {
    fontSize: 13,
    color: '#4C1D95',
    marginLeft: 8,
    flex: 1,
  },
  perksList: {
    marginBottom: 16,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  perkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  perkTextWrap: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  perkDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  planSelectHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 10,
  },
  plansContainer: {
    gap: 10,
    marginBottom: 14,
  },
  planCard: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  planCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#F5F3FF',
  },
  saveTag: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 2,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  planEquivalent: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#059669',
    marginLeft: 6,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  subscribeBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
