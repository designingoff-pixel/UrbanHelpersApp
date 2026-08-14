import React from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface GradientCardProps {
  title: string;
  subtitle?: string;
  gradient: readonly [string, string] | readonly [string, string, string];
  onPress?: () => void;
  icon?: string;
  fullWidth?: boolean;
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function GradientCard({
  title,
  subtitle,
  gradient,
  onPress,
  icon,
  fullWidth = false,
  height = 120,
  style,
  children,
}: GradientCardProps) {
  const borderRadius = 30;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            height,
            borderRadius,
            width: fullWidth ? "100%" : undefined,
          },
        ]}
      >
        {/* Gradient overlay effect */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        />

        {/* Content */}
        <View style={styles.content}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon as any} size={24} color="white" />
            </View>
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {children}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: "space-between",
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
});
