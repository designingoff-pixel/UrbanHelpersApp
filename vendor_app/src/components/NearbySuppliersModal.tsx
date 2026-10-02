import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Linking, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface NearbySuppliersModalProps {
  visible: boolean;
  onClose: () => void;
  serviceCategory?: string;
  latitude?: number;
  longitude?: number;
  customerAddress?: string;
}

const SUPPLIER_TYPES = [
  {
    title: 'Hardware & Tools Shops',
    query: 'hardware store tool shop',
    icon: 'construct-outline',
    color: '#0D3325',
    desc: 'Power tools, drill bits, fasteners, adhesives & safety gear.',
  },
  {
    title: 'RO Water & Filter Spares',
    query: 'water purifier RO spare parts store',
    icon: 'water-outline',
    color: '#0284C7',
    desc: 'Sediment filters, RO membranes, carbon filters, fittings & tubing.',
  },
  {
    title: 'AC & Appliance Spare Parts',
    query: 'AC spare parts refrigeration supplier',
    icon: 'snow-outline',
    color: '#2563EB',
    desc: 'Refrigerant gas cans, capacitors, copper pipes & fan motors.',
  },
  {
    title: 'Sanitary & Plumbing Supplies',
    query: 'plumbing sanitary hardware store',
    icon: 'funnel-outline',
    color: '#059669',
    desc: 'CPVC pipes, brass valves, angle cocks, Teflon tape & sealants.',
  },
  {
    title: 'Electrical & Electronics Hub',
    query: 'electrical goods store wires switches',
    icon: 'flash-outline',
    color: '#D97706',
    desc: 'MCBs, copper wires, sockets, testing multimeters & relays.',
  },
];

export default function NearbySuppliersModal({
  visible,
  onClose,
  serviceCategory = '',
  latitude = 0,
  longitude = 0,
  customerAddress = '',
}: NearbySuppliersModalProps) {
  const openInGoogleMaps = (queryStr: string) => {
    let url = `https://www.google.com/maps/search/${encodeURIComponent(queryStr)}`;
    if (latitude && longitude && latitude !== 0) {
      url = `https://www.google.com/maps/search/${encodeURIComponent(queryStr)}/@${latitude},${longitude},14z`;
    } else if (customerAddress) {
      url = `https://www.google.com/maps/search/${encodeURIComponent(queryStr + ' near ' + customerAddress)}`;
    }
    Linking.openURL(url);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.badgePill}>
                <Ionicons name="storefront-outline" size={13} color="#60A5FA" />
                <Text style={styles.badgePillText}>SUPPLIERS &amp; TOOLS HUB</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>Nearby Spare Parts &amp; Tool Shops</Text>
            <Text style={styles.headerSub}>
              Locate authorized distributor hubs, hardware stores, and spare parts near current job location in real-time.
            </Text>
          </LinearGradient>

          {/* Supplier Categories */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {SUPPLIER_TYPES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                onPress={() => openInGoogleMaps(item.query)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                  <View style={styles.actionRow}>
                    <Ionicons name="navigate-circle-outline" size={15} color="#0284C7" />
                    <Text style={styles.actionText}>Find Nearest Stores on Map</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
              <Text style={styles.closeActionText}>Close Supplier Hub</Text>
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
    height: '75%',
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
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
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
    fontSize: 19,
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
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
