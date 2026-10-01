import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { store } from '../store/AppStore';
import { Radius } from '../theme';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function EditProfileScreen({ navigation }: any) {
  const { vendor } = store;
  const [name, setName] = useState(vendor.name || '');
  const [mobile, setMobile] = useState(vendor.mobile || '');
  const [avatar, setAvatar] = useState(
    vendor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'
  );
  const [saving, setSaving] = useState(false);

  // Pick image from local folder / gallery
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow gallery access to upload your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e: any) {
      console.warn('Image picker error:', e);
      Alert.alert('Upload Error', 'Could not select photo. Please try again.');
    }
  };

  // Take new photo with camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow camera access to take a profile photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e: any) {
      console.warn('Camera error:', e);
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handleChooseImagePrompt = () => {
    Alert.alert('Profile Photo', 'Choose an option to update your photo', [
      { text: 'Choose from Gallery / Folder', onPress: handlePickFromGallery },
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Full Name is required.');
    setSaving(true);
    try {
      if (store.vendorId) {
        const vendorRef = doc(db, 'vendors', store.vendorId);
        await setDoc(
          vendorRef,
          {
            name: name.trim(),
            mobile: mobile.trim(),
            avatar: avatar.trim(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }

      store.vendor.name = name.trim();
      store.vendor.mobile = mobile.trim();
      store.vendor.avatar = avatar.trim();
      store.notify();

      Alert.alert('Profile Updated', 'Your vendor profile has been successfully saved.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', 'Failed to update profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Avatar Upload Container */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={handleChooseImagePrompt} activeOpacity={0.85}>
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChooseImagePrompt} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Upload Photo from Folder</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Viswesh"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Admin Managed Coverage Area Notice */}
          <View style={styles.adminAreaCard}>
            <View style={styles.adminAreaHeader}>
              <Ionicons name="location-outline" size={18} color="#0D3325" />
              <Text style={styles.adminAreaTitle}>Coverage Area &amp; Service Radius</Text>
            </View>
            <Text style={styles.adminAreaText}>
              Assigned Area: <Text style={{ fontWeight: '700', color: '#0D3325' }}>{vendor.serviceArea || 'Citywide'}</Text> ({vendor.serviceRadius || 15} km radius)
            </Text>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.adminBadgeText}>Configured by Admin in Master Portal</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F6F7F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scroll: { padding: 16, paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0D3325',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D3325',
  },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
  },
  adminAreaCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 20,
  },
  adminAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  adminAreaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D3325',
  },
  adminAreaText: {
    fontSize: 12.5,
    color: '#374151',
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  saveBtn: {
    backgroundColor: '#0D3325',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
