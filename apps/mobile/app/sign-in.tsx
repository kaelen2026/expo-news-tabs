import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAppTheme } from "../contexts/app-theme";
import { useAuth } from "../lib/auth";

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signIn({ email, password });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: colors.background,
        flexGrow: 1,
        gap: 16,
        padding: 24,
      }}
    >
      <Stack.Screen options={{ title: "Sign in" }} />
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Welcome back</Text>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />
      {error ? <Text style={{ color: "#dc2626", fontSize: 14 }}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={onSubmit}
        disabled={busy}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: colors.accent,
          borderRadius: 10,
          opacity: busy ? 0.6 : pressed ? 0.8 : 1,
          paddingVertical: 14,
        })}
      >
        <Text style={{ color: colors.background, fontSize: 16, fontWeight: "800" }}>
          {busy ? "Signing in…" : "Sign in"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push("/sign-up")}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 6 })}
      >
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          No account? <Text style={{ color: colors.accent, fontWeight: "700" }}>Create one</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  const { colors } = useAppTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedSoft}
        {...props}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 10,
          borderWidth: 1,
          color: colors.text,
          fontSize: 16,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      />
    </View>
  );
}
