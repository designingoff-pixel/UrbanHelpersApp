import React, { useState } from "react";
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { RootStackParamList } from "@/navigation/types";
import SamsungBottomNav from "@/components/SamsungBottomNav";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { PremiumBadge } from "@/components/PremiumBadge";
import { FakeCallModal } from "@/components/FakeCallModal";

type Props = NativeStackScreenProps<RootStackParamList, "FamilyDashboard">;

const { width: W } = Dimensions.get("window");

type SubTab = "live_track" | "sos_msg" | "nearby_help" | "family_health";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  vitals: { heartRate: number; steps: number; battery: number };
  medicineTaken: boolean;
  fallDetected: boolean;
}

const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: "1",
    name: "Dad (Robert)",
    relation: "Father",
    phone: "+91 98401 23456",
    vitals: { heartRate: 72, steps: 4320, battery: 78 },
    medicineTaken: true,
    fallDetected: false,
  },
  {
    id: "2",
    name: "Mom (Sarah)",
    relation: "Mother",
    phone: "+91 98402 34567",
    vitals: { heartRate: 78, steps: 2890, battery: 14 }, // low battery
    medicineTaken: false, // missed dose
    fallDetected: false,
  },
];

export default function FamilyDashboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<SubTab>("live_track");
  const [searchQuery, setSearchQuery] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);

  // Safety Toggles
  const [liveLocationActive, setLiveLocationActive] = useState(false);
  const [geoFenceActive, setGeoFenceActive] = useState(false);
  const [followMeActive, setFollowMeActive] = useState(false);
  const [lowBatteryPingActive, setLowBatteryPingActive] = useState(true);

  // Modals & Subscriptions
  const { isVip, checkAndGate, isModalVisible, modalTriggerFeature, closeUpgradeModal, subscribeToVip } =
    useSubscription();
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState("Parent");

  // Document Vault State
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>("all");
  const [uploadDocModalVisible, setUploadDocModalVisible] = useState(false);

  // Panic button double click detection
  const [lastSosTap, setLastSosTap] = useState<number>(0);

  const handleSosPress = () => {
    const now = Date.now();
    if (now - lastSosTap < 500) {
      // Double tap confirmed
      Alert.alert(
        "🚨 EMERGENCY SOS ACTIVATED!",
        "Emergency broadcast sent with live GPS coordinates to Police, Emergency Guardians, and Family members.",
        [{ text: "DISMISS", style: "cancel" }]
      );
    } else {
      setLastSosTap(now);
      Alert.alert("SOS Trigger", "Double tap quickly to broadcast Emergency SOS to all emergency contacts & police.");
    }
  };

  const handleToggleLiveLocation = (val: boolean) => {
    if (val && !checkAndGate("live_geofence", "Live Location Sharing")) return;
    setLiveLocationActive(val);
  };

  const handleToggleGeoFence = (val: boolean) => {
    if (val && !checkAndGate("live_geofence", "Geo-Fencing Safety Perimeter")) return;
    setGeoFenceActive(val);
  };

  const handleToggleFollowMe = (val: boolean) => {
    if (val && !checkAndGate("follow_me", "Follow Me Live Route Watcher")) return;
    setFollowMeActive(val);
  };

  const handleAddFamilyMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert("Required", "Please provide a valid name and phone number.");
      return;
    }
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      relation: newMemberRelation,
      phone: newMemberPhone.trim(),
      vitals: { heartRate: 74, steps: 1200, battery: 85 },
      medicineTaken: true,
      fallDetected: false,
    };
    setFamilyMembers([...familyMembers, newMember]);
    setNewMemberName("");
    setNewMemberPhone("");
    setAddMemberModalVisible(false);
    Alert.alert("Success", `${newMember.name} has been added to your Family Health network.`);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.pageTitle}>Family & Safety</Text>
          <Text style={s.pageSubtitle}>Live Protection & Medical Care Hub</Text>
        </View>
        <Pressable
          style={s.sosQuickBtn}
          onPress={handleSosPress}
        >
          <Ionicons name="warning" size={16} color="#ffffff" />
          <Text style={s.sosQuickText}>SOS</Text>
        </Pressable>
      </View>

      {/* ── Universal Search Box ──────────────────────────────── */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search family member, medical doc, nearby help..."
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

      {/* ── Sub-Tabs Navigation (Page 3 Notes) ────────────────── */}
      <View style={s.subTabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.subTabsList}>
          <Pressable
            style={[s.subTabBtn, activeTab === "live_track" && s.subTabBtnActive]}
            onPress={() => setActiveTab("live_track")}
          >
            <Ionicons
              name="location"
              size={15}
              color={activeTab === "live_track" ? "#00bcd4" : "rgba(255,255,255,0.6)"}
              style={{ marginRight: 6 }}
            />
            <Text style={[s.subTabText, activeTab === "live_track" && s.subTabTextActive]}>Live Track</Text>
          </Pressable>

          <Pressable
            style={[s.subTabBtn, activeTab === "sos_msg" && s.subTabBtnActive]}
            onPress={() => setActiveTab("sos_msg")}
          >
            <Ionicons
              name="radio"
              size={15}
              color={activeTab === "sos_msg" ? "#00bcd4" : "rgba(255,255,255,0.6)"}
              style={{ marginRight: 6 }}
            />
            <Text style={[s.subTabText, activeTab === "sos_msg" && s.subTabTextActive]}>SOS Msg</Text>
          </Pressable>

          <Pressable
            style={[s.subTabBtn, activeTab === "nearby_help" && s.subTabBtnActive]}
            onPress={() => setActiveTab("nearby_help")}
          >
            <Ionicons
              name="shield-half"
              size={15}
              color={activeTab === "nearby_help" ? "#00bcd4" : "rgba(255,255,255,0.6)"}
              style={{ marginRight: 6 }}
            />
            <Text style={[s.subTabText, activeTab === "nearby_help" && s.subTabTextActive]}>Nearby Help</Text>
          </Pressable>

          <Pressable
            style={[s.subTabBtn, activeTab === "family_health" && s.subTabBtnActive]}
            onPress={() => setActiveTab("family_health")}
          >
            <Ionicons
              name="heart-circle"
              size={15}
              color={activeTab === "family_health" ? "#00bcd4" : "rgba(255,255,255,0.6)"}
              style={{ marginRight: 6 }}
            />
            <Text style={[s.subTabText, activeTab === "family_health" && s.subTabTextActive]}>Family Health Data</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* ═════════════════════════════════════════════════════════
            SUB-TAB 1: LIVE TRACK & SAFETY TOOLS
            ═════════════════════════════════════════════════════════ */}
        {activeTab === "live_track" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            {/* SOS Panic Hero Card */}
            <LinearGradient
              colors={["#7f1d1d", "#dc2626", "#b91c1c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.sosHeroCard}
            >
              <View style={s.sosHeroTop}>
                <View style={s.sosIconCircle}>
                  <Ionicons name="alert" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.sosHeroTitle}>SOS Panic Button</Text>
                  <Text style={s.sosHeroSubtitle}>Double click button for instant emergency dispatch</Text>
                </View>
              </View>
              <Pressable style={s.sosHeroAction} onPress={handleSosPress}>
                <Ionicons name="finger-print-outline" size={20} color="#dc2626" />
                <Text style={s.sosHeroActionText}>TAP TWICE FOR EMERGENCY</Text>
              </Pressable>
            </LinearGradient>

            {/* Live Safety Toggles Grid */}
            <Text style={s.sectionHeader}>Live Safety Suite</Text>

            {/* 1. Live Location Sharing */}
            <View style={s.toolCard}>
              <View style={s.toolLeft}>
                <View style={[s.toolIconWrap, { backgroundColor: "#0284c7" }]}>
                  <Ionicons name="navigate" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.toolTitle}>Live Location Sharing</Text>
                    {!isVip && <PremiumBadge />}
                  </View>
                  <Text style={s.toolDesc}>Continuous GPS broadcast to family guardians</Text>
                </View>
              </View>
              <Switch
                value={liveLocationActive}
                onValueChange={handleToggleLiveLocation}
                trackColor={{ false: "#334155", true: "#0284c7" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* 2. Geo-Fencing */}
            <View style={s.toolCard}>
              <View style={s.toolLeft}>
                <View style={[s.toolIconWrap, { backgroundColor: "#8b5cf6" }]}>
                  <Ionicons name="scan" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.toolTitle}>Geo-Fencing Safety Zone</Text>
                    {!isVip && <PremiumBadge />}
                  </View>
                  <Text style={s.toolDesc}>Alerts when members enter or leave safe perimeter</Text>
                </View>
              </View>
              <Switch
                value={geoFenceActive}
                onValueChange={handleToggleGeoFence}
                trackColor={{ false: "#334155", true: "#8b5cf6" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* 3. Follow Me Route Watcher */}
            <View style={s.toolCard}>
              <View style={s.toolLeft}>
                <View style={[s.toolIconWrap, { backgroundColor: "#10b981" }]}>
                  <Ionicons name="footsteps" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.toolTitle}>Follow Me (Live Trip)</Text>
                    {!isVip && <PremiumBadge />}
                  </View>
                  <Text style={s.toolDesc}>Monitors journey until you safely reach home</Text>
                </View>
              </View>
              <Switch
                value={followMeActive}
                onValueChange={handleToggleFollowMe}
                trackColor={{ false: "#334155", true: "#10b981" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* 4. Fake Incoming Call Simulator */}
            <Pressable
              style={s.toolCard}
              onPress={() => setFakeCallVisible(true)}
            >
              <View style={s.toolLeft}>
                <View style={[s.toolIconWrap, { backgroundColor: "#f59e0b" }]}>
                  <Ionicons name="call" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.toolTitle}>Fake Incoming Call</Text>
                  <Text style={s.toolDesc}>Trigger instant simulated call to escape unsafe situations</Text>
                </View>
              </View>
              <View style={s.simulateBtn}>
                <Text style={s.simulateBtnText}>Simulate</Text>
              </View>
            </Pressable>

            {/* 5. Voice Command SOS & Low Battery Ping */}
            <View style={s.toolCard}>
              <View style={s.toolLeft}>
                <View style={[s.toolIconWrap, { backgroundColor: "#ec4899" }]}>
                  <Ionicons name="mic" size={18} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.toolTitle}>Voice Command & Low Battery Ping</Text>
                  <Text style={s.toolDesc}>Sends last known GPS when phone battery reaches 15%</Text>
                </View>
              </View>
              <Switch
                value={lowBatteryPingActive}
                onValueChange={setLowBatteryPingActive}
                trackColor={{ false: "#334155", true: "#ec4899" }}
                thumbColor="#ffffff"
              />
            </View>
          </Animated.View>
        )}

        {/* ═════════════════════════════════════════════════════════
            SUB-TAB 2: SOS MSG & EMERGENCY BROADCAST
            ═════════════════════════════════════════════════════════ */}
        {activeTab === "sos_msg" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={s.cardDark}>
              <Text style={s.cardDarkTitle}>Emergency Broadcast Message</Text>
              <Text style={s.cardDarkSubtitle}>
                Pre-configured SMS sent with 1 tap to family & verified guardians.
              </Text>
              <View style={s.msgPreviewBox}>
                <Text style={s.msgPreviewText}>
                  "EMERGENCY: I need urgent help! My live location is: https://maps.google.com/?q=11.0168,76.9558. Please call me immediately."
                </Text>
              </View>
              <Pressable
                style={s.testSendBtn}
                onPress={() =>
                  Alert.alert("SMS Test", "Test emergency SMS dispatched to registered emergency contacts.")
                }
              >
                <Ionicons name="paper-plane" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={s.testSendBtnText}>Dispatch Emergency Alert</Text>
              </Pressable>
            </View>

            <Text style={s.sectionHeader}>Emergency ID Card</Text>
            <View style={s.cardDark}>
              <View style={s.idCardHeader}>
                <Ionicons name="medical" size={24} color="#ef4444" />
                <Text style={s.idCardTitle}>Digital Emergency Medical ID</Text>
              </View>
              <View style={s.idInfoRow}>
                <Text style={s.idLabel}>Blood Group:</Text>
                <Text style={s.idVal}>O+ Positive</Text>
              </View>
              <View style={s.idInfoRow}>
                <Text style={s.idLabel}>Allergies:</Text>
                <Text style={s.idVal}>Penicillin, Shellfish</Text>
              </View>
              <View style={s.idInfoRow}>
                <Text style={s.idLabel}>Emergency Contact:</Text>
                <Text style={s.idVal}>+91 98401 23456 (Father)</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ═════════════════════════════════════════════════════════
            SUB-TAB 3: NEARBY HELP (PAGE 3 NOTEBOOK)
            ═════════════════════════════════════════════════════════ */}
        {activeTab === "nearby_help" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text style={s.sectionHeader}>Nearby Safety & Emergency Services</Text>

            {[
              { title: "Safety Route Guidance", desc: "Well-lit and police-patrolled navigation route", icon: "shield-checkmark", color: "#10b981" },
              { title: "Nearby Police Station", desc: "RS Puram Police Station • 1.2 km away", icon: "business", color: "#3b82f6" },
              { title: "Nearby Auto & Transit Stand", desc: "Townhall Auto Hub • 400 m away", icon: "car", color: "#f59e0b" },
              { title: "Nearby Police Checkpoint", desc: "Avinashi Road Checkpoint • 2.4 km away", icon: "shield", color: "#8b5cf6" },
              { title: "Nearby Community Guardians", desc: "18 Active verified emergency volunteers nearby", icon: "people", color: "#06b6d4" },
              { title: "Nearby 24/7 First Aid & Pharmacy", desc: "Apollo 24/7 Emergency Counter • 800 m away", icon: "medkit", color: "#ef4444" },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                style={s.helpCard}
                onPress={() => Alert.alert(item.title, `Navigating to ${item.title}...`)}
              >
                <View style={[s.helpIconWrap, { backgroundColor: item.color + "22" }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.helpTitle}>{item.title}</Text>
                  <Text style={s.helpDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* ═════════════════════════════════════════════════════════
            SUB-TAB 4: FAMILY HEALTH DATA & MEDICAL DOCUMENTS
            ═════════════════════════════════════════════════════════ */}
        {activeTab === "family_health" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            {/* Header with Add Member Button */}
            <View style={s.familyHeaderRow}>
              <Text style={s.sectionHeader}>Family Health Members</Text>
              <Pressable
                style={s.addMemberBtn}
                onPress={() => setAddMemberModalVisible(true)}
              >
                <Ionicons name="person-add" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={s.addMemberBtnText}>+ Add People</Text>
              </Pressable>
            </View>

            {/* Family Members Cards */}
            {familyMembers.map((member) => (
              <View key={member.id} style={s.memberCard}>
                <View style={s.memberCardTop}>
                  <View style={s.memberAvatar}>
                    <Ionicons name="person" size={20} color="#00bcd4" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.memberName}>{member.name}</Text>
                    <Text style={s.memberRelation}>{member.relation} • {member.phone}</Text>
                  </View>
                  <View style={s.batteryWrap}>
                    <Ionicons
                      name={member.vitals.battery < 20 ? "battery-dead" : "battery-charging"}
                      size={18}
                      color={member.vitals.battery < 20 ? "#ef4444" : "#10b981"}
                    />
                    <Text
                      style={[
                        s.batteryText,
                        { color: member.vitals.battery < 20 ? "#ef4444" : "#10b981" },
                      ]}
                    >
                      {member.vitals.battery}%
                    </Text>
                  </View>
                </View>

                {/* Vitals row */}
                <View style={s.memberVitalsRow}>
                  <View style={s.vitalPill}>
                    <Ionicons name="heart" size={14} color="#ef4444" />
                    <Text style={s.vitalPillText}>{member.vitals.heartRate} BPM</Text>
                  </View>
                  <View style={s.vitalPill}>
                    <Ionicons name="footsteps" size={14} color="#00bcd4" />
                    <Text style={s.vitalPillText}>{member.vitals.steps} Steps</Text>
                  </View>
                  <View style={[s.vitalPill, { backgroundColor: member.medicineTaken ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }]}>
                    <Ionicons
                      name={member.medicineTaken ? "checkmark-circle" : "alert-circle"}
                      size={14}
                      color={member.medicineTaken ? "#10b981" : "#ef4444"}
                    />
                    <Text
                      style={[
                        s.vitalPillText,
                        { color: member.medicineTaken ? "#10b981" : "#ef4444" },
                      ]}
                    >
                      {member.medicineTaken ? "Meds Taken" : "Meds Missed!"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Medical Family Documents Vault (Med Family Doc) */}
            <View style={s.familyHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={s.sectionHeader}>Med Family Documents</Text>
                {!isVip && <PremiumBadge />}
              </View>
              <Pressable
                style={s.addDocBtn}
                onPress={() => {
                  if (checkAndGate("unlimited_medical_vault", "Medical Cloud Vault")) {
                    setUploadDocModalVisible(true);
                  }
                }}
              >
                <Ionicons name="cloud-upload" size={14} color="#00bcd4" style={{ marginRight: 4 }} />
                <Text style={s.addDocBtnText}>+ Upload Doc</Text>
              </Pressable>
            </View>

            {/* Category Pills for Med Docs (Page 3 Notebook) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {[
                { id: "insurance", label: "Insurance POC" },
                { id: "prescription", label: "Prescription POC" },
                { id: "scan", label: "Scan Reports" },
                { id: "vaccine", label: "Vaccine Card" },
                { id: "health_card", label: "Health Card" },
                { id: "discharge", label: "Discharge Summary" },
                { id: "lab_test", label: "Lab Test Reports" },
                { id: "doc_notes", label: "Doctor Notes" },
              ].map((c) => (
                <Pressable
                  key={c.id}
                  style={[s.docChip, selectedDocCategory === c.id && s.docChipActive]}
                  onPress={() => setSelectedDocCategory(c.id)}
                >
                  <Text style={[s.docChipText, selectedDocCategory === c.id && s.docChipTextActive]}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Document Vault Items */}
            {[
              { name: "Family Floater Policy - Star Health", category: "Insurance POC", date: "Jan 2026", size: "1.8 MB PDF" },
              { name: "Cardiologist Consultation Prescription", category: "Prescription POC", date: "Feb 2026", size: "840 KB JPG" },
              { name: "COVID & Flu Vaccination Certificates", category: "Vaccine Card", date: "Dec 2025", size: "2.1 MB PDF" },
              { name: "Comprehensive Lipid & Blood Profile", category: "Lab Test Reports", date: "Mar 2026", size: "1.4 MB PDF" },
            ].map((doc, idx) => (
              <View key={idx} style={s.docCard}>
                <View style={s.docIcon}>
                  <Ionicons name="document-text" size={20} color="#00bcd4" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.docName}>{doc.name}</Text>
                  <Text style={s.docMeta}>{doc.category} • {doc.date} • {doc.size}</Text>
                </View>
                <Pressable
                  style={s.shareDocBtn}
                  onPress={() => Alert.alert("Share", "Generating secure 1-tap doctor sharing link...")}
                >
                  <Ionicons name="share-social-outline" size={18} color="#00bcd4" />
                </Pressable>
              </View>
            ))}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Family Member Modal */}
      <Modal
        visible={addMemberModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddMemberModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.addMemberCard}>
            <Text style={s.modalTitle}>Add Family Member</Text>
            <Text style={s.modalSubtitle}>Link by phone number for live vitals and safety alerts</Text>

            <TextInput
              style={s.modalInput}
              placeholder="Full Name (e.g. Grandma Helen)"
              placeholderTextColor="#94a3b8"
              value={newMemberName}
              onChangeText={setNewMemberName}
            />
            <TextInput
              style={s.modalInput}
              placeholder="Phone Number (e.g. +91 98401 23456)"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
            />
            <TextInput
              style={s.modalInput}
              placeholder="Relationship (e.g. Mother, Father, Spouse)"
              placeholderTextColor="#94a3b8"
              value={newMemberRelation}
              onChangeText={setNewMemberRelation}
            />

            <View style={s.modalActionRow}>
              <Pressable
                style={[s.modalBtn, s.modalCancelBtn]}
                onPress={() => setAddMemberModalVisible(false)}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[s.modalBtn, s.modalSaveBtn]}
                onPress={handleAddFamilyMember}
              >
                <Text style={s.modalSaveText}>Save Member</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        visible={uploadDocModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUploadDocModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.addMemberCard}>
            <Text style={s.modalTitle}>Upload Medical Document</Text>
            <Text style={s.modalSubtitle}>Store Insurance, Prescriptions, Lab Reports securely</Text>

            <Pressable
              style={s.filePickerBtn}
              onPress={() => {
                setUploadDocModalVisible(false);
                Alert.alert("Success", "Medical document securely encrypted and uploaded to Cloud Vault.");
              }}
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#00bcd4" />
              <Text style={s.filePickerText}>Select PDF or Image from device</Text>
            </Pressable>

            <Pressable
              style={[s.modalBtn, s.modalCancelBtn, { marginTop: 12 }]}
              onPress={() => setUploadDocModalVisible(false)}
            >
              <Text style={s.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Fake Call Simulator Component */}
      <FakeCallModal
        visible={fakeCallVisible}
        onDismiss={() => setFakeCallVisible(false)}
        callerName="Emergency Police / Mom"
      />

      {/* Subscription Paywall Modal */}
      <SubscriptionModal
        visible={isModalVisible}
        featureName={modalTriggerFeature}
        onClose={closeUpgradeModal}
        onSuccess={() => Alert.alert("Welcome VIP", "Urban VIP activated successfully!")}
      />

      {/* Fixed Bottom Navigation */}
      <SamsungBottomNav activeRoute="FamilyDashboard" />
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
    paddingTop: 50,
    paddingBottom: 10,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff", letterSpacing: -0.3 },
  pageSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  sosQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  sosQuickText: { color: "#ffffff", fontWeight: "800", fontSize: 12 },
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
  subTabsWrap: { marginBottom: 12 },
  subTabsList: { paddingHorizontal: 16, gap: 8 },
  subTabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  subTabBtnActive: {
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    borderColor: "#00bcd4",
  },
  subTabText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  subTabTextActive: { color: "#00bcd4", fontWeight: "700" },
  scrollContent: { paddingHorizontal: 16 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 12,
    marginBottom: 10,
  },

  // SOS Hero Card
  sosHeroCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sosHeroTop: { flexDirection: "row", alignItems: "center" },
  sosIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sosHeroTitle: { fontSize: 16, fontWeight: "800", color: "#ffffff" },
  sosHeroSubtitle: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  sosHeroAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
  },
  sosHeroActionText: { color: "#dc2626", fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },

  // Tool Cards
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  toolLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  toolIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  toolTitle: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  toolDesc: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  simulateBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  simulateBtnText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },

  // Dark Cards (SOS Msg)
  cardDark: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardDarkTitle: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  cardDarkSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  msgPreviewBox: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
  },
  msgPreviewText: { fontSize: 12, color: "#38bdf8", fontStyle: "italic", lineHeight: 18 },
  testSendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
  },
  testSendBtnText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  idCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  idCardTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  idInfoRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  idLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  idVal: { fontSize: 12, fontWeight: "700", color: "#ffffff" },

  // Nearby Help Cards
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  helpIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  helpTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  helpDesc: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  // Family Members & Docs
  familyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00bcd4",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addMemberBtnText: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  memberCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  memberCardTop: { flexDirection: "row", alignItems: "center" },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,188,212,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  memberName: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  memberRelation: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  batteryWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  batteryText: { fontSize: 12, fontWeight: "700" },
  memberVitalsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  vitalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  vitalPillText: { fontSize: 11, fontWeight: "600", color: "#ffffff" },
  addDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,188,212,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  addDocBtnText: { fontSize: 11, fontWeight: "700", color: "#00bcd4" },
  docChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  docChipActive: { backgroundColor: "#00bcd4", borderColor: "#00bcd4" },
  docChipText: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  docChipTextActive: { color: "#ffffff", fontWeight: "700" },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  docIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: "rgba(0,188,212,0.15)", justifyContent: "center", alignItems: "center" },
  docName: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  docMeta: { fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  shareDocBtn: { padding: 6 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  addMemberCard: { width: "100%", backgroundColor: "#ffffff", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2, marginBottom: 14 },
  modalInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
    marginBottom: 10,
  },
  modalActionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalCancelBtn: { backgroundColor: "#f1f5f9" },
  modalCancelText: { color: "#64748b", fontWeight: "700", fontSize: 13 },
  modalSaveBtn: { backgroundColor: "#00bcd4" },
  modalSaveText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  filePickerBtn: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#00bcd4",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  filePickerText: { fontSize: 13, color: "#00bcd4", fontWeight: "600", marginTop: 8 },
});
