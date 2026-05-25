import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AsyncState } from "../../components/async-state";
import { NewsCard } from "../../components/news-card";
import { useAppTheme } from "../../contexts/app-theme";
import { useAuth } from "../../lib/auth";
import { trpc } from "../../lib/trpc";
import { useUserStoryData } from "../../lib/user-data";

// Shown in the same order as the chips on the web Preferences page so
// the two surfaces feel consistent. Free-form `defaultCategory` strings
// that don't match a chip fall back to "All" silently.
const CATEGORIES = ["Local", "Science", "Business", "Culture", "Sports", "Tech"] as const;
type Category = (typeof CATEGORIES)[number];
const CATEGORY_SET = new Set<string>(CATEGORIES);

const PAGE_LIMIT_DEFAULT = 6;
// Filtering happens client-side, so a 6-row page often nets 0–1 items in
// the chosen category. Pulling a bigger page when a filter is active
// keeps the list from feeling empty without changing the API contract.
const PAGE_LIMIT_FILTERED = 24;

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { favoriteSet, readSet, toggleFavorite } = useUserStoryData();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Hydrate the chip selection from preferences.defaultCategory the
  // first time prefs come back. Subsequent chip taps are local — the
  // server-side default still lives on the web Preferences page.
  const prefsQuery = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });
  const [hydratedFromPrefs, setHydratedFromPrefs] = useState(false);
  useEffect(() => {
    if (hydratedFromPrefs) return;
    if (!isAuthenticated) {
      setHydratedFromPrefs(true);
      return;
    }
    if (prefsQuery.isSuccess) {
      const def = prefsQuery.data?.defaultCategory ?? null;
      if (def && CATEGORY_SET.has(def)) {
        setSelectedCategory(def as Category);
      }
      setHydratedFromPrefs(true);
    }
  }, [hydratedFromPrefs, isAuthenticated, prefsQuery.isSuccess, prefsQuery.data]);

  const query = trpc.news.list.useInfiniteQuery(
    { limit: selectedCategory ? PAGE_LIMIT_FILTERED : PAGE_LIMIT_DEFAULT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
  );

  const allStories = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const stories = useMemo(
    () =>
      selectedCategory ? allStories.filter((s) => s.category === selectedCategory) : allStories,
    [allStories, selectedCategory],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        tintColor={colors.accent}
        colors={[colors.accent]}
        onRefresh={() => query.refetch()}
      />
    ),
    [colors.accent, query.isRefetching, query.isFetchingNextPage, query.refetch],
  );

  const handleEndReached = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const Header = (
    <View style={{ gap: 12, paddingBottom: 4 }}>
      <View
        style={{ alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text selectable style={{ color: colors.accent, fontSize: 13, fontWeight: "700" }}>
            Morning Brief
          </Text>
          <Text
            selectable
            style={{ color: colors.text, fontSize: 32, fontWeight: "900", lineHeight: 38 }}
          >
            Top stories for today
          </Text>
        </View>
        {isAuthenticated ? (
          <Text style={{ color: colors.mutedSoft, fontSize: 12, marginTop: 4 }}>{user?.email}</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign-in")}
            style={({ pressed }) => ({
              backgroundColor: colors.accent,
              borderRadius: 999,
              opacity: pressed ? 0.7 : 1,
              paddingHorizontal: 14,
              paddingVertical: 7,
            })}
          >
            <Text style={{ color: colors.background, fontSize: 13, fontWeight: "800" }}>
              Sign in
            </Text>
          </Pressable>
        )}
      </View>
      <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
        A focused feed of local, science, business, and culture updates.
      </Text>
      <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
    </View>
  );

  if (query.isLoading || (query.isError && stories.length === 0)) {
    return (
      <View style={{ backgroundColor: colors.background, flex: 1, padding: 16 }}>
        {Header}
        <AsyncState
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={query.error?.message}
          isEmpty={false}
          loadingLabel="Loading stories…"
          onRetry={() => query.refetch()}
        >
          {null}
        </AsyncState>
      </View>
    );
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NewsCard
          story={item}
          isFavorite={favoriteSet.has(item.id)}
          isRead={readSet.has(item.id)}
          onToggleFavorite={isAuthenticated ? () => toggleFavorite(item.id) : undefined}
        />
      )}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <AsyncState
          isLoading={false}
          isError={false}
          isEmpty
          emptyLabel={
            selectedCategory
              ? `No ${selectedCategory.toLowerCase()} stories yet — try another topic.`
              : "No stories yet — check back soon."
          }
        >
          {null}
        </AsyncState>
      }
      ListFooterComponent={
        <View style={{ alignItems: "center", minHeight: 44, paddingVertical: 8 }}>
          {query.isFetchingNextPage ? <ActivityIndicator color={colors.accent} /> : null}
          {!query.isFetchingNextPage && !query.hasNextPage && stories.length > 0 ? (
            <Text selectable style={{ color: colors.mutedSoft, fontSize: 13, fontWeight: "700" }}>
              No more stories to load
            </Text>
          ) : null}
          {query.isError && stories.length > 0 ? (
            <Text selectable style={{ color: colors.muted, fontSize: 13 }}>
              Couldn't load more — pull down to retry.
            </Text>
          ) : null}
        </View>
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

function CategoryChips({
  selected,
  onSelect,
}: {
  selected: Category | null;
  onSelect: (next: Category | null) => void;
}) {
  const { colors } = useAppTheme();
  const items: { label: string; value: Category | null }[] = [
    { label: "All", value: null },
    ...CATEGORIES.map((c) => ({ label: c, value: c })),
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={`Filter stories by ${item.label}`}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.value)}
            style={({ pressed }) => ({
              backgroundColor: active ? colors.accent : colors.card,
              borderColor: active ? colors.accent : colors.border,
              borderCurve: "continuous",
              borderRadius: 999,
              borderWidth: 1,
              opacity: pressed ? 0.72 : 1,
              paddingHorizontal: 14,
              paddingVertical: 7,
            })}
          >
            <Text
              selectable
              style={{
                color: active ? colors.background : colors.text,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
