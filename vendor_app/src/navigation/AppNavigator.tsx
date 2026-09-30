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
                color={active ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
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

  const handleTabPress = (name: string) => {
    setActiveTab(name);
  };

  const ActiveScreen = TAB_SCREENS[activeTab] ?? HomeScreen;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnightNavy }}>
      <View style={{ flex: 1 }}>
        <ActiveScreen navigation={navigation} route={{ params: {} }} />
      </View>
      <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────
export default function AppNavigator() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'MainTabs'>('Login');

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const stored = await AsyncStorage.getItem('@vendor_session');
        if (stored) {
          const session = JSON.parse(stored);
          if (session && session.vendorId) {
            // Verify vendor is still active in Firestore
            const snap = await getDoc(doc(db, 'vendors', session.vendorId));
            if (snap.exists() && active) {
              const data = snap.data();
              store.setFirebaseUser(session.vendorId, data.name || session.name, data.mobile || session.mobile);
              setInitialRoute('MainTabs');
              setCheckingAuth(false);
              return;
            }
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
    };
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.midnightNavy, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    height: Platform.OS === 'ios' ? 82 : 68,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    padding: 5,
    borderRadius: Radius.md,
  },
  iconWrapActive: {
    backgroundColor: Colors.secondaryContainer,
  },
  label: {
    ...Typography.labelMd,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  labelActive: {
    color: Colors.onSecondaryContainer,
    fontWeight: '700',
  },
});
