import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Image, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { store } from '../store/AppStore';

const { width } = Dimensions.get('window');

interface DocumentsVaultModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DocItem {
  id: string;
  name: string;
  sub: string;
  icon: string;
  photoUrl?: string | null;
  status: 'verified' | 'pending' | 'missing';
}

export default function DocumentsVaultModal({ visible, onClose }: DocumentsVaultModalProps) {
  const vendor = store.vendor;
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Local document state initialized from vendor data
  const [docs, setDocs] = useState<Record<string, { url: string | null; status: 'verified' | 'pending' | 'missing' }>>({
    aadhaarFront: { url: (vendor as any)?.aadhaarFront || null, status: (vendor as any)?.aadhaarFront ? 'verified' : 'missing' },
    aadhaarBack: { url: (vendor as any)?.aadhaarBack || null, status: (vendor as any)?.aadhaarBack ? 'verified' : 'missing' },
    drivingLicense: { url: (vendor as any)?.drivingLicense || null, status: (vendor as any)?.drivingLicense ? 'verified' : 'missing' },
    insurancePolicy: { url: (vendor as any)?.insurancePolicy || null, status: (vendor as any)?.insurancePolicy ? 'verified' : 'missing' },
    profilePhoto: { url: vendor.avatar || null, status: vendor.avatar ? 'verified' : 'missing' },
  });

  const pickDocument = async (docKey: string, docTitle: string) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow photo gallery access to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        setUploadingDocId(docKey);

        // Update local state
        setDocs(prev => ({
          ...prev,
          [docKey]: { url: dataUri, status: 'pending' },
        }));

        // Sync with Firestore vendor document
        if (store.vendorId) {
          await updateDoc(doc(db, 'vendors', store.vendorId), {
            [`documents.${docKey}`]: dataUri,
            [docKey]: dataUri,
            documentsUpdatedAt: serverTimestamp(),
          });
        }

        Alert.alert('✅ Document Uploaded', `${docTitle} has been uploaded successfully for admin verification.`);
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploadingDocId(null);
    }
  };

  const DOC_LIST: { id: string; name: string; sub: string; icon: string }[] = [
    { id: 'aadhaarFront', name: 'Aadhaar Card (Front)', sub: 'National Identity Proof with UIDAI number', icon: 'card-outline' },
    { id: 'aadhaarBack', name: 'Aadhaar Card (Back)', sub: 'Address & QR Verification proof', icon: 'card-outline' },
    { id: 'drivingLicense', name: 'Driving / Trade License', sub: 'Commercial driver or professional trade permit', icon: 'car-outline' },
    { id: 'insurancePolicy', name: 'Service Insurance & Police Clearance', sub: 'Third-party damage liability or background check', icon: 'shield-checkmark-outline' },
    { id: 'profilePhoto', name: 'Govt ID Passport Photo', sub: 'Official verified photo for customer badges', icon: 'person-circle-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <LinearGradient colors={['#0D3325', '#164E3A']} style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.badgePill}>
                <Ionicons name="lock-closed" size={13} color="#34D399" />
                <Text style={styles.badgePillText}>ENCRYPTED KYC VAULT</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>KYC &amp; Govt Proof Storage</Text>
            <Text style={styles.headerSub}>
              Aadhaar, License, Insurance, and Identity documents verified for partner credibility.
            </Text>
          </LinearGradient>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {DOC_LIST.map(item => {
              const currentDoc = docs[item.id] || { url: null, status: 'missing' };
              const isUploading = uploadingDocId === item.id;

              return (
                <View key={item.id} style={styles.docCard}>
                  <View style={styles.docRow}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={item.icon as any} size={22} color="#0D3325" />
                    </View>

                    <View style={styles.docInfo}>
                      <Text style={styles.docName}>{item.name}</Text>
                      <Text style={styles.docSub}>{item.sub}</Text>
                    </View>

                    <View style={styles.statusBadge}>
                      {currentDoc.status === 'verified' && (
                        <View style={[styles.badgePillSmall, { backgroundColor: '#DCFCE7' }]}>
                          <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                          <Text style={[styles.badgeTextSmall, { color: '#15803D' }]}>Verified</Text>
                        </View>
                      )}
                      {currentDoc.status === 'pending' && (
                        <View style={[styles.badgePillSmall, { backgroundColor: '#FEF3C7' }]}>
                          <Ionicons name="time" size={12} color="#D97706" />
                          <Text style={[styles.badgeTextSmall, { color: '#D97706' }]}>In Review</Text>
                        </View>
                      )}
                      {currentDoc.status === 'missing' && (
                        <View style={[styles.badgePillSmall, { backgroundColor: '#FEE2E2' }]}>
                          <Ionicons name="alert-circle" size={12} color="#DC2626" />
                          <Text style={[styles.badgeTextSmall, { color: '#DC2626' }]}>Required</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Thumbnail Preview if exists */}
                  {currentDoc.url && (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: currentDoc.url }} style={styles.previewImage} resizeMode="cover" />
                      <View style={styles.previewOverlay}>
                        <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                        <Text style={styles.previewOverlayText}>Stored in Secure Cloud</Text>
                      </View>
                    </View>
                  )}

                  {/* Action */}
                  <TouchableOpacity
                    style={[styles.uploadBtn, currentDoc.url ? styles.uploadBtnOutline : styles.uploadBtnPrimary]}
                    onPress={() => pickDocument(item.id, item.name)}
                    disabled={isUploading}
                    activeOpacity={0.8}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color={currentDoc.url ? '#0D3325' : '#FFFFFF'} />
                    ) : (
                      <>
                        <Ionicons
                          name={currentDoc.url ? 'refresh-outline' : 'cloud-upload-outline'}
                          size={16}
                          color={currentDoc.url ? '#0D3325' : '#FFFFFF'}
                        />
                        <Text style={[styles.uploadBtnText, currentDoc.url && styles.uploadBtnTextOutline]}>
                          {currentDoc.url ? 'Replace Document' : 'Upload Document'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    width: '100%',
    height: '86%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 14,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  docSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {},
  badgePillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeTextSmall: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  previewContainer: {
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewOverlayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadBtnPrimary: {
    backgroundColor: '#0D3325',
  },
  uploadBtnOutline: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  uploadBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadBtnTextOutline: {
    color: '#0D3325',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  doneBtn: {
    backgroundColor: '#0D3325',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
