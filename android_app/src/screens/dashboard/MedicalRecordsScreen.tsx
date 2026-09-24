import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  Modal,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { RootStackParamList } from "@/navigation/types";
import {
  HealthDocument,
  DocumentCategory,
  DocumentType,
  getHealthDocuments,
  saveHealthDocument,
  deleteHealthDocument,
  downloadOrShareDocument,
  formatBytes,
} from "@/services/healthRecordsService";

type Props = NativeStackScreenProps<RootStackParamList, "MedicalRecords">;
const { width: SW, height: SH } = Dimensions.get("window");

const CATEGORIES: DocumentCategory[] = [
  "Lab Report",
  "Prescription",
  "Doctor Advice",
  "Blood Test",
  "Vaccination",
  "Scan & X-Ray",
  "General",
];

const QUICK_ACCESS = [
  { icon: "analytics", label: "Health Data", route: "HealthDataAnalytics", color: "#3b82f6" },
  { icon: "flask", label: "Lab Reports", route: "LabReportsHub", color: "#ef4444" },
  { icon: "medical", label: "Doctor Advice", route: "DoctorAdvice", color: "#10b981" },
  { icon: "water", label: "Blood Test", route: "BloodTestReports", color: "#dc2626" },
  { icon: "receipt", label: "Prescription", route: "PrescriptionManagement", color: "#8b5cf6" },
  { icon: "shield-checkmark", label: "Vaccination", route: "VaccinationCenter", color: "#0ea5e9" },
];

