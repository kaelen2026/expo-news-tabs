export type NewsStory = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  category: string;
  source: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
};

export const newsStories: NewsStory[] = [
  {
    id: "city-transit",
    title: "City transit adds all-day express routes",
    summary:
      "New crosstown routes are designed to cut transfer time and make weekday commuting easier.",
    body: [
      "The city transit agency is adding three all-day express routes next month, connecting residential neighborhoods with major job centers and university districts.",
      "Officials said the routes were chosen from ridership surveys and real-time crowding data. The first phase will run every 12 minutes during peak periods and every 20 minutes during midday service.",
      "Transit planners expect the change to reduce common two-transfer trips into a single-seat ride for thousands of daily passengers.",
    ],
    category: "Local",
    source: "Metro Desk",
    publishedAt: "Today, 8:30 AM",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "climate-labs",
    title: "Climate labs share faster storm forecasting model",
    summary:
      "Researchers say the new model improves coastal warnings while using less compute time.",
    body: [
      "A consortium of university climate labs released a forecasting model that can simulate fast-moving coastal storms with higher regional detail.",
      "The researchers focused on shortening the time between satellite observations and public warning updates. Emergency managers will test the model during this year's storm season.",
      "The team plans to publish validation results after the pilot period and make the training methods available for public review.",
    ],
    category: "Science",
    source: "Field Notes",
    publishedAt: "Today, 7:15 AM",
    readTime: "4 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "startup-robots",
    title: "Warehouse robotics startup opens second factory",
    summary:
      "The expansion follows demand from regional grocers and medical supply distributors.",
    body: [
      "A robotics company focused on small warehouse automation opened its second manufacturing site, doubling its annual production capacity.",
      "The company builds modular picking systems for facilities that are too small for traditional automation lines. Customers can begin with a single aisle and expand as volume grows.",
      "Executives said the new factory will also support repairs and refurbishments, reducing downtime for existing customers.",
    ],
    category: "Business",
    source: "Market Wire",
    publishedAt: "Yesterday, 5:40 PM",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "chef-market",
    title: "Neighborhood chefs launch weekly night market",
    summary:
      "The Friday event brings rotating menus, live music, and shared outdoor seating downtown.",
    body: [
      "A group of neighborhood chefs will begin hosting a weekly night market in the arts district, featuring a rotating set of food stalls and guest bakers.",
      "Organizers said the market is meant to give small culinary teams a lower-cost way to test new menus before committing to permanent spaces.",
      "The first month will include regional noodles, wood-fired vegetables, fresh pastries, and a zero-proof cocktail counter.",
    ],
    category: "Culture",
    source: "City Table",
    publishedAt: "Yesterday, 2:10 PM",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getStoryById(id: string) {
  return newsStories.find((story) => story.id === id);
}
