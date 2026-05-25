import { Tabs, useRouter } from "expo-router";
import { CircleUserRound, Newspaper, Settings, Star } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { useAppTheme } from "../../contexts/app-theme";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleAlign: "center",
        headerTitleStyle: { color: colors.text, fontSize: 18, fontWeight: "900" },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedSoft,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: () => (
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>
              Morning Brief
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Newspaper color={String(color)} size={22} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitle: () => (
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>Favorites</Text>
          ),
          tabBarIcon: ({ color }) => <Star color={String(color)} size={22} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerRight: () => (
            <Pressable
              accessibilityLabel="Open settings"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => router.push("/settings")}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: colors.accentSoft,
                borderColor: colors.tagBorder,
                borderCurve: "continuous",
                borderRadius: 18,
                borderWidth: 1,
                height: 36,
                justifyContent: "center",
                marginRight: 16,
                opacity: pressed ? 0.65 : 1,
                width: 36,
              })}
            >
              <Settings color={colors.accent} size={19} strokeWidth={2.3} />
            </Pressable>
          ),
          headerTitle: () => (
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>Profile</Text>
          ),
          tabBarIcon: ({ color }) => (
            <CircleUserRound color={String(color)} size={22} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}
