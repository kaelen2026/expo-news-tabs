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

type AppTheme = {
  colors: typeof lightColors;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
};

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemScheme === "dark");
  const colors = darkMode ? darkColors : lightColors;

  const value = useMemo(() => ({ colors, darkMode, setDarkMode }), [colors, darkMode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return theme;
}
