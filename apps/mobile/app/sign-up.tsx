import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useAppTheme } from "../contexts/app-theme";
import { useAuth } from "../lib/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await signUp({ name, email, password });
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
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
      <Stack.Screen options={{ title: "Create account" }} />
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Create account</Text>
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
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
        textContentType="newPassword"
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
          {busy ? "Creating…" : "Create account"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.replace("/sign-in")}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 6 })}
      >
        <Text style={{ color: colors.muted, fontSize: 14 }}>
          Already have an account?{" "}
          <Text style={{ color: colors.accent, fontWeight: "700" }}>Sign in</Text>
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
