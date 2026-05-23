import { FlatList, Text, View } from "react-native";

import { NewsCard } from "@/components/news-card";
import { useAppTheme } from "@/contexts/app-theme";
import { newsStories } from "@/data/news";

export default function HomeScreen() {
  const { colors } = useAppTheme();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      data={newsStories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsCard story={item} />}
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
      contentContainerStyle={{
        backgroundColor: colors.background,
        gap: 16,
        padding: 16,
        paddingBottom: 28,
      }}
    />
  );
}
