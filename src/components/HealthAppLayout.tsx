import React from 'react';
import { View, StyleSheet } from 'react-native';
import SamsungBottomNav, { HealthTab } from './SamsungBottomNav';
import { useNavigation } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
  activeTab: HealthTab;
}

export default function HealthAppLayout({ children, activeTab }: Props) {
  const navigation = useNavigation<any>();
  
  const handleTabPress = (tab: HealthTab) => {
    if (tab === activeTab) return;
    if (tab === 'Home') navigation.navigate('HomeDashboard');
    // Map Together to FamilyDashboard as an example for now
    if (tab === 'Together') navigation.navigate('FamilyDashboard'); 
    if (tab === 'Discover') navigation.navigate('Discover');
  };

  return (
    <View style={s.container}>
      <View style={s.content}>
        {children}
      </View>
      <SamsungBottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light mode base
  },
  content: {
    flex: 1,
    paddingBottom: 60, // Leave space for fixed bottom nav
  },
});
