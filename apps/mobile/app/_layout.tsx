import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";

import { AppThemeProvider, useAppTheme } from "../contexts/app-theme";
import { TrpcProvider } from "../lib/trpc";

export default function RootLayout() {
  return (
    <TrpcProvider>
      <AppThemeProvider>
        <RootStack />
      </AppThemeProvider>
    </TrpcProvider>
  );
}

function RootStack() {
  const { colors, darkMode } = useAppTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="news/[id]" options={{ title: "Story" }} />
        <Stack.Screen
          name="settings"
          options={{
            headerTitleAlign: "center",
            title: "Settings",
          }}
        />
      </Stack>
      <StatusBar style={darkMode ? "light" : "dark"} />
    </>
  );
}
