import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface DetailMetricCardProps {
  title: string;
  value: string;
  unit?: string;
  trendValue: string; // e.g., "5%"
  trendDirection: 'up' | 'down' | 'neutral';
  color: string;
  onCompare?: () => void;
}

export default function DetailMetricCard({
  title,
  value,
  unit,
  trendValue,
  trendDirection,
  color,
  onCompare
}: DetailMetricCardProps) {
  
  const trendColor = trendDirection === 'up' ? '#E53935' : (trendDirection === 'down' ? '#43A047' : '#8C8C8C');
  const trendIcon = trendDirection === 'up' ? 'arrow-upward' : (trendDirection === 'down' ? 'arrow-downward' : 'remove');

  return (
    <View style={s.card}>
      {/* Title & Graph Placeholder */}
      <View style={s.headerRow}>
        <Text style={s.title}>{title}</Text>
      </View>
      
      <View style={[s.graphPlaceholder, { backgroundColor: color + '10' }]}>
        {/* Placeholder for actual chart (e.g., victory-native or react-native-svg) */}
        <MaterialIcons name="show-chart" size={48} color={color + '40'} />
      </View>

      {/* Main Metric Value */}
      <View style={s.valueRow}>
        <Text style={s.value}>{value}</Text>
        {unit && <Text style={s.unit}>{unit}</Text>}
      </View>

      {/* Trend & Action Row */}
      <View style={s.footerRow}>
        <View style={s.trendBox}>
          <MaterialIcons name={trendIcon} size={14} color={trendColor} />
          <Text style={[s.trendText, { color: trendColor }]}>{trendValue}</Text>
        </View>
        
        <Pressable onPress={onCompare} style={s.compareBtn}>
          <Text style={[s.compareText, { color: color }]}>Compare data</Text>
          <MaterialIcons name="add" size={16} color={color} />
        </Pressable>
      </View>
    </View>
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D3D3D',
  },
  graphPlaceholder: {
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  trendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  compareText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
});
