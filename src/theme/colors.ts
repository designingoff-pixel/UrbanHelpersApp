export const colors = {
  brand: {
    blue: "#004AC6",
    teal: "#006B5F",
  },
  gradients: {
    splash: ["#004AC6", "#006B5F"] as const,
    darkSurface: ["#081826", "#0F2027"] as const,
  },
  surface: {
    dark: "#0B1620",
    darkAlt: "#0F2027",
    card: "#1B2B3B",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#C3C6D7",
    tertiary: "#B4C5FF",
    accent: "#D4E4F9",
    muted: "#6B7280",
    body: "#111827",
  },
  accent: {
    indigo: "#4338CA",
    amber: "#D97706",
    emerald: "#059669",
    teal: "#0D9488",
    blue: "#2563EB",
  },
  danger: "#FFB4AB",
  background: {
    light: "#F7F8FA",
    card: "#FFFFFF",
  },
  border: {
    subtle: "rgba(255,255,255,0.08)",
    light: "#E5E7EB",
  },
} as const;

export type AppColors = typeof colors;
