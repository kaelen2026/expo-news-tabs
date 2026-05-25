import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { AsyncState } from "../../components/async-state";
import { NewsCard } from "../../components/news-card";
import { useAppTheme } from "../../contexts/app-theme";
import { useAuth } from "../../lib/auth";
import type { NewsStory } from "../../lib/news-types";
import { trpc } from "../../lib/trpc";
import { useUserStoryData } from "../../lib/user-data";

type FavoriteRow = inferRouterOutputs<AppRouter>["favorites"]["list"][number];

export default function FavoritesScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { readSet, toggleFavorite } = useUserStoryData();
  const query = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.background,
          flex: 1,
          gap: 14,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "center" }}>
          Sign in to view favorites
        </Text>
        <Text style={{ color: colors.muted, fontSize: 15, textAlign: "center" }}>
          Your starred stories sync across web and mobile.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/sign-in")}
          style={({ pressed }) => ({
            backgroundColor: colors.accent,
            borderRadius: 10,
            opacity: pressed ? 0.7 : 1,
            paddingHorizontal: 22,
            paddingVertical: 12,
          })}
        >
          <Text style={{ color: colors.background, fontSize: 15, fontWeight: "800" }}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  const items = query.data ?? [];

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NewsCard
          story={toStory(item)}
          isFavorite
          isRead={readSet.has(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      )}
      ListHeaderComponent={
        <View style={{ paddingBottom: 4 }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Favorites</Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            Stories you've starred, newest first.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <AsyncState
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={query.error?.message}
          isEmpty={query.isSuccess && items.length === 0}
          loadingLabel="Loading favorites…"
          emptyLabel="No favorites yet — star a story from the home tab."
          onRetry={() => query.refetch()}
        >
          {null}
        </AsyncState>
      }
      contentContainerStyle={{
        backgroundColor: colors.background,
        flexGrow: 1,
        gap: 16,
        padding: 16,
        paddingBottom: 28,
      }}
    />
  );
}

// favorites.list rows include `favoritedAt` etc.; strip that so the row fits
// the NewsStory shape NewsCard expects.
function toStory(row: FavoriteRow): NewsStory {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: [],
    category: row.category,
    source: row.source,
    publishedAt: row.publishedAt,
    readTime: row.readTime,
    imageUrl: row.imageUrl,
  };
}
