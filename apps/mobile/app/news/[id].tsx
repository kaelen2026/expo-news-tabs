import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ellipsis, Share2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AsyncState } from "../../components/async-state";
import { PhotoWallModal } from "../../components/photo-wall-modal";
import { ShareSheet } from "../../components/share-sheet";
import { useAppTheme } from "../../contexts/app-theme";
import { useAuth } from "../../lib/auth";
import { trpc } from "../../lib/trpc";

function HeaderActions({ onShare, tintColor }: { onShare?: () => void; tintColor?: string }) {
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
  const { isAuthenticated } = useAuth();
  const [photoWallVisible, setPhotoWallVisible] = useState(false);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);

  const query = trpc.news.byId.useQuery({ id }, { enabled: Boolean(id), retry: false });
  const story = query.data;
  const notFound = query.isError && query.error?.data?.code === "NOT_FOUND";

  // Auto-mark the story as read once it's loaded and the user is signed in.
  // A ref tracks ids we've already requested so the effect can run on every
  // render without re-firing the mutation.
  const utils = trpc.useUtils();
  const markRead = trpc.reads.mark.useMutation({
    onSuccess: () => utils.reads.ids.invalidate(),
  });
  const markedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!story || !isAuthenticated) return;
    if (markedRef.current.has(story.id)) return;
    markedRef.current.add(story.id);
    markRead.mutate({ storyId: story.id });
  }, [story, isAuthenticated, markRead]);

  if (query.isLoading || query.isError) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ backgroundColor: colors.background, padding: 16 }}
      >
        <Stack.Screen
          options={{
            headerRight: () => <HeaderActions />,
            headerTitleAlign: "center",
            title: notFound ? "Story not found" : "Loading…",
          }}
        />
        <AsyncState
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={
            notFound
              ? "This article may have moved or is no longer available."
              : query.error?.message
          }
          isEmpty={false}
          loadingLabel="Loading story…"
          onRetry={notFound ? undefined : () => query.refetch()}
        >
          {null}
        </AsyncState>
      </ScrollView>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ backgroundColor: colors.background, paddingBottom: 32 }}
    >
      <Stack.Screen
        options={{
          headerRight: () => <HeaderActions onShare={() => setShareSheetVisible(true)} />,
          headerTitle: () => (
            <Text
              numberOfLines={1}
              style={{ color: colors.text, fontSize: 17, fontWeight: "900", maxWidth: 220 }}
            >
              {story.title}
            </Text>
          ),
          headerTitleAlign: "center",
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
