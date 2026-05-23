import { Stack } from "expo-router";
import { Bell, Monitor, Moon, Smartphone, Sun } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { type ThemeMode, useAppTheme } from "../contexts/app-theme";

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
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        paddingVertical: 14,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.accentSoft,
          borderCurve: "continuous",
          borderRadius: 8,
          height: 38,
          justifyContent: "center",
          width: 38,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: "800" }}>
          {title}
        </Text>
        <Text selectable style={{ color: colors.mutedSoft, fontSize: 14, lineHeight: 20 }}>
          {description}
        </Text>
      </View>
      {control}
    </View>
  );
}

const themeOptions: { label: string; mode: ThemeMode }[] = [
  { label: "System", mode: "system" },
  { label: "Light", mode: "light" },
  { label: "Dark", mode: "dark" },
];

export default function SettingsScreen() {
  const { colors, darkMode, setThemeMode, themeMode } = useAppTheme();
  const appearanceDescription =
    themeMode === "system"
      ? `Following system appearance (${darkMode ? "dark" : "light"})`
      : themeMode === "dark"
        ? "Dark appearance is enabled"
        : "Light appearance is enabled";

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background, flex: 1 }}
      contentContainerStyle={{
        backgroundColor: colors.background,
        flexGrow: 1,
        gap: 18,
        padding: 16,
      }}
    >
      <Stack.Screen options={{ title: "Settings" }} />

      <View style={{ gap: 6 }}>
        <Text selectable style={{ color: colors.text, fontSize: 30, fontWeight: "900" }}>
          Settings
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
          Tune the reading experience for your day and your eyes.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 8,
          borderWidth: 1,
          paddingHorizontal: 16,
        }}
      >
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
        <View
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderCurve: "continuous",
            borderRadius: 8,
            borderWidth: 1,
            flexDirection: "row",
            marginBottom: 16,
            overflow: "hidden",
            padding: 3,
          }}
        >
          {themeOptions.map((option) => {
            const selected = option.mode === themeMode;

            return (
              <Pressable
                accessibilityLabel={`Use ${option.label} appearance`}
                accessibilityRole="button"
                key={option.mode}
                onPress={() => setThemeMode(option.mode)}
                style={({ pressed }) => ({
                  alignItems: "center",
                  backgroundColor: selected ? colors.accentSoft : "transparent",
                  borderCurve: "continuous",
                  borderRadius: 6,
                  flex: 1,
                  opacity: pressed ? 0.68 : 1,
                  paddingVertical: 10,
                })}
              >
                <Text
                  selectable
                  style={{
                    color: selected ? colors.tagText : colors.mutedSoft,
                    fontSize: 14,
                    fontWeight: "800",
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 8,
          borderWidth: 1,
          paddingHorizontal: 16,
        }}
      >
        <SettingsRow
          icon={<Bell color={colors.accent} size={21} strokeWidth={2.2} />}
          title="Breaking News"
          description="Receive important story alerts"
        />
        <View style={{ backgroundColor: colors.border, height: 1 }} />
        <SettingsRow
          icon={<Smartphone color={colors.accent} size={21} strokeWidth={2.2} />}
          title="Reading Layout"
          description="Optimized for phone and tablet screens"
        />
      </View>
    </ScrollView>
  );
}
