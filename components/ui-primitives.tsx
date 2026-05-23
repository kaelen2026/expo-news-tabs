import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { layoutTokens, useAppTheme } from "../contexts/app-theme";

export function ScreenScroll({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.screenContent, { backgroundColor: colors.background }]}
    >
      {children}
    </ScrollView>
  );
}

export function PageIntro({ subtitle, title }: { subtitle: string; title: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.pageIntro}>
      <Text selectable style={[styles.pageIntroTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text selectable style={[styles.pageIntroSubtitle, { color: colors.muted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

export function Surface({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function IconFrame({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.iconFrame,
        {
          backgroundColor: colors.accentSoft,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function Divider() {
  const { colors } = useAppTheme();

  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

export function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  value: T;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.segmentedControl,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityLabel={`Use ${option.label} appearance`}
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentedOption,
              {
                backgroundColor: selected ? colors.accentSoft : "transparent",
                opacity: pressed ? 0.68 : 1,
              },
            ]}
          >
            <Text
              selectable
              style={[
                styles.segmentedOptionText,
                {
                  color: selected ? colors.tagText : colors.mutedSoft,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: layoutTokens.borderWidth.hairline,
  },
  iconFrame: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: layoutTokens.radius.md,
    height: layoutTokens.size.iconFrame,
    justifyContent: "center",
    width: layoutTokens.size.iconFrame,
  },
  pageIntro: {
    gap: layoutTokens.space.sm,
  },
  pageIntroSubtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  pageIntroTitle: {
    fontSize: 30,
    fontWeight: "900",
  },
  screen: {
    flex: 1,
  },
  screenContent: {
    flexGrow: 1,
    gap: layoutTokens.space.xl,
    padding: layoutTokens.space.lg,
  },
  segmentedControl: {
    borderCurve: "continuous",
    borderRadius: layoutTokens.radius.md,
    borderWidth: layoutTokens.borderWidth.hairline,
    flexDirection: "row",
    marginBottom: layoutTokens.space.lg,
    overflow: "hidden",
    padding: layoutTokens.space.xxs,
  },
  segmentedOption: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: layoutTokens.radius.sm,
    flex: 1,
    paddingVertical: 10,
  },
  segmentedOptionText: {
    fontSize: 14,
    fontWeight: "800",
  },
  surface: {
    borderCurve: "continuous",
    borderRadius: layoutTokens.radius.md,
    borderWidth: layoutTokens.borderWidth.hairline,
    paddingHorizontal: layoutTokens.space.lg,
  },
});
