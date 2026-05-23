import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, Images, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/contexts/app-theme";

export type AvatarOption = {
  id: string;
  imageUrl: string;
};

export function AvatarPickerModal({
  currentAvatarUrl,
  onClose,
  onSelectAvatar,
  options,
  visible,
}: {
  currentAvatarUrl: string;
  onClose: () => void;
  onSelectAvatar: (imageUrl: string) => void;
  options: AvatarOption[];
  visible: boolean;
}) {
  const { colors } = useAppTheme();

  const handlePickFromDevice = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onSelectAvatar(result.assets[0].uri);
      onClose();
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
          accessibilityLabel="Close avatar picker backdrop"
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
                Change avatar
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
                Pick a new profile photo
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close avatar picker"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              testID="close-avatar-picker"
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

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {options.map((option) => {
              const selected = option.imageUrl === currentAvatarUrl;

              return (
                <Pressable
                  accessibilityLabel={`Choose avatar ${option.id}`}
                  accessibilityRole="imagebutton"
                  key={option.id}
                  onPress={() => {
                    onSelectAvatar(option.imageUrl);
                    onClose();
                  }}
                  testID={`avatar-option-${option.id}`}
                  style={({ pressed }) => ({
                    borderColor: selected ? colors.accent : colors.border,
                    borderRadius: 44,
                    borderWidth: selected ? 3 : 1,
                    height: 76,
                    opacity: pressed ? 0.72 : 1,
                    overflow: "hidden",
                    width: 76,
                  })}
                >
                  <Image
                    source={option.imageUrl}
                    contentFit="cover"
                    style={{ backgroundColor: colors.imagePlaceholder, height: "100%", width: "100%" }}
                  />
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel="Choose avatar from device"
            accessibilityRole="button"
            onPress={handlePickFromDevice}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: colors.accentSoft,
              borderCurve: "continuous",
              borderRadius: 8,
              flexDirection: "row",
              gap: 12,
              opacity: pressed ? 0.7 : 1,
              padding: 14,
            })}
          >
            <View
              style={{
                alignItems: "center",
                height: 30,
                justifyContent: "center",
                width: 30,
              }}
            >
              {process.env.EXPO_OS === "web" ? (
                <Images color={colors.accent} size={22} strokeWidth={2.2} />
              ) : (
                <Camera color={colors.accent} size={22} strokeWidth={2.2} />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text selectable style={{ color: colors.tagText, fontSize: 16, fontWeight: "800" }}>
                Choose from device
              </Text>
              <Text selectable style={{ color: colors.muted, fontSize: 13 }}>
                Use a square crop for best results
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
