import { Stack } from "expo-router";
import { Bell, Monitor, Moon, Smartphone, Sun } from "lucide-react-native";
import { type ReactNode, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Divider,
  IconFrame,
  PageIntro,
  ScreenScroll,
  SegmentedControl,
  Surface,
} from "../components/ui-primitives";
import { layoutTokens, type ThemeMode, useAppTheme } from "../contexts/app-theme";
import { useAuth } from "../lib/auth";
import { trpc } from "../lib/trpc";

function SettingsRow({
  icon,
  title,
  description,
  control,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  control?: ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.settingsRow}>
      <IconFrame>{icon}</IconFrame>
      <View style={styles.settingsRowText}>
        <Text selectable style={[styles.settingsRowTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text selectable style={[styles.settingsRowDescription, { color: colors.mutedSoft }]}>
          {description}
        </Text>
      </View>
      {control ? <View style={styles.settingsRowControl}>{control}</View> : null}
    </View>
  );
}

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const { colors, darkMode, setThemeMode, themeMode } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const prefsQuery = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });
  const updatePrefs = trpc.preferences.update.useMutation({
    onSuccess: () => utils.preferences.get.invalidate(),
  });

  // Hydrate the local theme from server prefs once after sign-in.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    const serverTheme = prefsQuery.data?.theme as ThemeMode | null | undefined;
    if (isAuthenticated && serverTheme && serverTheme !== themeMode) {
      setThemeMode(serverTheme);
    }
    if (prefsQuery.isSuccess || !isAuthenticated) {
      hydratedRef.current = true;
    }
  }, [prefsQuery.data?.theme, prefsQuery.isSuccess, isAuthenticated, themeMode, setThemeMode]);

  const handleThemeChange = (next: ThemeMode) => {
    setThemeMode(next);
    if (isAuthenticated) {
      updatePrefs.mutate({ theme: next });
    }
  };

  const appearanceDescription =
    themeMode === "system"
      ? `Following system appearance (${darkMode ? "dark" : "light"})`
      : themeMode === "dark"
        ? "Dark appearance is enabled"
        : "Light appearance is enabled";

  return (
    <ScreenScroll>
      <Stack.Screen options={{ title: "Settings" }} />

      <PageIntro
        title="Settings"
        subtitle="Tune the reading experience for your day and your eyes."
      />

      <Surface>
        <SettingsRow
          icon={
            themeMode === "system" ? (
              <Monitor color={colors.accent} size={21} strokeWidth={2.2} />
            ) : themeMode === "dark" ? (
              <Moon color={colors.accent} size={21} strokeWidth={2.2} />
            ) : (
              <Sun color={colors.accent} size={21} strokeWidth={2.2} />
            )
          }
          title="Appearance"
          description={appearanceDescription}
        />
        <SegmentedControl options={themeOptions} value={themeMode} onChange={handleThemeChange} />
        {isAuthenticated ? (
          <Text style={{ color: colors.mutedSoft, fontSize: 12, marginTop: 6 }}>
            Synced to your account
          </Text>
        ) : null}
      </Surface>

      <Surface>
        <SettingsRow
          icon={<Bell color={colors.accent} size={21} strokeWidth={2.2} />}
          title="Breaking News"
          description="Receive important story alerts"
        />
        <Divider />
        <SettingsRow
          icon={<Smartphone color={colors.accent} size={21} strokeWidth={2.2} />}
          title="Reading Layout"
          description="Optimized for phone and tablet screens"
        />
      </Surface>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  settingsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: layoutTokens.space.md,
    paddingVertical: layoutTokens.space.rowY,
  },
  settingsRowControl: {
    marginLeft: layoutTokens.space.sm,
  },
  settingsRowDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingsRowText: {
    flex: 1,
    gap: layoutTokens.space.xxs,
  },
  settingsRowTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
});
