import { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

import { AsyncState } from "../../components/async-state";
import { NewsCard } from "../../components/news-card";
import { useAppTheme } from "../../contexts/app-theme";
import { trpc } from "../../lib/trpc";

export default function HomeScreen() {
  const { colors } = useAppTheme();

  const query = trpc.news.list.useInfiniteQuery(
    { limit: 6 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
  );

  const stories = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
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
    <View style={{ gap: 8, paddingBottom: 4 }}>
      <Text selectable style={{ color: colors.accent, fontSize: 13, fontWeight: "700" }}>
        Morning Brief
      </Text>
      <Text
        selectable
        style={{ color: colors.text, fontSize: 32, fontWeight: "900", lineHeight: 38 }}
      >
        Top stories for today
      </Text>
      <Text selectable style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>
        A focused feed of local, science, business, and culture updates.
      </Text>
    </View>
  );

  // While the very first page is loading, show the unified async state.
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
      renderItem={({ item }) => <NewsCard story={item} />}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <AsyncState
          isLoading={false}
          isError={false}
          isEmpty
          emptyLabel="No stories yet — check back soon."
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
