import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

import HealthAppLayout from '@/components/HealthAppLayout';
import TopCategoryChips, { Category } from '@/components/TopCategoryChips';
import MetricCard from '@/components/MetricCard';

type Props = NativeStackScreenProps<RootStackParamList, "HomeDashboard">;

export default function HomeDashboardScreen({ navigation }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('Activity');

  const handleCategorySelect = (category: Category) => {
    setActiveCategory(category);
    // Navigate to detail pages based on category
    if (category === 'Vitals') {
      // @ts-ignore - we will add this to types later
      navigation.navigate('VitalsScreen');
      // Reset after navigation so Home stays on default
      setTimeout(() => setActiveCategory('Activity'), 500);
    }
  };

  return (
    <HealthAppLayout activeTab="Home">
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Good Morning, Alex 👋</Text>
          <Text style={s.date}>October 15</Text>
        </View>
        <Pressable style={s.avatarBtn} onPress={() => navigation.navigate("Profile")}>
          <MaterialIcons name="person" size={24} color="#8C8C8C" />
        </Pressable>
      </View>

      <TopCategoryChips activeCategory={activeCategory} onSelect={handleCategorySelect} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <MetricCard
          title="Daily Activity"
          value="6,450"
          unit="steps"
          icon="directions-run"
          color="#1E88E5"
        />
        <MetricCard
          title="Sleep"
          value="7h 20m"
          icon="bedtime"
          color="#5E35B1"
        />
        <MetricCard
          title="Heart Rate"
          value="72"
          unit="bpm"
          icon="favorite"
          color="#E53935"
        />
        <MetricCard
          title="Stress"
          value="Low"
          icon="self-improvement"
          color="#00897B"
        />
        <MetricCard
          title="Food"
          value="1,450"
          unit="kcal"
          icon="restaurant"
          color="#F4511E"
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
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  date: {
    fontSize: 14,
    color: '#8C8C8C',
    marginTop: 4,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  }
});
