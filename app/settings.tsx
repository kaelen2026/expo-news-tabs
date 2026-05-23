import { Stack } from "expo-router";
import { Bell, Moon, Smartphone } from "lucide-react-native";
import type { ReactNode } from "react";
import { ScrollView, Switch, Text, View } from "react-native";

import { useAppTheme } from "@/contexts/app-theme";

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

export default function SettingsScreen() {
  const { colors, darkMode, setDarkMode } = useAppTheme();

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
          icon={<Moon color={colors.accent} size={21} strokeWidth={2.2} />}
          title="Dark Mode"
          description={darkMode ? "Dark appearance is enabled" : "Use a light appearance"}
          control={
            <Switch
              onValueChange={setDarkMode}
              thumbColor={darkMode ? colors.accent : "#f4f4f5"}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              value={darkMode}
            />
          }
        />
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
