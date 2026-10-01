import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { store } from '../store/AppStore';
import { Radius } from '../theme';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function EditProfileScreen({ navigation }: any) {
  const { vendor } = store;
  const [name, setName] = useState(vendor.name);
  const [mobile, setMobile] = useState(vendor.mobile);
  const [avatar, setAvatar] = useState(vendor.avatar);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    setSaving(true);
    try {
      if (store.vendorId) {
        const vendorRef = doc(db, 'vendors', store.vendorId);
        await updateDoc(vendorRef, {
          name: name.trim(),
          mobile: mobile.trim(),
          avatar: avatar.trim(),
        });
      }

      store.vendor.name = name.trim();
      store.vendor.mobile = mobile.trim();
      store.vendor.avatar = avatar.trim();
      store.notify();

      Alert.alert('Profile Updated', 'Your vendor profile has been successfully updated.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', 'Failed to update profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
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
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Image URL</Text>
            <TextInput
              style={styles.input}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
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
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scroll: { padding: 16 },
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
  saveBtn: {
    backgroundColor: '#0D3325',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: '#0D3325',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
