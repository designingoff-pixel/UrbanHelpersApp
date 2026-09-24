import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  card: string;
  cardAlt: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  inputBorder: string;
  primary: string;
  accent: string;
  divider: string;
  navBg: string;
  navBorder: string;
  badgeBg: string;
  statusBar: "light" | "dark";
}

const darkColors: ThemeColors = {
  isDark: true,
  background: "#0c0e14",
  surface: "#141822",
  card: "#1a2130",
  cardAlt: "#222a3c",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  cardShadow: "rgba(0, 0, 0, 0.5)",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  inputBg: "rgba(255, 255, 255, 0.07)",
  inputBorder: "rgba(255, 255, 255, 0.12)",
  primary: "#00c6aa",
  accent: "#38bdf8",
  divider: "rgba(255, 255, 255, 0.08)",
  navBg: "#111622",
  navBorder: "rgba(255, 255, 255, 0.1)",
  badgeBg: "rgba(255, 255, 255, 0.12)",
  statusBar: "light",
};

const lightColors: ThemeColors = {
  isDark: false,
  background: "#f4f6f9",
  surface: "#ffffff",
  card: "#ffffff",
  cardAlt: "#f8fafc",
  cardBorder: "#e2e8f0",
  cardShadow: "rgba(0, 0, 0, 0.06)",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  inputBg: "#ffffff",
  inputBorder: "#e2e8f0",
  primary: "#059669",
  accent: "#0284c7",
  divider: "#e2e8f0",
  navBg: "#ffffff",
  navBorder: "#e2e8f0",
  badgeBg: "#e2e8f0",
  statusBar: "dark",
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = "@urban_helpers_theme_mode_v1";

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  colors: darkColors,
  setTheme: async () => {},
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setThemeState(saved);
        }
      } catch (e) {
        console.log("Error loading theme preference:", e);
      }
    })();
  }, []);

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.log("Error saving theme:", e);
    }
  };

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    await setTheme(next);
  };

  const colors = theme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        colors,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
