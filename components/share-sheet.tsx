import * as Clipboard from "expo-clipboard";
import { Check, Copy, Share2, X } from "lucide-react-native";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Share, Text, View } from "react-native";

import { useAppTheme } from "@/contexts/app-theme";
import type { NewsStory } from "@/data/news";

function SheetAction({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: colors.accentSoft,
        borderCurve: "continuous",
        borderRadius: 8,
        flex: 1,
        gap: 8,
        minHeight: 86,
        justifyContent: "center",
        opacity: pressed ? 0.68 : 1,
        padding: 12,
      })}
    >
      {icon}
      <Text selectable style={{ color: colors.tagText, fontSize: 14, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ShareSheet({
  onClose,
  story,
  visible,
}: {
  onClose: () => void;
  story: NewsStory;
  visible: boolean;
}) {
  const { colors } = useAppTheme();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const shareUrl = useMemo(() => `https://news-tabs.example/story/${story.id}`, [story.id]);
  const shareMessage = `${story.title}\n\n${story.summary}\n\n${shareUrl}`;

  useEffect(() => {
    if (visible) {
      setCopied(false);
      setMessage("");
    }
  }, [story.id, visible]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setMessage("Link copied");
  };

  const handleSystemShare = async () => {
    try {
      const webNavigator = globalThis.navigator as
        | (Navigator & {
            canShare?: (data?: ShareData) => boolean;
            share?: (data?: ShareData) => Promise<void>;
          })
        | undefined;

      if (process.env.EXPO_OS === "web" && webNavigator?.share) {
        const shareData = { text: story.summary, title: story.title, url: shareUrl };

        if (!webNavigator.canShare || webNavigator.canShare(shareData)) {
          await webNavigator.share(shareData);
          return;
        }
      }

      if (process.env.EXPO_OS !== "web") {
        await Share.share({
          message: shareMessage,
          title: story.title,
          url: shareUrl,
        });
        return;
      }

      await handleCopy();
      setMessage("Sharing is not available here. Link copied.");
    } catch (error) {
      await handleCopy();
      setMessage("Sharing was cancelled or unavailable. Link copied.");
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.42)",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          accessibilityLabel="Close share sheet backdrop"
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <View
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderWidth: 1,
            gap: 18,
            padding: 18,
            paddingBottom: 28,
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>
                Share story
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
                {story.title}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close share sheet"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              testID="close-share-sheet"
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: colors.accentSoft,
                borderRadius: 18,
                height: 36,
                justifyContent: "center",
                opacity: pressed ? 0.62 : 1,
                width: 36,
              })}
            >
              <X color={colors.accent} size={21} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <SheetAction
              icon={<Share2 color={colors.accent} size={24} strokeWidth={2.2} />}
              label="Share"
              onPress={handleSystemShare}
            />
            <SheetAction
              icon={
                copied ? (
                  <Check color={colors.accent} size={24} strokeWidth={2.2} />
                ) : (
                  <Copy color={colors.accent} size={24} strokeWidth={2.2} />
                )
              }
              label={copied ? "Copied" : "Copy Link"}
              onPress={handleCopy}
            />
          </View>
          {message ? (
            <Text
              selectable
              style={{ color: colors.mutedSoft, fontSize: 13, lineHeight: 18, textAlign: "center" }}
            >
              {message}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
