import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Linking,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { store } from '../store/AppStore';

const { width } = Dimensions.get('window');

interface SOSModalProps {
  visible: boolean;
  onClose: () => void;
  currentJobId?: string;
}

export default function SOSModal({ visible, onClose, currentJobId }: SOSModalProps) {
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const triggerSOS = async (type: 'police' | 'ambulance' | 'admin') => {
    setSending(true);
    try {
      let coords = { latitude: 0, longitude: 0 };
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        }
      } catch (locErr) {
        console.warn('Could not get SOS coords:', locErr);
      }

      const vendor = store.vendor;
      const activeJob = currentJobId ? store.getJob(currentJobId) : store.getCurrentJob();

      await addDoc(collection(db, 'sos_alerts'), {
        vendorId: store.vendorId || vendor.vendorId,
        vendorName: vendor.name || 'Vendor Captain',
        vendorMobile: vendor.mobile || '',
        alertType: type,
        latitude: coords.latitude,
        longitude: coords.longitude,
        jobId: activeJob?.jobId || null,
        jobAddress: activeJob?.address || null,
        customerName: activeJob?.customerName || null,
        customerPhone: activeJob?.customerPhone || null,
        status: 'OPEN_EMERGENCY',
        createdAt: serverTimestamp(),
      });

      setSentSuccess(true);

      // Trigger respective phone dial
      if (type === 'police') {
        Linking.openURL('tel:112');
      } else if (type === 'ambulance') {
        Linking.openURL('tel:108');
      } else {
        Linking.openURL('tel:18001234567');
      }
    } catch (err: any) {
      Alert.alert('SOS Error', 'Could not send cloud SOS alert: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSentSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header Icon */}
          <View style={styles.headerBadge}>
            <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.badgeGrad}>
              <Ionicons name="warning" size={36} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>EMERGENCY SOS</Text>
          <Text style={styles.subtitle}>
            One-tap immediate safety alert. Your live GPS coordinates and active job info will be broadcasted to Admin and Emergency Responders.
          </Text>

          {sentSuccess && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#15803D" />
              <Text style={styles.successText}>🚨 SOS Alert broadcasted to Admin Center!</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.btnCol}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => triggerSOS('police')}
              disabled={sending}
              activeOpacity={0.85}
            >
              <Ionicons name="shield" size={22} color="#FFFFFF" />
              <View style={styles.btnTextWrap}>
                <Text style={styles.btnMainText}>Call Police / National Emergency</Text>
                <Text style={styles.btnSubText}>Dial 112 & Share GPS Location</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EA580C' }]}
              onPress={() => triggerSOS('ambulance')}
              disabled={sending}
              activeOpacity={0.85}
            >
              <Ionicons name="medkit" size={22} color="#FFFFFF" />
              <View style={styles.btnTextWrap}>
                <Text style={styles.btnMainText}>Medical Ambulance Emergency</Text>
                <Text style={styles.btnSubText}>Dial 108 & Share Live Health Alert</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#0D3325' }]}
              onPress={() => triggerSOS('admin')}
              disabled={sending}
              activeOpacity={0.85}
            >
              <Ionicons name="headset" size={22} color="#FFFFFF" />
              <View style={styles.btnTextWrap}>
                <Text style={styles.btnMainText}>Urban Captain 24x7 Safety Helpline</Text>
                <Text style={styles.btnSubText}>Direct Admin Incident Team Dispatch</Text>
              </View>
            </TouchableOpacity>
          </View>

          {sending && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#DC2626" />
              <Text style={styles.loadingText}>Broadcasting GPS coordinates to Admin...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel & Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerBadge: {
    marginTop: -48,
    marginBottom: 12,
  },
  badgeGrad: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    width: '100%',
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  btnCol: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
  },
  btnTextWrap: {
    flex: 1,
  },
  btnMainText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  loadingText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
