import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

import { NewsCard } from "../../components/news-card";
import { useAppTheme } from "../../contexts/app-theme";
import { type NewsStory, newsStories } from "../../data/news";

type FeedItem = {
  feedId: string;
  story: NewsStory;
};

const MAX_MOCK_PAGES = 3;

function createFeedPage(page: number): FeedItem[] {
  return newsStories.map((story) => ({
    feedId: `${page}-${story.id}`,
    story,
  }));
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const [, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => createFeedPage(1));

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        tintColor={colors.accent}
        colors={[colors.accent]}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setPage(1);
            setFeedItems(createFeedPage(1));
            setHasMore(true);
            setRefreshing(false);
          }, 650);
        }}
      />
    ),
    [colors.accent, refreshing],
  );

  const handleEndReached = useCallback(() => {
    if (loadingMore || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setTimeout(() => {
      setPage((currentPage) => {
        if (currentPage >= MAX_MOCK_PAGES) {
          setHasMore(false);
          return currentPage;
        }

        const nextPage = currentPage + 1;
        setFeedItems((currentItems) => [...currentItems, ...createFeedPage(nextPage)]);
        setHasMore(nextPage < MAX_MOCK_PAGES);
        return nextPage;
      });
      setLoadingMore(false);
    }, 650);
  }, [hasMore, loadingMore, refreshing]);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={feedItems}
      keyExtractor={(item) => item.feedId}
      renderItem={({ item }) => <NewsCard story={item.story} />}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.35}
      onScroll={({ nativeEvent }) => {
        const distanceFromBottom =
          nativeEvent.contentSize.height -
          nativeEvent.layoutMeasurement.height -
          nativeEvent.contentOffset.y;

        if (distanceFromBottom < 180) {
          handleEndReached();
        }
      }}
      scrollEventThrottle={120}
      ListHeaderComponent={
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
      }
      ListFooterComponent={
        <View style={{ alignItems: "center", minHeight: 44, paddingVertical: 8 }}>
          {loadingMore ? <ActivityIndicator color={colors.accent} /> : null}
          {!loadingMore && !hasMore ? (
            <Text selectable style={{ color: colors.mutedSoft, fontSize: 13, fontWeight: "700" }}>
              No more stories to load
            </Text>
          ) : null}
        </View>
      }
      contentContainerStyle={{
        backgroundColor: colors.background,
        gap: 16,
        padding: 16,
        paddingBottom: 28,
      }}
    />
  );
}
