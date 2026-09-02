import React from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

import HealthAppLayout from '@/components/HealthAppLayout';
import TopCategoryChips, { Category } from '@/components/TopCategoryChips';
import DetailMetricCard from '@/components/DetailMetricCard';

// Temporary fix since VitalsScreen isn't in RootStackParamList yet
type Props = any; // NativeStackScreenProps<RootStackParamList, "VitalsScreen">;

export default function VitalsScreen({ navigation }: Props) {
  const handleCategorySelect = (category: Category) => {
    if (category === 'Activity') {
      navigation.navigate('HomeDashboard');
    }
    // Handle other navigations...
  };

  return (
    <HealthAppLayout activeTab="Home">
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={s.title}>Vitals</Text>
        <View style={{ width: 40 }} /> {/* flex balance */}
      </View>

      <TopCategoryChips activeCategory="Vitals" onSelect={handleCategorySelect} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <DetailMetricCard
          title="Heart Rate"
          value="72"
          unit="bpm"
          trendValue="2%"
          trendDirection="down"
          color="#E53935"
        />
        <DetailMetricCard
          title="HRV"
          value="45"
          unit="ms"
          trendValue="5%"
          trendDirection="up"
          color="#8E24AA"
        />
        <DetailMetricCard
          title="Blood Oxygen"
          value="98"
          unit="%"
          trendValue="--%"
          trendDirection="neutral"
          color="#039BE5"
        />
        <DetailMetricCard
          title="Respiratory Rate"
          value="14"
          unit="rpm"
          trendValue="1%"
          trendDirection="down"
          color="#00ACC1"
        />
      </ScrollView>
    </HealthAppLayout>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56, // For status bar spacing
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  }
});
