import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";
import {
  InAppNotice,
  getInAppNotices,
  DEFAULT_NOTICES,
} from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

export default function NotificationsScreen({ navigation }: Props) {
  const [notices, setNotices] = useState<InAppNotice[]>(DEFAULT_NOTICES);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<InAppNotice | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const items = await getInAppNotices();
      setNotices(items);
    } catch (e) {
      console.warn("Failed to load notices", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* ── Top Header with Back Button ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications & Notices</Text>
        <View style={styles.headerRightSpace} />
      </View>

      {/* ── Notices List ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
          />
        }
      >
        {notices.map((item, index) => {
          const isImportant = item.tag?.includes("Important");
          return (
            <TouchableOpacity
              key={item.id || index}
              style={styles.noticeRow}
              onPress={() => setSelectedNotice(item)}
              activeOpacity={0.65}
            >
              <View style={styles.noticeTextCol}>
                <Text
                  style={[
                    styles.noticeTitle,
                    isImportant && styles.importantNoticeTitle,
                  ]}
                  numberOfLines={1}
                >
                  <Text style={styles.noticeTag}>{item.tag} </Text>
                  {item.title}
                </Text>

                <Text style={styles.noticeDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* ── Notice Detail Modal ── */}
      <Modal
        visible={!!selectedNotice}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotice(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setSelectedNotice(null)}
          />

          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTagBadge}>
                <Text style={styles.modalTagText}>{selectedNotice?.tag}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedNotice(null)}>
                <Ionicons name="close-circle" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{selectedNotice?.title}</Text>
            <Text style={styles.modalDate}>{selectedNotice?.date}</Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalBody}>
              {selectedNotice?.body ||
                "Official announcement and health system update from the Urban Helpers engineering and medical advisory board."}
            </Text>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedNotice(null)}
            >
              <Text style={styles.modalCloseBtnText}>Close Notice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  headerRightSpace: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  noticeRow: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  noticeTextCol: {
    justifyContent: "center",
  },
  noticeTitle: {
    fontSize: 14.5,
    fontWeight: "500",
    color: "#e2e8f0",
    letterSpacing: 0.15,
    lineHeight: 20,
  },
  importantNoticeTitle: {
    color: "#ffffff",
    fontWeight: "600",
  },
  noticeTag: {
    color: "#94a3b8",
    fontWeight: "600",
  },
  noticeDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 5,
    fontWeight: "400",
  },
  bottomSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#161922",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTagBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalTagText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 22,
  },
  modalDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 14,
  },
  modalBody: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 21,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
