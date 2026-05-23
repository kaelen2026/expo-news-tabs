import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ellipsis, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PhotoWallModal } from "@/components/photo-wall-modal";
import { ShareSheet } from "@/components/share-sheet";
import { useAppTheme } from "@/contexts/app-theme";
import { getStoryById, newsStories } from "@/data/news";

function HeaderActions({
  onShare,
  tintColor,
}: {
  onShare?: () => void;
  tintColor?: string;
}) {
  const { colors } = useAppTheme();
  const iconColor = tintColor ?? colors.accent;

  return (
    <View style={{ flexDirection: "row", gap: 6, justifyContent: "flex-end", width: 76 }}>
      <Pressable
        accessibilityLabel="Share story"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onShare}
        style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1, padding: 4 })}
      >
        <Share2 color={iconColor} size={21} strokeWidth={2.2} />
      </Pressable>
      <Pressable
        accessibilityLabel="More actions"
        accessibilityRole="button"
        hitSlop={10}
        style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1, padding: 4 })}
      >
        <Ellipsis color={iconColor} size={22} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [photoWallVisible, setPhotoWallVisible] = useState(false);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const story = getStoryById(id);

  if (!story) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ backgroundColor: colors.background, gap: 12, padding: 16 }}
      >
        <Stack.Screen
          options={{
            headerRight: () => <HeaderActions />,
            headerTitleAlign: "center",
            title: "Story not found",
          }}
        />
        <Text selectable style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>
          Story not found
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
          This article may have moved or is no longer available.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ backgroundColor: colors.background, paddingBottom: 32 }}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderActions
              onShare={() => setShareSheetVisible(true)}
            />
          ),
          headerTitleAlign: "center",
          title: story.category,
        }}
      />
      <Pressable
        accessibilityLabel="Open photo wall"
        accessibilityRole="imagebutton"
        onPress={() => setPhotoWallVisible(true)}
        testID="open-photo-wall"
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <Image
          source={story.imageUrl}
          contentFit="cover"
          style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.imagePlaceholder }}
        />
      </Pressable>
      {photoWallVisible ? (
        <PhotoWallModal
          initialStoryId={story.id}
          onClose={() => setPhotoWallVisible(false)}
          stories={newsStories}
          visible
        />
      ) : null}
      <ShareSheet
        onClose={() => setShareSheetVisible(false)}
        story={story}
        visible={shareSheetVisible}
      />
      <View style={{ gap: 14, padding: 16 }}>
        <Text selectable style={{ color: colors.accent, fontSize: 13, fontWeight: "800" }}>
          {story.source} • {story.publishedAt} • {story.readTime}
        </Text>
        <Text
          selectable
          style={{ color: colors.text, fontSize: 33, fontWeight: "900", lineHeight: 39 }}
        >
          {story.title}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 18, lineHeight: 27 }}>
          {story.summary}
        </Text>
        <View style={{ gap: 16, paddingTop: 6 }}>
          {story.body.map((paragraph) => (
            <Text
              selectable
              key={paragraph}
              style={{ color: colors.text, fontSize: 17, lineHeight: 27 }}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
