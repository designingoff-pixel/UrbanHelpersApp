import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PremiumBadgeProps {
  label?: string;
  size?: 'small' | 'medium';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ label = 'PRO', size = 'small' }) => {
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, isSmall ? styles.badgeSmall : styles.badgeMedium]}>
      <Ionicons name="lock-closed" size={isSmall ? 10 : 12} color="#ffffff" style={{ marginRight: 3 }} />
      <Text style={[styles.text, isSmall ? styles.textSmall : styles.textMedium]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  badgeMedium: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 9,
  },
  textMedium: {
    fontSize: 11,
  },
});
