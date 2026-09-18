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
  markNoticeAsRead,
  markAllNoticesAsRead,
  clearAllNotices,
} from "@/services/notificationService";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

export default function NotificationsScreen({ navigation }: Props) {
  const [notices, setNotices] = useState<InAppNotice[]>([]);
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

  const handlePressNotice = async (item: InAppNotice) => {
    setSelectedNotice(item);
    if (!item.isRead) {
      await markNoticeAsRead(item.id);
      setNotices((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNoticesAsRead();
    setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notices.filter((n) => !n.isRead).length;

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

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notifications & Notices</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllBtnText}>Read all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRightSpace} />
        )}
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
        {notices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-outline" size={42} color="rgba(255, 255, 255, 0.3)" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              You're all caught up! Real-time alerts, medicine reminders, and service updates will appear here.
            </Text>
          </View>
        ) : (
          notices.map((item, index) => {
            const isUnread = !item.isRead;
            const isImportant = item.tag?.includes("Important") || item.tag?.includes("Emergency");

            return (
              <TouchableOpacity
                key={item.id || index}
                style={[
                  styles.noticeRow,
                  isUnread ? styles.noticeRowUnread : styles.noticeRowRead,
                ]}
                onPress={() => handlePressNotice(item)}
                activeOpacity={0.7}
              >
                {/* Unread indicator dot */}
                {isUnread && <View style={styles.unreadDot} />}

                <View style={styles.noticeTextCol}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.noticeTitle,
                        isUnread ? styles.titleUnread : styles.titleRead,
                        isImportant && styles.importantNoticeTitle,
                      ]}
                      numberOfLines={1}
                    >
                      <Text
                        style={[
                          styles.noticeTag,
                          isUnread ? styles.tagUnread : styles.tagRead,
                        ]}
                      >
                        {item.tag}{" "}
                      </Text>
                      {item.title}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.noticeDate,
                      isUnread ? styles.dateUnread : styles.dateRead,
                    ]}
                  >
                    {item.date}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

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
                <Text style={styles.modalTagText}>{selectedNotice?.tag || "[Notice]"}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedNotice(null)}>
                <Ionicons name="close-circle" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{selectedNotice?.title}</Text>
            <Text style={styles.modalDate}>{selectedNotice?.date}</Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalBody}>
              {selectedNotice?.body || "No additional details available."}
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
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  unreadCountBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadCountText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  markAllBtnText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  headerRightSpace: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    lineHeight: 19,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  noticeRowUnread: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderBottomColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  noticeRowRead: {
    backgroundColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00e676",
    marginRight: 10,
    shadowColor: "#00e676",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeTextCol: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  noticeTitle: {
    fontSize: 14.5,
    letterSpacing: 0.15,
    lineHeight: 20,
  },
  titleUnread: {
    color: "#ffffff",
    fontWeight: "700",
  },
  titleRead: {
    color: "rgba(255, 255, 255, 0.48)",
    fontWeight: "400",
  },
  importantNoticeTitle: {
    color: "#fb7185",
    fontWeight: "700",
  },
  noticeTag: {
    fontWeight: "700",
  },
  tagUnread: {
    color: "#10b981",
  },
  tagRead: {
    color: "rgba(255, 255, 255, 0.35)",
  },
  noticeDate: {
    fontSize: 12,
    marginTop: 4,
  },
  dateUnread: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  dateRead: {
    color: "rgba(255, 255, 255, 0.25)",
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
