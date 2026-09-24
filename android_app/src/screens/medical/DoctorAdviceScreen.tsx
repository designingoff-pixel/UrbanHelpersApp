import React, { useState, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import { colors } from "@/theme/colors";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumBadge } from "@/components/PremiumBadge";
import { SubscriptionModal } from "@/components/SubscriptionModal";

type Props = NativeStackScreenProps<RootStackParamList, "DoctorAdvice">;

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  distanceKm: number;
  rating: number;
  fee: string;
  clinic: string;
  availableTime: string;
}

const DOCTORS_LIST: Doctor[] = [
  {
    id: "1",
    name: "Dr. Ananya Sharma",
    specialty: "General Physician",
    experience: "12 yrs exp",
    distanceKm: 0.8,
    rating: 4.9,
    fee: "₹400",
    clinic: "Apollo Clinic, RS Puram",
    availableTime: "Today • 10:30 AM",
  },
  {
    id: "2",
    name: "Dr. Rajesh K. Varma",
    specialty: "Cardiologist",
    experience: "18 yrs exp",
    distanceKm: 1.4,
    rating: 4.95,
    fee: "₹800",
    clinic: "Heart Care Institute, Race Course",
    availableTime: "Today • 04:00 PM",
  },
  {
    id: "3",
    name: "Dr. Priya Sundaram",
    specialty: "Dermatologist",
    experience: "9 yrs exp",
    distanceKm: 2.1,
    rating: 4.8,
    fee: "₹500",
    clinic: "Glow Skin & Hair Clinic",
    availableTime: "Tomorrow • 11:00 AM",
  },
  {
    id: "4",
    name: "Dr. Arvind Menon",
    specialty: "Orthopedic",
    experience: "15 yrs exp",
    distanceKm: 2.7,
    rating: 4.85,
    fee: "₹650",
    clinic: "Joint & Spine Center",
    availableTime: "Today • 06:30 PM",
  },
  {
    id: "5",
    name: "Dr. Meera Krishnan",
    specialty: "Pediatrician",
    experience: "14 yrs exp",
    distanceKm: 3.2,
    rating: 4.9,
    fee: "₹500",
    clinic: "Little Steps Child Clinic",
    availableTime: "Tomorrow • 09:30 AM",
  },
];

const SPECIALTY_CHIPS = [
  "All",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic",
  "Pediatrician",
];

