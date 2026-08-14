import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface Module2TopAppBarProps {
  title: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
  showNotification?: boolean;
  hasNotification?: boolean;
}

export function Module2TopAppBar({
  title,
  subtitle,
  onNotificationPress,
  onMenuPress,
  showNotification = true,
  hasNotification = false,
}: Module2TopAppBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <View style={styles.subtitleRow}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={12} color={colors.text.secondary} />
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        )}
        <Text style={styles.caption}>Your companion for healthier living.</Text>
      </View>

      <View style={styles.actions}>
        {showNotification && (
          <Pressable style={styles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
            {hasNotification && <View style={styles.badge} />}
          </Pressable>
        )}
        {onMenuPress && (
          <Pressable style={styles.iconButton} onPress={onMenuPress}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: colors.surface.dim,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.containerHigh,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surface.containerHigh,
  },
});
