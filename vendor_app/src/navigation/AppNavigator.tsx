import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

import LoginScreen from '../screens/LoginScreen';
import VendorRegisterScreen from '../screens/VendorRegisterScreen';
import VendorAuthOTPScreen from '../screens/VendorAuthOTPScreen';
import HomeScreen from '../screens/HomeScreen';
import JobsScreen from '../screens/JobsScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailsScreen from '../screens/JobDetailsScreen';
import MapScreen from '../screens/MapScreen';
import OTPScreen from '../screens/OTPScreen';
import ServiceScreen from '../screens/ServiceScreen';
import CompleteScreen from '../screens/CompleteScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

import { Colors, Typography, Radius } from '../theme';
import { store } from '../store/AppStore';

const Stack = createNativeStackNavigator();

// ── Custom Tab Bar ────────────────────────────────────────────────────────
const TABS = [
  { name: 'Home',     icon: 'home',      iconOut: 'home-outline'      },
  { name: 'Jobs',     icon: 'briefcase', iconOut: 'briefcase-outline'  },
  { name: 'Earnings', icon: 'wallet',    iconOut: 'wallet-outline'     },
  { name: 'Profile',  icon: 'person',    iconOut: 'person-outline'     },
];

const TAB_SCREENS: Record<string, React.ComponentType<any>> = {
  Home:     HomeScreen,
  Jobs:     JobsScreen,
  Earnings: EarningsScreen,
  Profile:  ProfileScreen,
};

function CustomTabBar({ activeTab, onTabPress }: { activeTab: string; onTabPress: (name: string) => void }) {
  return (
    <View style={tabStyles.bar}>
      {TABS.map(tab => {
        const active = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.item}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}>
            <View style={[tabStyles.iconWrap, active && tabStyles.iconWrapActive]}>
              <Ionicons
                name={(active ? tab.icon : tab.iconOut) as any}
                size={22}
                color={active ? '#0D3325' : '#9CA3AF'}
              />
            </View>
            <Text style={[tabStyles.label, active && tabStyles.labelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main Tabs container ────────────────────────────────────────────────────
function MainTabsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: activeTab === 'Home' ? 'flex' : 'none' }}>
          <HomeScreen navigation={navigation} route={{ params: {} }} />
        </View>
        <View style={{ flex: 1, display: activeTab === 'Jobs' ? 'flex' : 'none' }}>
          <JobsScreen navigation={navigation} route={{ params: {} }} />
        </View>
        <View style={{ flex: 1, display: activeTab === 'Earnings' ? 'flex' : 'none' }}>
          <EarningsScreen navigation={navigation} route={{ params: {} }} />
        </View>
        <View style={{ flex: 1, display: activeTab === 'Profile' ? 'flex' : 'none' }}>
          <ProfileScreen navigation={navigation} route={{ params: {} }} />
        </View>
      </View>
      <CustomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────
export default function AppNavigator() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'MainTabs'>('Login');

  useEffect(() => {
    let active = true;

    // Safety fallback timer to prevent any freeze
    const safetyTimer = setTimeout(() => {
      if (active && checkingAuth) {
        setCheckingAuth(false);
      }
    }, 1200);

    async function checkSession() {
      try {
        const stored = await AsyncStorage.getItem('@vendor_session');
        if (stored) {
          const session = JSON.parse(stored);
          if (session && session.vendorId) {
            // Restore vendor identity immediately so user is never pushed out
            store.setFirebaseUser(
              session.vendorId,
              session.name || 'Vendor Captain',
              session.mobile || ''
            );
            if (active) {
              setInitialRoute('MainTabs');
              setCheckingAuth(false);
            }

            // In background: sync with Firestore if online (non-blocking)
            try {
              const snap = await getDoc(doc(db, 'vendors', session.vendorId));
              if (snap.exists() && active) {
                const data = snap.data();
                store.setFirebaseUser(
                  session.vendorId,
                  data.name || session.name,
                  data.mobile || session.mobile
                );
              }
            } catch (fsErr) {
              console.warn('[AppNavigator] Background sync warn:', fsErr);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('[AppNavigator] Session check error:', err);
      }

      if (active) {
        setInitialRoute('Login');
        setCheckingAuth(false);
      }
    }

    checkSession();

    return () => {
      active = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F6F7F9', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0D3325" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        {/* Vendor Authentication Flow (Matching Reference Design) */}
        <Stack.Screen name="Login"          component={LoginScreen} />
        <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
        <Stack.Screen name="VendorAuthOTP"  component={VendorAuthOTPScreen} />

        {/* Vendor App Core Screens */}
        <Stack.Screen name="MainTabs"       component={MainTabsScreen} />
        <Stack.Screen name="JobDetails"     component={JobDetailsScreen} />
        <Stack.Screen name="Map"            component={MapScreen} />
        <Stack.Screen name="OTP"            component={OTPScreen} />
        <Stack.Screen
          name="Service"
          component={ServiceScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Complete"
          component={CompleteScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="Notifications"  component={NotificationsScreen} />
        <Stack.Screen name="EditProfile"    component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBECEF',
    height: Platform.OS === 'ios' ? 82 : 68,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    padding: 4,
    borderRadius: 12,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(13,51,37,0.08)',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  labelActive: {
    color: '#0D3325',
    fontWeight: '800',
  },
});
