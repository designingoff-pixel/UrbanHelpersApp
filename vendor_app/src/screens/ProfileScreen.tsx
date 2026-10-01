import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function ProfileScreen({ navigation }: any) {
  const [sosVisible, setSosVisible] = useState(false);
  const { vendor } = store;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
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
    { icon: 'create-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'document-text-outline', label: 'Documents & Verification', onPress: () => Alert.alert('Documents', 'Your partner KYC & documents are fully verified.') },
    { icon: 'help-circle-outline', label: 'Support & Help Desk', onPress: () => Alert.alert('Support', 'Contact Captain Support:\nPhone: 1800-123-4567\nEmail: support@urbancaptain.com') },
    { icon: 'settings-outline', label: 'Settings', onPress: () => Alert.alert('Settings', 'App preferences and notification settings.') },
    { icon: 'log-out-outline', label: 'Logout', onPress: handleLogout, danger: true },
  ];

  const vendorAvatar =
    vendor.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';
  const displayRating = vendor.rating ? vendor.rating.toFixed(1) : '4.8';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Vendor Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Profile Card */}
        <LinearGradient
          colors={['#0D3325', '#164E3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.profileCard}
        >
          <View style={s.avatarWrapper}>
            <Image source={{ uri: vendorAvatar }} style={s.avatar} />
            <View style={s.verifiedIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            </View>
          </View>

          <Text style={s.name}>{vendor.name || 'Viswesh'}</Text>
          <Text style={s.phoneText}>{vendor.mobile || '+91 98765 43210'}</Text>

          <View style={s.badgesRow}>
            <View style={s.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={s.badgeText}>{displayRating} Rating</Text>
            </View>
            <View style={s.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#10B981" />
              <Text style={[s.badgeText, { color: '#10B981' }]}>Vendor Captain</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info Cards Row */}
        <View style={s.infoRow}>
          <View style={s.infoCard}>
            <View style={s.infoCardHeader}>
              <Ionicons name="construct" size={15} color="#0D3325" />
              <Text style={s.infoCardLabel}>SERVICES</Text>
            </View>
            <Text style={s.infoCardValue} numberOfLines={2}>
              {vendor.services && vendor.services.length > 0 ? vendor.services.join(', ') : 'Home Cleaning, Appliance'}
            </Text>
          </View>
          <View style={s.infoCard}>
            <View style={s.infoCardHeader}>
              <Ionicons name="location" size={15} color="#0D3325" />
              <Text style={s.infoCardLabel}>COVERAGE AREA</Text>
            </View>
            <Text style={s.infoCardValue} numberOfLines={2}>
              {vendor.serviceArea || 'Citywide'}, {vendor.serviceRadius || 15} km
            </Text>
          </View>
        </View>

        {/* Stats 3-Box Row */}
        <View style={s.statsCard}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{store.completedJobsCount}</Text>
            <Text style={s.statLabel}>Completed</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>₹{store.totalEarnings.toLocaleString('en-IN')}</Text>
            <Text style={s.statLabel}>Earnings</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>{displayRating} ⭐</Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={s.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={[s.menuItem, i < menuItems.length - 1 && s.menuItemBorder]}
              activeOpacity={0.7}
            >
              <View style={[s.menuIconBox, item.danger && { backgroundColor: '#FEE2E2' }]}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.danger ? '#EF4444' : '#0D3325'}
                />
              </View>
              <Text style={[s.menuLabel, item.danger && { color: '#EF4444', fontWeight: '700' }]}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={item.danger ? '#EF4444' : '#9CA3AF'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency SOS Button */}
        <View style={s.sosSection}>
          <TouchableOpacity
            onPress={() => setSosVisible(true)}
            activeOpacity={0.85}
            style={s.sosBtnWrap}
          >
            <LinearGradient colors={['#EF4444', '#DC2626']} style={s.sosBtn}>
              <Ionicons name="warning" size={22} color="#FFFFFF" />
              <Text style={s.sosBtnText}>EMERGENCY SOS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* SOS Modal */}
      <Modal visible={sosVisible} animationType="slide" transparent>
        <View style={s.sosOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSosVisible(false)} />
          <View style={s.sosSheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sosTitle}>Emergency Help</Text>
            <View style={s.sosOptions}>
              <TouchableOpacity
                style={s.sosOption}
                onPress={() => Linking.openURL('tel:18001234567')}
              >
                <View style={[s.sosOptionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="headset" size={22} color="#DC2626" />
                </View>
                <Text style={s.sosOptionLabel}>Call Urban Captain Support</Text>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.sosOption, { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }]}
                onPress={() => Linking.openURL('tel:100')}
              >
                <View style={[s.sosOptionIcon, { backgroundColor: '#EF4444' }]}>
                  <Ionicons name="shield" size={22} color="#FFFFFF" />
                </View>
                <Text style={[s.sosOptionLabel, { color: '#DC2626', fontWeight: '700' }]}>
                  Call Police (100)
                </Text>
                <Ionicons name="call" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setSosVisible(false)} style={s.sosCancelBtn}>
              <Text style={s.sosCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F6F7F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  scroll: {
    paddingHorizontal: 16,
  },

  profileCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECEF',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  infoCardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EBECEF',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBECEF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  sosSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sosBtnWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    width: '100%',
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  sosBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  sosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sosSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sosTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  sosOptions: {
    gap: 10,
  },
  sosOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sosOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosOptionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sosCancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sosCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
});
