import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { BadgeCheck, Camera, ChevronRight, LogOut, Settings } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

import { type AvatarOption, AvatarPickerModal } from "../../components/avatar-picker-modal";
import { useAppTheme } from "../../contexts/app-theme";
import { useAuth } from "../../lib/auth";
import { trpc } from "../../lib/trpc";

const defaultAvatarUrl =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80";

const avatarOptions: AvatarOption[] = [
  { id: "reader", imageUrl: defaultAvatarUrl },
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

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();

  // Avatar customization stays local — there's no avatar upload backend
  // yet, and `user.image` is still null for email/password accounts.
  const [avatarUrl, setAvatarUrl] = useState(() => user?.image ?? defaultAvatarUrl);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  // Stats come from the same procedures the rest of the app already uses,
  // so the numbers match favorites.tsx / news cards exactly.
  const favoritesQuery = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const readsQuery = trpc.reads.ids.useQuery(undefined, { enabled: isAuthenticated });

  const favoriteCount = favoritesQuery.data?.length ?? 0;
  const readCount = readsQuery.data?.length ?? 0;
  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const row of favoritesQuery.data ?? []) set.add(row.category);
    return [...set];
  }, [favoritesQuery.data]);

  const statsLoading = isAuthenticated && (favoritesQuery.isLoading || readsQuery.isLoading);

  const handleSignOut = () => {
    Alert.alert("Sign out", "You'll need to sign back in to sync favorites and reads.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

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
              onPress={() => isAuthenticated && setAvatarPickerVisible(true)}
              disabled={!isAuthenticated}
              testID="change-avatar"
              style={({ pressed }) => ({
                borderColor: colors.card,
                borderRadius: 48,
                borderWidth: 4,
                height: 96,
                marginTop: -48,
                opacity: pressed && isAuthenticated ? 0.82 : 1,
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
              {isAuthenticated ? (
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
              ) : null}
            </Pressable>
            <AvatarPickerModal
              currentAvatarUrl={avatarUrl}
              onClose={() => setAvatarPickerVisible(false)}
              onSelectAvatar={setAvatarUrl}
              options={avatarOptions}
              visible={avatarPickerVisible}
            />

            {authLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : isAuthenticated && user ? (
              <SignedInIdentity user={user} />
            ) : (
              <SignedOutIdentity onSignIn={() => router.push("/sign-in")} />
            )}
          </View>

          {isAuthenticated ? (
            <StatsRow
              loading={statsLoading}
              read={readCount}
              saved={favoriteCount}
              topics={topics.length}
            />
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityLabel="Settings: Appearance and reading preferences"
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

      {isAuthenticated ? (
        <>
          <View style={{ gap: 10 }}>
            <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
              Favorite Topics
            </Text>
            {topics.length === 0 ? (
              <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
                Star stories from the home tab — topics you save show up here.
              </Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {topics.map((topic) => (
                  <View
                    key={topic}
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
                    <Text
                      selectable
                      style={{ color: colors.tagText, fontSize: 14, fontWeight: "700" }}
                    >
                      {topic}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
              {summarizeReading({ readCount, favoriteCount, topics })}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderCurve: "continuous",
              borderRadius: 8,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              minHeight: 56,
              opacity: pressed ? 0.72 : 1,
              paddingHorizontal: 16,
              paddingVertical: 14,
            })}
          >
            <LogOut color={colors.muted} size={20} strokeWidth={2.2} />
            <Text
              selectable
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Sign out
            </Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

function SignedInIdentity({
  user,
}: {
  user: { name: string; email: string; emailVerified: boolean };
}) {
  const { colors } = useAppTheme();
  return (
    <>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text selectable style={{ color: colors.text, fontSize: 25, fontWeight: "900" }}>
          {user.name || user.email}
        </Text>
        <Text selectable style={{ color: colors.mutedSoft, fontSize: 15 }}>
          {user.email}
        </Text>
      </View>
      {user.emailVerified ? (
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.accentSoft,
            borderColor: colors.tagBorder,
            borderCurve: "continuous",
            borderRadius: 999,
            borderWidth: 1,
            flexDirection: "row",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <BadgeCheck color={colors.tagText} size={14} strokeWidth={2.4} />
          <Text selectable style={{ color: colors.tagText, fontSize: 13, fontWeight: "800" }}>
            Email verified
          </Text>
        </View>
      ) : null}
    </>
  );
}

function SignedOutIdentity({ onSignIn }: { onSignIn: () => void }) {
  const { colors } = useAppTheme();
  return (
    <>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text selectable style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>
          Sign in to sync
        </Text>
        <Text selectable style={{ color: colors.mutedSoft, fontSize: 14, textAlign: "center" }}>
          Favorites, read history, and reading preferences sync across web and mobile.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onSignIn}
        style={({ pressed }) => ({
          backgroundColor: colors.accent,
          borderRadius: 999,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: 22,
          paddingVertical: 10,
        })}
      >
        <Text style={{ color: colors.background, fontSize: 14, fontWeight: "800" }}>Sign in</Text>
      </Pressable>
    </>
  );
}

function StatsRow({
  loading,
  read,
  saved,
  topics,
}: {
  loading: boolean;
  read: number;
  saved: number;
  topics: number;
}) {
  const { colors } = useAppTheme();
  const stats = [
    { label: "Read", value: read },
    { label: "Saved", value: saved },
    { label: "Topics", value: topics },
  ];
  return (
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
      {stats.map((stat, index) => (
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
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
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
          )}
          <Text selectable style={{ color: colors.mutedSoft, fontSize: 12, fontWeight: "700" }}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function summarizeReading({
  readCount,
  favoriteCount,
  topics,
}: {
  readCount: number;
  favoriteCount: number;
  topics: string[];
}): string {
  if (readCount === 0 && favoriteCount === 0) {
    return "Open a story to start tracking what you've read.";
  }
  const readPart = `${readCount} ${readCount === 1 ? "story" : "stories"} read`;
  const savedPart = `${favoriteCount} saved`;
  if (topics.length === 0) {
    return `${readPart}, ${savedPart}.`;
  }
  const sample = topics.slice(0, 3).join(", ");
  const suffix = topics.length > 3 ? "…" : "";
  return `${readPart}, ${savedPart}. Topics you follow: ${sample}${suffix}.`;
}
