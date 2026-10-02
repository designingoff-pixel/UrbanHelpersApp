import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import SOSModal from '../components/SOSModal';
import DocumentsVaultModal from '../components/DocumentsVaultModal';

export default function ProfileScreen({ navigation }: any) {
  const [, forceUpdate] = useState(0);
  const [sosVisible, setSosVisible] = useState(false);
  const [docsVisible, setDocsVisible] = useState(false);

  useEffect(() => {
    return store.subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  const { vendor } = store;
  const ratingStr = store.effectiveRating ? store.effectiveRating.toFixed(1) : '5.0';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Urban Captain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (err) {
            console.warn('SignOut error:', err);
          }
          store.setFirebaseUser('', '', '');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'document-text-outline',
      label: 'KYC Documents & Govt Proofs',
      sub: 'Aadhaar, Driving License, Insurance & Photo',
      onPress: () => setDocsVisible(true),
      badge: 'Verified',
      badgeColor: '#10B981',
    },
    {
      icon: 'create-outline',
      label: 'Edit Profile & Skills',
      sub: 'Name, phone, service categories & area',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'warning-outline',
      label: 'Emergency SOS Broadcast Setup',
      sub: '24x7 incident hotline & location sharing',
      onPress: () => setSosVisible(true),
    },
    {
      icon: 'help-circle-outline',
      label: 'Support & Help Desk',
      sub: 'Call 1800-123-4567 or email admin',
      onPress: () => Alert.alert('Captain Support', 'Urban Captain 24x7 Partner Support:\n\n📞 Phone: 1800-123-4567\n📧 Email: partner@urbancaptain.com\n🏢 Headquarters: Chennai, India'),
    },
    {
      icon: 'log-out-outline',
      label: 'Sign Out',
      sub: 'Safely disconnect this device',
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Partner Profile</Text>
        <TouchableOpacity onPress={() => setSosVisible(true)} style={styles.sosHeaderBtn}>
          <Ionicons name="warning" size={14} color="#DC2626" />
          <Text style={styles.sosHeaderText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <View style={styles.profileCard}>
          <LinearGradient colors={['#0D3325', '#164E3A']} style={styles.profileGrad}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri:
                    vendor.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
                }}
                style={styles.avatar}
              />
              <View style={styles.verifiedIcon}>
                <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.name}>{vendor.name || 'Vendor Captain'}</Text>
            <Text style={styles.mobile}>+91 {vendor.mobile || '9876543210'}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{ratingStr} Rating</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Ionicons name="construct" size={12} color="#34D399" />
                <Text style={styles.categoryText}>
                  {vendor.services && vendor.services.length > 0 ? vendor.services[0] : 'All Services'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, idx !== menuItems.length - 1 && styles.menuBorder]}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, item.danger && styles.menuIconDanger]}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.danger ? '#DC2626' : '#0D3325'}
                />
              </View>

              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
                {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
              </View>

              {item.badge && (
                <View style={[styles.menuBadge, { backgroundColor: item.badgeColor + '20' }]}>
                  <Text style={[styles.menuBadgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                </View>
              )}

              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>Urban Captain Vendor App v2.5.0 • Build 2026</Text>
      </ScrollView>

      {/* Modals */}
      <SOSModal visible={sosVisible} onClose={() => setSosVisible(false)} />
      <DocumentsVaultModal visible={docsVisible} onClose={() => setDocsVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  sosHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sosHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  scroll: { padding: 16, paddingBottom: 60, gap: 16 },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGrad: {
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mobile: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FCD34D',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconDanger: {
    backgroundColor: '#FEE2E2',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuLabelDanger: {
    color: '#DC2626',
  },
  menuSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