export default function DoctorAdviceScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "fee">("distance");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { isVip, checkAndGate, isModalVisible, modalTriggerFeature, closeUpgradeModal } =
    useSubscription();

  const filteredDoctors = useMemo(() => {
    return DOCTORS_LIST.filter((doc) => {
      if (selectedSpecialty !== "All" && doc.specialty !== selectedSpecialty) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.clinic.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "distance") return a.distanceKm - b.distanceKm;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "fee") {
        const feeA = parseInt(a.fee.replace(/\D/g, ""), 10);
        const feeB = parseInt(b.fee.replace(/\D/g, ""), 10);
        return feeA - feeB;
      }
      return 0;
    });
  }, [searchQuery, selectedSpecialty, sortBy]);

  const handleBookDoctor = (doc: Doctor) => {
    setSelectedDoctor(null);
    Alert.alert(
      "Consultation Booked",
      `Your consultation with ${doc.name} (${doc.specialty}) is scheduled for ${doc.availableTime} at ${doc.clinic}.`
    );
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>DR Nearby & Consultations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Universal Search Box (Page 2 / Page 4) */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search doctor by name, specialty, clinic..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
          </Pressable>
        )}
      </View>

      {/* Specialty Filter Chips */}
      <View style={{ marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsList}>
          {SPECIALTY_CHIPS.map((sp) => (
            <Pressable
              key={sp}
              style={[s.chipBtn, selectedSpecialty === sp && s.chipBtnActive]}
              onPress={() => setSelectedSpecialty(sp)}
            >
              <Text style={[s.chipText, selectedSpecialty === sp && s.chipTextActive]}>{sp}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Sort By Row */}
      <View style={s.sortRow}>
        <Text style={s.sortLabel}>Sort by:</Text>
        <Pressable
          style={[s.sortPill, sortBy === "distance" && s.sortPillActive]}
          onPress={() => setSortBy("distance")}
        >
          <Ionicons name="location-outline" size={13} color={sortBy === "distance" ? "#00bcd4" : "rgba(255,255,255,0.5)"} />
          <Text style={[s.sortPillText, sortBy === "distance" && s.sortPillTextActive]}>Nearby (Distance)</Text>
        </Pressable>
        <Pressable
          style={[s.sortPill, sortBy === "rating" && s.sortPillActive]}
          onPress={() => setSortBy("rating")}
        >
          <Ionicons name="star" size={12} color={sortBy === "rating" ? "#f59e0b" : "rgba(255,255,255,0.5)"} />
          <Text style={[s.sortPillText, sortBy === "rating" && s.sortPillTextActive]}>Top Rated</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* VIP Priority Banner */}
        {!isVip && (
          <Pressable
            style={s.vipBanner}
            onPress={() => checkAndGate("doctor_priority", "Priority Doctor Consultation")}
          >
            <View style={s.vipBannerLeft}>
              <Ionicons name="sparkles" size={18} color="#f59e0b" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={s.vipBannerTitle}>VIP Priority Doctor Consultations</Text>
                <Text style={s.vipBannerSub}>Skip the queue & get 15% off clinic visits with Urban VIP</Text>
              </View>
            </View>
            <PremiumBadge label="UPGRADE" />
          </Pressable>
        )}

        {/* Doctor List Cards */}
        {filteredDoctors.map((doc, idx) => (
          <Animated.View key={doc.id} entering={FadeInDown.delay(idx * 50).duration(300)}>
            <View style={s.doctorCard}>
              <View style={s.doctorTopRow}>
                <View style={s.docAvatar}>
                  <Ionicons name="person" size={26} color="#00bcd4" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={s.doctorName}>{doc.name}</Text>
                    <View style={s.ratingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={s.ratingText}>{doc.rating}</Text>
                    </View>
                  </View>
                  <Text style={s.doctorSpecialty}>{doc.specialty} • {doc.experience}</Text>
                  <Text style={s.doctorClinic}>{doc.clinic}</Text>
                </View>
              </View>

              <View style={s.divider} />

              <View style={s.doctorBottomRow}>
                <View style={s.distanceBadge}>
                  <Ionicons name="navigate" size={12} color="#00bcd4" />
                  <Text style={s.distanceText}>{doc.distanceKm} km away</Text>
                </View>
                <Text style={s.doctorFee}>{doc.fee}</Text>
                <Pressable
                  style={s.bookBtn}
                  onPress={() => setSelectedDoctor(doc)}
                >
                  <Text style={s.bookBtnText}>Book Visit</Text>
                  <Ionicons name="arrow-forward" size={12} color="#ffffff" />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ))}

        {filteredDoctors.length === 0 && (
          <View style={s.emptyHint}>
            <Ionicons name="medical-outline" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={s.emptyHintText}>No doctors match your search or filter</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Doctor Appointment Booking Modal */}
      <Modal
        visible={!!selectedDoctor}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedDoctor(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.bookingModalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Confirm Doctor Appointment</Text>
              <Pressable onPress={() => setSelectedDoctor(null)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </Pressable>
            </View>

            {selectedDoctor && (
              <View style={s.modalDoctorInfo}>
                <Text style={s.modalDocName}>{selectedDoctor.name}</Text>
                <Text style={s.modalDocSpec}>{selectedDoctor.specialty} • {selectedDoctor.clinic}</Text>
                <View style={s.slotRow}>
                  <Ionicons name="time" size={16} color="#00bcd4" />
                  <Text style={s.slotText}>Slot: {selectedDoctor.availableTime}</Text>
                </View>
                <View style={s.feeRow}>
                  <Text style={s.feeLabel}>Consultation Fee:</Text>
                  <Text style={s.feeVal}>{selectedDoctor.fee}</Text>
                </View>
              </View>
            )}

            <Pressable
              style={s.confirmBookBtn}
              onPress={() => selectedDoctor && handleBookDoctor(selectedDoctor)}
            >
              <Text style={s.confirmBookText}>Confirm & Reserve Slot</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Subscription Paywall Modal */}
      <SubscriptionModal
        visible={isModalVisible}
        featureName={modalTriggerFeature}
        onClose={closeUpgradeModal}
        onSuccess={() => Alert.alert("VIP Unlocked", "Enjoy priority medical consultations!")}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#081826" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#ffffff" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: "#ffffff" },
  chipsList: { paddingHorizontal: 16, gap: 8 },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipBtnActive: { backgroundColor: "#00bcd4", borderColor: "#00bcd4" },
  chipText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  chipTextActive: { color: "#ffffff", fontWeight: "700" },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sortLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sortPillActive: { backgroundColor: "rgba(0,188,212,0.15)", borderWidth: 1, borderColor: "#00bcd4" },
  sortPillText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  sortPillTextActive: { color: "#00bcd4", fontWeight: "700" },
  scroll: { paddingHorizontal: 16 },
  vipBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  vipBannerLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  vipBannerTitle: { fontSize: 13, fontWeight: "700", color: "#f59e0b" },
  vipBannerSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  doctorCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  doctorTopRow: { flexDirection: "row" },
  docAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,188,212,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorName: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 12, fontWeight: "700", color: "#f59e0b" },
  doctorSpecialty: { fontSize: 12, color: "#00bcd4", marginTop: 2, fontWeight: "600" },
  doctorClinic: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 10 },
  doctorBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  distanceBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  distanceText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  doctorFee: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#00bcd4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookBtnText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  emptyHint: { alignItems: "center", marginTop: 24 },
  emptyHintText: { color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  bookingModalCard: { width: "100%", backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 10, marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  modalDoctorInfo: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 14, gap: 4 },
  modalDocName: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  modalDocSpec: { fontSize: 12, color: "#64748b" },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  slotText: { fontSize: 12, fontWeight: "600", color: "#00bcd4" },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  feeLabel: { fontSize: 12, color: "#64748b" },
  feeVal: { fontSize: 14, fontWeight: "800", color: "#059669" },
  confirmBookBtn: { backgroundColor: "#00bcd4", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  confirmBookText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});
