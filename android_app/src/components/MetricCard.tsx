import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress?: () => void;
}

export default function MetricCard({ title, value, unit, icon, color, onPress }: MetricCardProps) {
  return (
    <Pressable 
      style={s.card} 
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
    >
      <View style={s.header}>
        <View style={[s.iconWrap, { backgroundColor: color + '15' }]}>
          <MaterialIcons name={icon} size={20} color={color} />
        </View>
        <Text style={s.title}>{title}</Text>
      </View>
      <View style={s.body}>
        <Text style={s.value}>{value}</Text>
        {unit && <Text style={s.unit}>{unit}</Text>}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    // flat elevation (0-2dp shadow)
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D3D3D',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 4,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8C8C8C',
  },
});
