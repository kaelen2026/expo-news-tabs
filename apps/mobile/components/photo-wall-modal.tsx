import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";

import { useAppTheme } from "../contexts/app-theme";
import { trpc } from "../lib/trpc";
import { AsyncState } from "./async-state";

export function PhotoWallModal({
  initialStoryId,
  onClose,
  visible,
}: {
  initialStoryId: string;
  onClose: () => void;
  visible: boolean;
}) {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const query = trpc.news.list.useQuery({ limit: 50 }, { enabled: visible });
  const stories = query.data?.items ?? [];
  const initialStory = stories.find((story) => story.id === initialStoryId) ?? stories[0];
  const [selectedStory, setSelectedStory] = useState(initialStory);
  const imageHeight = Math.min(width * 0.72, height * 0.46);

  useEffect(() => {
    if (visible && initialStory) {
      setSelectedStory(initialStory);
    }
  }, [initialStory, visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <View style={{ backgroundColor: "#050807", flex: 1 }}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            minHeight: 72,
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 12,
            position: "relative",
            zIndex: 2,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text selectable style={{ color: "#f8fffd", fontSize: 18, fontWeight: "800" }}>
              Photo Wall
            </Text>
            {selectedStory && (
              <Text selectable style={{ color: "#a8b8b5", fontSize: 13 }}>
                {selectedStory.category} • {selectedStory.source}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityLabel="Close photo wall"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onClose}
            onPressIn={onClose}
            testID="close-photo-wall"
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderRadius: 18,
              height: 36,
              justifyContent: "center",
              opacity: pressed ? 0.62 : 1,
              width: 36,
            })}
          >
            <X color="#f8fffd" size={22} strokeWidth={2.2} />
          </Pressable>
        </View>

        <AsyncState
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={query.error?.message}
          isEmpty={query.isSuccess && stories.length === 0}
          loadingLabel="Loading photo wall…"
          emptyLabel="No stories to show."
          onRetry={() => query.refetch()}
        >
          {selectedStory && (
            <>
              <View
                style={{
                  flex: 1,
                  gap: 14,
                  justifyContent: "flex-start",
                  paddingHorizontal: 12,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Image
                  source={selectedStory.imageUrl}
                  contentFit="contain"
                  style={{
                    backgroundColor: "#0f1b19",
                    borderRadius: 8,
                    height: imageHeight,
                    width: "100%",
                  }}
                />
                <View style={{ gap: 6, paddingHorizontal: 4 }}>
                  <Text
                    selectable
                    numberOfLines={2}
                    style={{ color: "#f8fffd", fontSize: 20, fontWeight: "900", lineHeight: 25 }}
                  >
                    {selectedStory.title}
                  </Text>
                  <Text
                    selectable
                    numberOfLines={2}
                    style={{ color: "#c7d2cf", fontSize: 14, lineHeight: 20 }}
                  >
                    {selectedStory.summary}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                style={{ flexGrow: 0, height: 118, maxHeight: 118 }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center", gap: 10, paddingHorizontal: 14 }}
              >
                {stories.map((story) => {
                  const selected = story.id === selectedStory.id;

                  return (
                    <Pressable
                      accessibilityLabel={`View ${story.title}`}
                      accessibilityRole="imagebutton"
                      key={story.id}
                      onPress={() => setSelectedStory(story)}
                      testID={`photo-wall-thumbnail-${story.id}`}
                      style={({ pressed }) => ({
                        borderColor: selected ? colors.accent : "rgba(255, 255, 255, 0.18)",
                        borderCurve: "continuous",
                        borderRadius: 8,
                        borderWidth: selected ? 3 : 1,
                        height: 84,
                        opacity: pressed ? 0.7 : 1,
                        overflow: "hidden",
                        width: 112,
                      })}
                    >
                      <Image
                        source={story.imageUrl}
                        contentFit="cover"
                        style={{ backgroundColor: "#0f1b19", height: "100%", width: "100%" }}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </AsyncState>
      </View>
    </Modal>
  );
}
