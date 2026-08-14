/**
 * Luminous Nocturne Design System (Samsung Health 2026)
 * Deep navy foundation with vibrant primary/secondary for modern, premium feel
 */
export const colors = {
  // Surface colors - Layered depth structure
  surface: {
    dim: "#041423", // Floor level - darkest background
    default: "#041423",
    bright: "#2b3b4b", // Raised surfaces
    container: "#112130", // Primary card background
    containerLow: "#0c1d2c",
    containerHigh: "#1b2b3b",
    containerHighest: "#263646",
  },

  // Text colors
  text: {
    primary: "#d4e4f9", // On-surface (main text)
    secondary: "#c3c6d7", // On-surface-variant (secondary text)
    tertiary: "#b4c5ff", // Primary color (accents, emphasis)
    muted: "#8d90a0", // Outline
    subtle: "#434655", // Outline-variant
    inverse: "#223242",
  },

  // Primary brand colors
  primary: "#b4c5ff",
  primaryContainer: "#2563eb",
  onPrimary: "#002a78",
  onPrimaryContainer: "#eeefff",
  inversePrimary: "#0053db",

  // Secondary colors
  secondary: "#4fdbc8",
  secondaryContainer: "#04b4a2",
  onSecondary: "#003731",
  onSecondaryContainer: "#003f38",

  // Tertiary (accent)
  tertiary: "#d2bbff",
  tertiaryContainer: "#8343f4",
  onTertiary: "#3f008e",
  onTertiaryContainer: "#f7edff",

  // Error states
  error: "#ffb4ab",
  errorContainer: "#93000a",
  onError: "#690005",
  onErrorContainer: "#ffdad6",

  // Fixed colors
  primaryFixed: "#dbe1ff",
  primaryFixedDim: "#b4c5ff",
  onPrimaryFixed: "#00174b",
  onPrimaryFixedVariant: "#003ea8",
  secondaryFixed: "#71f8e4",
  secondaryFixedDim: "#4fdbc8",
  onSecondaryFixed: "#00201c",
  tertiaryFixed: "#eaddff",
  tertiaryFixedDim: "#d2bbff",

  // Background
  background: "#041423",
  onBackground: "#d4e4f9",
  inverseSurface: "#d4e4f9",
  inverseOnSurface: "#223242",
  surfaceTint: "#b4c5ff",

  // Gradients for feature cards
  gradients: {
    splash: ["#004AC6", "#006B5F"],
    hero: ["#0f2027", "#203a43", "#2c5364"],
    energy: ["#1e3a8a", "#38bdf8"], // Blue
    heart: ["#be185d", "#7e22ce"], // Pink to purple
    sleep: ["#4338ca", "#8b5cf6"], // Indigo to violet
    nutrition: ["#ea580c", "#d97706"], // Orange to amber
    medication: ["#059669", "#10b981"], // Green
    home: ["#0d9488", "#14b8a6"], // Teal
    family: ["#d97706", "#f59e0b"], // Golden
    emergency: ["#b91c1c", "#ef4444"], // Red
  },

  // Glass effect
  glass: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "rgba(255, 255, 255, 0.1)",
    borderSubtle: "rgba(255, 255, 255, 0.05)",
  },

  // Shadows and glows
  shadow: {
    glass: "0px 20px 40px rgba(0, 0, 0, 0.4)",
    glowPrimary: "0 0 15px rgba(180, 197, 255, 0.3)",
    glowFab: "0 10px 25px -5px rgba(139, 92, 246, 0.5)",
    glowActive: "0 0 20px rgba(255, 255, 255, 0.1)",
    glowEmergency: "0 0 20px rgba(239, 68, 68, 0.4)",
  },

  // Utility
  border: {
    subtle: "rgba(255, 255, 255, 0.08)",
    light: "rgba(255, 255, 255, 0.1)",
    medium: "rgba(255, 255, 255, 0.15)",
  },

  // Legacy compatibility
  brand: {
    blue: "#b4c5ff",
    teal: "#4fdbc8",
  },

  accent: {
    indigo: "#4338CA",
    amber: "#D97706",
    emerald: "#059669",
    teal: "#0D9488",
    blue: "#2563EB",
  },

  danger: "#ffb4ab",
  background_legacy: {
    light: "#F7F8FA",
    card: "#FFFFFF",
  },
} as const;

export type AppColors = typeof colors;
