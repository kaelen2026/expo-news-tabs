import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Camera, ChevronRight, Settings } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { type AvatarOption, AvatarPickerModal } from "../../components/avatar-picker-modal";
import { useAppTheme } from "../../contexts/app-theme";

const interests = ["Local", "Science", "Business", "Culture"];
const defaultAvatarUrl =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80";
const avatarOptions: AvatarOption[] = [
  {
    id: "reader",
    imageUrl: defaultAvatarUrl,
  },
  {
    id: "editor",
    imageUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "analyst",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "writer",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
];
const profileStats = [
  { label: "Read", value: "24" },
  { label: "Saved", value: "18" },
  { label: "Streak", value: "7d" },
];

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarUrl);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

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
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 8,
          borderWidth: 1,
          overflow: "hidden",
        }}
      >
        <Image
          source="https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80"
          contentFit="cover"
          style={{ backgroundColor: colors.imagePlaceholder, height: 112, width: "100%" }}
        />
        <View style={{ gap: 16, padding: 16, paddingTop: 0 }}>
          <View style={{ alignItems: "center", gap: 10 }}>
            <Pressable
              accessibilityLabel="Change avatar"
              accessibilityRole="button"
              onPress={() => setAvatarPickerVisible(true)}
              testID="change-avatar"
              style={({ pressed }) => ({
                borderColor: colors.card,
                borderRadius: 48,
                borderWidth: 4,
                height: 96,
                marginTop: -48,
                opacity: pressed ? 0.82 : 1,
                width: 96,
              })}
            >
              <Image
                source={avatarUrl}
                contentFit="cover"
                style={{
                  backgroundColor: colors.imagePlaceholder,
                  borderRadius: 44,
                  height: "100%",
                  width: "100%",
                }}
              />
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: colors.accent,
                  borderColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 3,
                  bottom: -2,
                  height: 32,
                  justifyContent: "center",
                  position: "absolute",
                  right: -2,
                  width: 32,
                }}
              >
                <Camera color={colors.card} size={16} strokeWidth={2.4} />
              </View>
            </Pressable>
            <AvatarPickerModal
              currentAvatarUrl={avatarUrl}
              onClose={() => setAvatarPickerVisible(false)}
              onSelectAvatar={setAvatarUrl}
              options={avatarOptions}
              visible={avatarPickerVisible}
            />
            <View style={{ alignItems: "center", gap: 5 }}>
              <Text selectable style={{ color: colors.text, fontSize: 25, fontWeight: "900" }}>
                Sam Reader
              </Text>
              <Text selectable style={{ color: colors.mutedSoft, fontSize: 15 }}>
                Daily digest subscriber
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.accentSoft,
                borderColor: colors.tagBorder,
                borderCurve: "continuous",
                borderRadius: 999,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text selectable style={{ color: colors.tagText, fontSize: 13, fontWeight: "800" }}>
                Morning edition member
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderCurve: "continuous",
              borderRadius: 8,
              borderWidth: 1,
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            {profileStats.map((stat, index) => (
              <View
                key={stat.label}
                style={{
                  alignItems: "center",
                  borderColor: colors.border,
                  borderLeftWidth: index === 0 ? 0 : 1,
                  flex: 1,
                  gap: 3,
                  paddingVertical: 12,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: colors.text,
                    fontSize: 19,
                    fontVariant: ["tabular-nums"],
                    fontWeight: "900",
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  selectable
                  style={{ color: colors.mutedSoft, fontSize: 12, fontWeight: "700" }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Pressable
        accessibilityLabel="Settings Appearance and reading preferences"
        accessibilityRole="button"
        onPress={() => router.push("/settings")}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 8,
          borderWidth: 1,
          flexDirection: "row",
          gap: 12,
          minHeight: 82,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: 16,
          paddingVertical: 14,
        })}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.accentSoft,
            borderCurve: "continuous",
            borderRadius: 8,
            height: 42,
            justifyContent: "center",
            width: 42,
          }}
        >
          <Settings color={colors.accent} size={22} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1, flexShrink: 1, gap: 4, minWidth: 0 }}>
          <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
            Settings
          </Text>
          <Text
            selectable
            numberOfLines={1}
            style={{ color: colors.mutedSoft, fontSize: 14, lineHeight: 20 }}
          >
            Appearance and reading preferences
          </Text>
        </View>
        <ChevronRight color={colors.mutedSoft} size={21} strokeWidth={2.2} />
      </Pressable>

      <View style={{ gap: 10 }}>
        <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
          Favorite Topics
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {interests.map((interest) => (
            <View
              key={interest}
              style={{
                backgroundColor: colors.accentSoft,
                borderColor: colors.tagBorder,
                borderCurve: "continuous",
                borderRadius: 999,
                borderWidth: 1,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text selectable style={{ color: colors.tagText, fontSize: 14, fontWeight: "700" }}>
                {interest}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 8,
          borderWidth: 1,
          gap: 10,
          padding: 16,
        }}
      >
        <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
          Reading Stats
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          24 stories read this week, with most time spent on science and city updates.
        </Text>
      </View>
    </ScrollView>
  );
}
