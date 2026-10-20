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
  const [filterTab, setFilterTab] = useState<"ALL" | "APPLIANCE" | "ORDERS" | "NOTICES">("ALL");

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

  const filteredNotices = notices.filter((item) => {
    if (filterTab === "APPLIANCE") {
      return (
        item.tag?.includes("Appliance") ||
        item.title?.toLowerCase().includes("chimney") ||
        item.title?.toLowerCase().includes("refrigerator") ||
        item.title?.toLowerCase().includes("ac ") ||
        item.title?.toLowerCase().includes("clean")
      );
    }
    if (filterTab === "ORDERS") {
      return item.tag?.includes("Order") || item.title?.includes("Order") || item.tag?.includes("Booking");
    }
    if (filterTab === "NOTICES") {
      return !item.tag?.includes("Appliance") && !item.tag?.includes("Order");
    }
    return true;
  });

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

      {/* ── Filter Tabs ── */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterTab === "ALL" && styles.filterChipActive]}
          onPress={() => setFilterTab("ALL")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, filterTab === "ALL" && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterTab === "APPLIANCE" && styles.filterChipActive]}
          onPress={() => setFilterTab("APPLIANCE")}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={12} color={filterTab === "APPLIANCE" ? "#fff" : "#94A3B8"} style={{ marginRight: 4 }} />
          <Text style={[styles.filterChipText, filterTab === "APPLIANCE" && styles.filterChipTextActive]}>Appliance Care</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterTab === "ORDERS" && styles.filterChipActive]}
          onPress={() => setFilterTab("ORDERS")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, filterTab === "ORDERS" && styles.filterChipTextActive]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterTab === "NOTICES" && styles.filterChipActive]}
          onPress={() => setFilterTab("NOTICES")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, filterTab === "NOTICES" && styles.filterChipTextActive]}>Updates</Text>
        </TouchableOpacity>
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
        {filteredNotices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-outline" size={42} color="rgba(255, 255, 255, 0.3)" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              {filterTab === "APPLIANCE"
                ? "No appliance reminders at the moment. Repeat maintenance alerts will appear here."
                : "You're all caught up! Real-time alerts, medicine reminders, and service updates will appear here."}
            </Text>
          </View>
        ) : (
          filteredNotices.map((item, index) => {
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

            {selectedNotice?.tag?.includes("Appliance") ||
            selectedNotice?.title?.toLowerCase().includes("chimney") ||
            selectedNotice?.title?.toLowerCase().includes("refrigerator") ||
            selectedNotice?.title?.toLowerCase().includes("clean") ? (
              <TouchableOpacity
                style={styles.modalBookBtn}
                onPress={() => {
                  setSelectedNotice(null);
                  navigation.navigate("ServicesDashboard");
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.modalBookBtnText}>Book Repeat Cleaning Service</Text>
              </TouchableOpacity>
            ) : null}

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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  filterChipActive: {
    backgroundColor: "#059669",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  unreadCountBadge: {
    backgroundColor: "#10b981",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadCountText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllBtnText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "600",
  },
  headerRightSpace: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 6,
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
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  noticeRowUnread: {
    backgroundColor: "rgba(16, 185, 129, 0.06)",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  noticeRowRead: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 10,
  },
  noticeTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    lineHeight: 19,
  },
  titleUnread: {
    color: "#ffffff",
    fontWeight: "600",
  },
  titleRead: {
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "400",
  },
  importantNoticeTitle: {
    color: "#f87171",
  },
  noticeTag: {
    fontSize: 11,
    fontWeight: "700",
  },
  tagUnread: {
    color: "#10b981",
  },
  tagRead: {
    color: "rgba(255, 255, 255, 0.35)",
  },
  noticeDate: {
    fontSize: 11.5,
  },
  dateUnread: {
    color: "rgba(255, 255, 255, 0.45)",
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
  modalBookBtn: {
    backgroundColor: "#059669",
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  modalBookBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  modalCloseBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
