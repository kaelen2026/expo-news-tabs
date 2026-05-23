import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "../contexts/app-theme";
import type { NewsStory } from "../data/news";

export function NewsCard({ story }: { story: NewsStory }) {
  const { colors, darkMode } = useAppTheme();
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel={`${story.category} ${story.title}`}
      accessibilityRole="link"
      onPress={() => router.push(`/news/${story.id}`)}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderCurve: "continuous",
        borderRadius: 10,
        borderWidth: 1,
        boxShadow: darkMode
          ? "0 10px 24px rgba(0, 0, 0, 0.28)"
          : "0 8px 22px rgba(15, 23, 42, 0.08)",
        opacity: pressed ? 0.78 : 1,
        overflow: "hidden",
      })}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ borderRadius: 6, overflow: "hidden" }}>
          <Image
            source={story.imageUrl}
            contentFit="cover"
            style={{
              width: "100%",
              aspectRatio: 16 / 9,
              backgroundColor: colors.imagePlaceholder,
            }}
          />
        </View>
      </View>
      <View style={{ gap: 10, padding: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text
            selectable
            style={{
              color: colors.accent,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            {story.category}
          </Text>
          <Text selectable style={{ color: colors.mutedSoft, fontSize: 12 }}>
            {story.publishedAt}
          </Text>
        </View>
        <Text
          selectable
          style={{ color: colors.text, fontSize: 21, fontWeight: "800", lineHeight: 26 }}
        >
          {story.title}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}>
          {story.summary}
        </Text>
        <Text selectable style={{ color: colors.mutedSoft, fontSize: 13 }}>
          {story.source} • {story.readTime}
        </Text>
      </View>
    </Pressable>
  );
}
