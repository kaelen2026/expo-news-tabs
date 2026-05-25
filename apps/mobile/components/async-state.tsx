import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useAppTheme } from "../contexts/app-theme";

type AsyncStateProps = {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function AsyncState({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  loadingLabel = "Loading…",
  emptyLabel = "Nothing here yet.",
  onRetry,
  children,
}: AsyncStateProps) {
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <ActivityIndicator color={colors.accent} />
        <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
          {loadingLabel}
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ alignItems: "center", gap: 10, padding: 24 }}>
        <Text
          selectable
          style={{ color: colors.text, fontSize: 16, fontWeight: "700", textAlign: "center" }}
        >
          Failed to load
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
          {errorMessage ?? "Something went wrong."}
        </Text>
        {onRetry && (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => ({
              backgroundColor: colors.accent,
              borderRadius: 8,
              opacity: pressed ? 0.8 : 1,
              paddingHorizontal: 18,
              paddingVertical: 10,
            })}
          >
            <Text style={{ color: colors.background, fontSize: 14, fontWeight: "700" }}>
              Try again
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={{ alignItems: "center", padding: 24 }}>
        <Text selectable style={{ color: colors.muted, fontSize: 15, textAlign: "center" }}>
          {emptyLabel}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
