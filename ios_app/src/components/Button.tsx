import React from "react";
import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

type Props = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: "bg-brand-blue active:opacity-80",
    text: "text-white",
  },
  secondary: {
    container: "bg-surface-card border border-border-subtle active:opacity-80",
    text: "text-white",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-brand-blue",
  },
};

/** Pill-shaped CTA button matching the design system's rounded-full buttons. */
export function Button({ label, variant = "primary", loading, fullWidth = true, ...rest }: Props) {
  const styles = variantStyles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-pill items-center justify-center py-4 px-6 ${fullWidth ? "w-full" : ""} ${styles.container}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`font-heading-semibold text-base ${styles.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