export default function MedicalRecordsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [showSearch, setShowSearch] = useState(false);

  // Profile data
  const [heightRaw, setHeightRaw] = useState<string | null>(null);
  const [weightRaw, setWeightRaw] = useState<string | null>(null);

  // Upload/Save Modal
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Document Draft State
  const [draftUri, setDraftUri] = useState<string>("");
  const [draftType, setDraftType] = useState<DocumentType>("image");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDate, setDraftDate] = useState(new Date().toISOString().split("T")[0]);
  const [draftCategory, setDraftCategory] = useState<DocumentCategory>("Lab Report");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftFileSize, setDraftFileSize] = useState("Unknown");
  const [draftFileName, setDraftFileName] = useState("");

  // View Document Modal State
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<HealthDocument | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [docs, profileRaw] = await Promise.all([
        getHealthDocuments(),
        AsyncStorage.getItem("@urban_health_user_profile_v2"),
      ]);
      setDocuments(docs);
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw);
        setHeightRaw(parsed.height || null);
        setWeightRaw(parsed.weight || null);
      }
    } catch (e) {
      console.error("Error loading health records:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Calculate BMI
  let bmiValue = "Not Set";
  if (heightRaw && weightRaw) {
    const hNum = parseFloat(heightRaw.replace(/[^0-9.]/g, ""));
    const wNum = parseFloat(weightRaw.replace(/[^0-9.]/g, ""));
    if (!isNaN(hNum) && !isNaN(wNum) && hNum > 0) {
      const hMeters = hNum / 100;
      const bmi = wNum / (hMeters * hMeters);
      let status = "Normal";
      if (bmi < 18.5) status = "Underweight";
      else if (bmi >= 25 && bmi < 30) status = "Overweight";
      else if (bmi >= 30) status = "Obese";
      bmiValue = `${bmi.toFixed(1)} ${status}`;
    }
  }

  // --- Image & Document Handlers ---
  const handleTakePhoto = async () => {
    setPickerModalVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is needed to take document photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const defaultName = `Doc Photo ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        setDraftUri(asset.uri);
        setDraftType("image");
        setDraftTitle(defaultName);
        setDraftDate(new Date().toISOString().split("T")[0]);
        setDraftFileSize(asset.fileSize ? formatBytes(asset.fileSize) : "Photo");
        setDraftFileName(`camera_photo_${Date.now()}.jpg`);
        setDraftNotes("");
        setSaveModalVisible(true);
      }
    } catch (e) {
      console.error("Camera error:", e);
      Alert.alert("Error", "Could not launch camera.");
    }
  };

  const handlePickImage = async () => {
    setPickerModalVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery permission is required to choose photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        const defaultTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setDraftUri(asset.uri);
        setDraftType("image");
        setDraftTitle(defaultTitle || "Medical Image");
        setDraftDate(new Date().toISOString().split("T")[0]);
        setDraftFileSize(asset.fileSize ? formatBytes(asset.fileSize) : "Image File");
        setDraftFileName(fileName);
        setDraftNotes("");
        setSaveModalVisible(true);
      }
    } catch (e) {
      console.error("Gallery picker error:", e);
      Alert.alert("Error", "Could not open image gallery.");
    }
  };

  const handlePickDocument = async () => {
    setPickerModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const isPdf = asset.mimeType?.includes("pdf") || asset.name.toLowerCase().endsWith(".pdf");
        const isImg = asset.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(asset.name);
        
        const docType: DocumentType = isImg ? "image" : isPdf ? "pdf" : "document";
        const defaultTitle = asset.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

        setDraftUri(asset.uri);
        setDraftType(docType);
        setDraftTitle(defaultTitle || "Health Document");
        setDraftDate(new Date().toISOString().split("T")[0]);
        setDraftFileSize(asset.size ? formatBytes(asset.size) : "Document");
        setDraftFileName(asset.name);
        setDraftNotes("");
        setSaveModalVisible(true);
      }
    } catch (e) {
      console.error("Doc picker error:", e);
      Alert.alert("Error", "Could not open document picker.");
    }
  };

  const handleSaveDraft = async () => {
    if (!draftTitle.trim()) {
      Alert.alert("Document Title Required", "Please provide a name or title for this health document.");
      return;
    }

    setIsSaving(true);
    try {
      const created = await saveHealthDocument({
        title: draftTitle.trim(),
        date: draftDate.trim() || new Date().toISOString().split("T")[0],
        category: draftCategory,
        type: draftType,
        uri: draftUri,
        fileSize: draftFileSize,
        originalFileName: draftFileName,
        notes: draftNotes.trim(),
      });

      setDocuments((prev) => [created, ...prev]);
      setSaveModalVisible(false);
      Alert.alert("Saved Successfully", `"${created.title}" has been securely saved to your health vault.`);
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Save Failed", "Could not save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = (doc: HealthDocument) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to permanently delete "${doc.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHealthDocument(doc.id);
              setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
              if (selectedDoc?.id === doc.id) {
                setViewModalVisible(false);
                setSelectedDoc(null);
              }
            } catch {
              Alert.alert("Error", "Failed to delete document.");
            }
          },
        },
      ]
    );
  };

  const handleOpenDoc = (doc: HealthDocument) => {
    setSelectedDoc(doc);
    setViewModalVisible(true);
  };

  const handleShareDoc = async (doc: HealthDocument) => {
    await downloadOrShareDocument(doc);
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchCategory = selectedFilter === "All" || doc.category === selectedFilter;
    const matchQuery =
      searchQuery.trim() === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  const getCategoryColor = (cat: DocumentCategory) => {
    switch (cat) {
      case "Lab Report": return "#ef4444";
      case "Prescription": return "#8b5cf6";
      case "Doctor Advice": return "#10b981";
      case "Blood Test": return "#dc2626";
      case "Vaccination": return "#0ea5e9";
      case "Scan & X-Ray": return "#f59e0b";
      default: return "#3b82f6";
    }
  };

  const getDocIcon = (type: DocumentType, cat: DocumentCategory) => {
    if (type === "image") return "image";
    if (type === "pdf") return "document-text";
    return "document-attach";
  };

  return (
    <View style={s.root}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </Pressable>
        <Text style={s.pageTitle}>Health Records</Text>
        <Pressable onPress={() => setShowSearch(!showSearch)} style={s.iconBtn}>
          <Ionicons name={showSearch ? "close" : "search"} size={20} color="#ffffff" />
        </Pressable>
      </View>

      {/* Search Input Bar (Expandable) */}
      {showSearch && (
        <View style={s.searchBarContainer}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={s.searchInput}
            placeholder="Search by title, category, doctor..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* ── HERO BANNER ───────────────────────────────────────── */}
        <LinearGradient
          colors={["#0c2a47", "#1e1b4b", "#172554"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroContent}>
            <View style={s.heroBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#38bdf8" />
              <Text style={s.heroBadgeText}>SECURE HEALTH VAULT</Text>
            </View>
            <Text style={s.heroTitle}>Your Complete{"\n"}Medical Records</Text>
            <Text style={s.heroSub}>
              {documents.length > 0
                ? `You have ${documents.length} encrypted record${documents.length > 1 ? "s" : ""} saved.`
                : "Securely store photos, reports, and prescriptions in one place."}
            </Text>

            <Pressable style={s.heroBtn} onPress={() => setPickerModalVisible(true)}>
              <Ionicons name="cloud-upload" size={18} color="#ffffff" />
              <Text style={s.heroBtnText}>Upload Document</Text>
            </Pressable>
          </View>
          <View style={s.heroDecor}>
            <Ionicons name="folder-open" size={96} color="rgba(56,189,248,0.18)" />
          </View>
        </LinearGradient>

        {/* ── SAVED DOCUMENTS LIST / VAULT ───────────────────────── */}
        <View style={s.sectionHeaderRow}>
          <View>
            <Text style={s.sectionTitle}>Medical Vault</Text>
            <Text style={s.sectionSub}>View, download, and manage your uploaded files</Text>
          </View>
          <Pressable style={s.addMiniBtn} onPress={() => setPickerModalVisible(true)}>
            <Ionicons name="add" size={18} color="#38bdf8" />
            <Text style={s.addMiniBtnText}>Add</Text>
          </Pressable>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {["All", ...CATEGORIES].map((cat) => {
            const active = selectedFilter === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedFilter(cat)}
                style={[s.filterPill, active && s.filterPillActive]}
              >
                <Text style={[s.filterPillText, active && s.filterPillTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Documents Cards List */}
        {filteredDocuments.length === 0 ? (
          <View style={s.emptyVaultCard}>
            <View style={s.emptyVaultIcon}>
              <Ionicons name="document-text-outline" size={44} color="#475569" />
            </View>
            <Text style={s.emptyVaultTitle}>
              {documents.length === 0 ? "No records uploaded yet" : "No matching records"}
            </Text>
            <Text style={s.emptyVaultSub}>
              {documents.length === 0
                ? "Tap 'Upload Document' to capture a photo or attach a PDF / image report."
                : "Try selecting another category or clear search terms."}
            </Text>
            <Pressable style={s.emptyVaultBtn} onPress={() => setPickerModalVisible(true)}>
              <Ionicons name="camera-outline" size={18} color="#ffffff" />
              <Text style={s.emptyVaultBtnText}>Take Photo or Upload</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.docsList}>
            {filteredDocuments.map((doc) => {
              const catColor = getCategoryColor(doc.category);
              const iconName = getDocIcon(doc.type, doc.category);

              return (
                <Pressable
                  key={doc.id}
                  style={({ pressed }) => [s.docCard, pressed && { opacity: 0.85 }]}
                  onPress={() => handleOpenDoc(doc)}
                >
                  <View style={[s.docIconWrap, { backgroundColor: `${catColor}18` }]}>
                    <Ionicons name={iconName as any} size={24} color={catColor} />
                  </View>

                  <View style={s.docDetails}>
                    <View style={s.docTitleRow}>
                      <Text style={s.docTitle} numberOfLines={1}>
                        {doc.title}
                      </Text>
                    </View>

                    <View style={s.docMetaRow}>
                      <View style={[s.categoryTag, { backgroundColor: `${catColor}20` }]}>
                        <Text style={[s.categoryTagText, { color: catColor }]}>{doc.category}</Text>
                      </View>
                      <Text style={s.docDateText}>📅 {doc.date}</Text>
                      {doc.fileSize && <Text style={s.docSizeText}>• {doc.fileSize}</Text>}
                    </View>

                    {doc.notes ? (
                      <Text style={s.docNotes} numberOfLines={1}>
                        📝 {doc.notes}
                      </Text>
                    ) : null}
                  </View>

                  <View style={s.docActions}>
                    <Pressable
                      style={s.docActionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleShareDoc(doc);
                      }}
                    >
                      <Ionicons name="share-outline" size={18} color="#38bdf8" />
                    </Pressable>
                    <Pressable
                      style={s.docActionBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── QUICK ACCESS SERVICES ────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginTop: 28 }]}>Health Hub Modules</Text>
        <View style={s.quickGrid}>
          {QUICK_ACCESS.map((q) => (
            <Pressable
              key={q.label}
              onPress={() => navigation.navigate(q.route as any)}
              style={({ pressed }) => [s.quickCard, { opacity: pressed ? 0.8 : 1 }]}
            >
              <View style={[s.quickIconWrap, { backgroundColor: `${q.color}18` }]}>
                <Ionicons name={q.icon as any} size={26} color={q.color} />
              </View>
              <Text style={s.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── HEALTH VITALS SUMMARY ────────────────────────────── */}
        <Text style={s.sectionTitle}>Body Vitals & Metrics</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : (
          <View style={s.summaryGrid}>
            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(239,68,68,0.15)" }]}>
                <Ionicons name="heart" size={20} color="#ef4444" />
              </View>
              <Text style={s.summaryLabel}>Blood Group</Text>
              <Text style={[s.summaryValue, { color: "#94a3b8", fontSize: 15 }]}>O+ (Positive)</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                <Ionicons name="barbell" size={20} color="#f59e0b" />
              </View>
              <Text style={s.summaryLabel}>BMI Status</Text>
              <Text style={s.summaryValue}>{bmiValue}</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
                <Ionicons name="resize" size={20} color="#10b981" />
              </View>
              <Text style={s.summaryLabel}>Height</Text>
              <Text style={s.summaryValue}>{heightRaw || "172 cm"}</Text>
            </View>

            <View style={s.summaryCard}>
              <View style={[s.summaryIconWrap, { backgroundColor: "rgba(59,130,246,0.15)" }]}>
                <Ionicons name="speedometer" size={20} color="#3b82f6" />
              </View>
              <Text style={s.summaryLabel}>Weight</Text>
              <Text style={s.summaryValue}>{weightRaw || "68 kg"}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── MODAL 1: PICK SOURCE (CAMERA / GALLERY / PDF) ─────── */}
      <Modal visible={pickerModalVisible} transparent animationType="fade" onRequestClose={() => setPickerModalVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setPickerModalVisible(false)}>
          <Pressable style={s.pickerSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <Text style={s.pickerTitle}>Add Health Document</Text>
            <Text style={s.pickerSub}>Choose how you want to upload your medical report</Text>

            <View style={s.pickerOptionsGrid}>
              <Pressable style={s.pickerOptionCard} onPress={handleTakePhoto}>
                <LinearGradient colors={["#0ea5e9", "#0284c7"]} style={s.pickerOptionIcon}>
                  <Ionicons name="camera" size={28} color="#ffffff" />
                </LinearGradient>
                <Text style={s.pickerOptionTitle}>Take Photo</Text>
                <Text style={s.pickerOptionDesc}>Scan prescription or lab report with camera</Text>
              </Pressable>

              <Pressable style={s.pickerOptionCard} onPress={handlePickImage}>
                <LinearGradient colors={["#8b5cf6", "#7c3aed"]} style={s.pickerOptionIcon}>
                  <Ionicons name="images" size={28} color="#ffffff" />
                </LinearGradient>
                <Text style={s.pickerOptionTitle}>Photo Gallery</Text>
                <Text style={s.pickerOptionDesc}>Upload medical scans or image files</Text>
              </Pressable>

              <Pressable style={s.pickerOptionCard} onPress={handlePickDocument}>
                <LinearGradient colors={["#10b981", "#059669"]} style={s.pickerOptionIcon}>
                  <Ionicons name="document-attach" size={28} color="#ffffff" />
                </LinearGradient>
                <Text style={s.pickerOptionTitle}>PDF / File</Text>
                <Text style={s.pickerOptionDesc}>Attach PDF reports, lab sheets, or docs</Text>
              </Pressable>
            </View>

            <Pressable style={s.cancelSheetBtn} onPress={() => setPickerModalVisible(false)}>
              <Text style={s.cancelSheetText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── MODAL 2: SAVE DOCUMENT DETAILS FORM ────────────────── */}
      <Modal visible={saveModalVisible} transparent animationType="slide" onRequestClose={() => !isSaving && setSaveModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.saveModalContent}>
            <View style={s.saveModalHeader}>
              <Text style={s.saveModalTitle}>Document Details</Text>
              <Pressable onPress={() => !isSaving && setSaveModalVisible(false)} style={s.closeModalBtn}>
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Preview Box */}
              <View style={s.previewCard}>
                {draftType === "image" && draftUri ? (
                  <Image source={{ uri: draftUri }} style={s.previewImage} resizeMode="cover" />
                ) : (
                  <View style={s.previewPdfBox}>
                    <Ionicons name="document-text" size={48} color="#38bdf8" />
                    <Text style={s.previewPdfName} numberOfLines={1}>{draftFileName || "PDF Document"}</Text>
                    <Text style={s.previewPdfSize}>{draftFileSize}</Text>
                  </View>
                )}
              </View>

              {/* Document Name */}
              <Text style={s.inputLabel}>Document Name *</Text>
              <TextInput
                style={s.textInput}
                placeholder="e.g. Blood Test Report, Dr. Smith Prescription"
                placeholderTextColor="#64748b"
                value={draftTitle}
                onChangeText={setDraftTitle}
              />

              {/* Date */}
              <Text style={s.inputLabel}>Document Date (YYYY-MM-DD)</Text>
              <TextInput
                style={s.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748b"
                value={draftDate}
                onChangeText={setDraftDate}
              />

              {/* Category Selector */}
              <Text style={s.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catSelectRow}>
                {CATEGORIES.map((cat) => {
                  const active = draftCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setDraftCategory(cat)}
                      style={[s.catSelectPill, active && s.catSelectPillActive]}
                    >
                      <Text style={[s.catSelectText, active && s.catSelectTextActive]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Notes / Doctor */}
              <Text style={s.inputLabel}>Doctor / Hospital Notes (Optional)</Text>
              <TextInput
                style={[s.textInput, { height: 75, textAlignVertical: "top" }]}
                placeholder="e.g. Prescribed by Dr. Roy for seasonal allergies"
                placeholderTextColor="#64748b"
                value={draftNotes}
                onChangeText={setDraftNotes}
                multiline
              />

              <Pressable
                style={[s.saveSubmitBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text style={s.saveSubmitText}>Save to Health Records</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: VIEW & DOWNLOAD DOCUMENT ──────────────────── */}
      <Modal visible={viewModalVisible} transparent animationType="slide" onRequestClose={() => setViewModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.viewModalContent}>
            <View style={s.saveModalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={s.saveModalTitle} numberOfLines={1}>{selectedDoc?.title || "Document"}</Text>
                <Text style={{ fontSize: 12, color: "#94a3b8" }}>{selectedDoc?.date} • {selectedDoc?.category}</Text>
              </View>
              <Pressable onPress={() => setViewModalVisible(false)} style={s.closeModalBtn}>
                <Ionicons name="close" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              {selectedDoc?.type === "image" && selectedDoc.uri ? (
                <View style={s.fullImageWrap}>
                  <Image source={{ uri: selectedDoc.uri }} style={s.fullDocImage} resizeMode="contain" />
                </View>
              ) : (
                <View style={s.fullDocCard}>
                  <Ionicons name="document-text" size={64} color="#38bdf8" />
                  <Text style={s.docCardName}>{selectedDoc?.originalFileName || selectedDoc?.title}</Text>
                  <Text style={s.docCardSize}>{selectedDoc?.fileSize}</Text>
                  <Text style={s.docCardInfo}>This document is securely stored locally. Tap Download/Share to export or print.</Text>
                </View>
              )}

              {selectedDoc?.notes ? (
                <View style={s.viewNotesBox}>
                  <Text style={s.viewNotesLabel}>Notes & Instructions:</Text>
                  <Text style={s.viewNotesText}>{selectedDoc.notes}</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={s.viewActionsRow}>
                <Pressable
                  style={s.shareBigBtn}
                  onPress={() => selectedDoc && handleShareDoc(selectedDoc)}
                >
                  <Ionicons name="share-social" size={18} color="#ffffff" />
                  <Text style={s.shareBigBtnText}>Download / Share</Text>
                </Pressable>

                <Pressable
                  style={s.deleteBigBtn}
                  onPress={() => selectedDoc && handleDeleteDocument(selectedDoc)}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020813" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pageTitle: { fontSize: 18, fontWeight: "700", color: "#f8fafc", letterSpacing: 0.3 },
  scroll: { paddingHorizontal: 16 },

  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    padding: 0,
  },

  // Hero
  hero: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    minHeight: 220,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
    overflow: "hidden",
  },
  heroContent: { flex: 1, zIndex: 2 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(56,189,248,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: 0.5,
  },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#ffffff", marginBottom: 10, lineHeight: 30, letterSpacing: -0.5 },
  heroSub: { fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 18, fontWeight: "500", maxWidth: "92%" },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0284c7",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    alignSelf: "flex-start",
  },
  heroBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  heroDecor: {
    position: "absolute",
    right: -15,
    bottom: -15,
    opacity: 0.8,
    transform: [{ rotate: "-15deg" }],
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 19, fontWeight: "700", color: "#f8fafc", letterSpacing: 0.2 },
  sectionSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  addMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(56,189,248,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
  },
  addMiniBtnText: { color: "#38bdf8", fontSize: 13, fontWeight: "700" },

  // Filters
  filterRow: {
    gap: 8,
    paddingBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  filterPillActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  filterPillText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Vault Empty State
  emptyVaultCard: {
    backgroundColor: "rgba(15,23,42,0.6)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  emptyVaultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyVaultTitle: { fontSize: 17, fontWeight: "700", color: "#e2e8f0", marginBottom: 6 },
  emptyVaultSub: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 18, marginBottom: 18, maxWidth: "85%" },
  emptyVaultBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
  },
  emptyVaultBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },

  // Docs List
  docsList: {
    gap: 10,
    marginBottom: 24,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.7)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 12,
  },
  docIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  docDetails: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f8fafc",
  },
  docMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  docDateText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  docSizeText: {
    fontSize: 12,
    color: "#64748b",
  },
  docNotes: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontStyle: "italic",
  },
  docActions: {
    flexDirection: "row",
    gap: 6,
  },
  docActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Quick Access
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
    marginTop: 12,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "rgba(15,23,42,0.6)",
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    minHeight: 110,
  },
  quickIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: { fontSize: 13, color: "#e2e8f0", fontWeight: "700", textAlign: "center" },

  // Summary Grid
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "rgba(15,23,42,0.6)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
  },
  summaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "800", color: "#ffffff", letterSpacing: -0.3 },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 16,
  },
  pickerTitle: { fontSize: 19, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 4 },
  pickerSub: { fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 20 },
  pickerOptionsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  pickerOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 14,
  },
  pickerOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerOptionTitle: { fontSize: 15, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  pickerOptionDesc: { fontSize: 12, color: "#94a3b8", maxWidth: "88%" },
  cancelSheetBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cancelSheetText: { fontSize: 15, fontWeight: "700", color: "#cbd5e1" },

  // Save Modal Content
  saveModalContent: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: SH * 0.88,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  saveModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  saveModalTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewCard: {
    height: 140,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPdfBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 10,
  },
  previewPdfName: { color: "#e2e8f0", fontSize: 13, fontWeight: "600", maxWidth: 220 },
  previewPdfSize: { color: "#94a3b8", fontSize: 11 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  catSelectRow: {
    gap: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  catSelectPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  catSelectPillActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  catSelectText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  catSelectTextActive: { color: "#ffffff", fontWeight: "700" },
  saveSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0284c7",
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 18,
  },
  saveSubmitText: { fontSize: 15, fontWeight: "700", color: "#ffffff" },

  // View Modal Content
  viewModalContent: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: SH * 0.9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fullImageWrap: {
    height: 320,
    borderRadius: 20,
    backgroundColor: "#000000",
    overflow: "hidden",
    marginVertical: 12,
  },
  fullDocImage: {
    width: "100%",
    height: "100%",
  },
  fullDocCard: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 10,
  },
  docCardName: { fontSize: 15, fontWeight: "700", color: "#ffffff", textAlign: "center" },
  docCardSize: { fontSize: 12, color: "#94a3b8" },
  docCardInfo: { fontSize: 12, color: "#64748b", textAlign: "center", lineHeight: 16 },
  viewNotesBox: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  viewNotesLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8", marginBottom: 4 },
  viewNotesText: { fontSize: 13, color: "#e2e8f0", lineHeight: 18 },
  viewActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  shareBigBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 16,
  },
  shareBigBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  deleteBigBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
});
