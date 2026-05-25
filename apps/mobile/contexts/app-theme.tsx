import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

const lightColors = {
  accent: "#0f766e",
  accentSoft: "#e0f2f1",
  background: "#f7faf9",
  border: "#d8dedb",
  card: "#ffffff",
  imagePlaceholder: "#dce5e2",
  muted: "#4b5563",
  mutedSoft: "#697177",
  tagBorder: "#99d4ce",
  tagText: "#0f5f59",
  text: "#111827",
};

const darkColors = {
  accent: "#5eead4",
  accentSoft: "#123f3d",
  background: "#081413",
  border: "#254542",
  card: "#10201f",
  imagePlaceholder: "#203b39",
  muted: "#c4cfcc",
  mutedSoft: "#9fb0ad",
  tagBorder: "#25746d",
  tagText: "#a7f3d0",
  text: "#f3faf8",
};

export const layoutTokens = {
  borderWidth: {
    hairline: 1,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 18,
    pill: 999,
  },
  size: {
    iconFrame: 38,
  },
  space: {
    xxs: 3,
    xs: 4,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 18,
    rowY: 14,
  },
};

type AppTheme = {
  colors: typeof lightColors;
  darkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
  tokens: typeof layoutTokens;
};

export type ThemeMode = "system" | "light" | "dark";

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const darkMode = themeMode === "system" ? systemScheme === "dark" : themeMode === "dark";
  const colors = darkMode ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, darkMode, setThemeMode, themeMode, tokens: layoutTokens }),
    [colors, darkMode, themeMode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return theme;
}
