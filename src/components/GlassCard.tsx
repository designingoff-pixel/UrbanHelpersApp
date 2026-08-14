import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface GlassCardProps extends ViewProps {
  blur?: number;
  variant?: "glass" | "solid";
  children: React.ReactNode;
}

export function GlassCard({
  blur = 20,
  variant = "glass",
  style,
  children,
  ...rest
}: GlassCardProps) {
  const styles = StyleSheet.create({
    glassCard: {
      backgroundColor: variant === "glass" ? colors.glass.background : colors.surface.container,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.glass.border,
      padding: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 40,
      elevation: 8,
    },
  });

  return (
    <View style={[styles.glassCard, style]} {...rest}>
      {children}
    </View>
  );
}
