import type { NewNewsStory } from "./schema/news";

type SeedStory = Omit<NewNewsStory, "createdAt"> & { createdAt: Date };

// Fixed base so seeded data is deterministic for tests; each subsequent
// story is one minute older than the previous one.
const BASE = new Date("2026-05-25T08:30:00Z").getTime();
const minutesAgo = (minutes: number): Date => new Date(BASE - minutes * 60_000);

export const seedNewsStories: SeedStory[] = [
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
    createdAt: minutesAgo(0),
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
    createdAt: minutesAgo(75),
  },
  {
    id: "startup-robots",
    title: "Warehouse robotics startup opens second factory",
    summary: "The expansion follows demand from regional grocers and medical supply distributors.",
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
    createdAt: minutesAgo(890),
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
    createdAt: minutesAgo(1100),
  },
  {
    id: "river-cleanup",
    title: "Volunteers pull a record haul from the riverbanks",
    summary:
      "A weekend cleanup recovered furniture, plastics, and old fishing gear from the upper river.",
    body: [
      "Volunteers from a dozen neighborhood groups spent Saturday clearing the upper river of accumulated debris, ending the day with a record sorted haul.",
      "The city parks department supplied bags, kayaks, and dumpsters. Organizers said the riverbank conditions improved noticeably after the morning's first sweep.",
      "Public works will haul the sorted recycling and compost away on Monday.",
    ],
    category: "Local",
    source: "Riverside Weekly",
    publishedAt: "Yesterday, 11:00 AM",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1431440869543-efaf3388c585?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(1280),
  },
  {
    id: "fusion-milestone",
    title: "Lab reports a sustained net-energy fusion run",
    summary:
      "The result, measured across three independent diagnostics, will be peer reviewed this fall.",
    body: [
      "A national lab reported a sustained net-energy fusion experiment lasting six seconds, far above the team's previous best.",
      "Researchers said the data passed three independent diagnostic checks before being released. Peer review is expected to begin this fall.",
      "Funding agencies will use the result to evaluate the next phase of the program's roadmap.",
    ],
    category: "Science",
    source: "Lab Notebook",
    publishedAt: "Yesterday, 9:30 AM",
    readTime: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(1400),
  },
  {
    id: "rate-watch",
    title: "Central bank signals patience on rate moves",
    summary: "Officials emphasized data dependence and ruled out a near-term policy pivot.",
    body: [
      "Speaking at a banking conference, central bank officials emphasized patience on rate decisions and ruled out a near-term policy pivot.",
      "Several governors said incoming inflation data would have to confirm a durable trend before the committee considered any change.",
      "Markets trimmed expectations of a cut at the next meeting following the remarks.",
    ],
    category: "Business",
    source: "Market Wire",
    publishedAt: "Yesterday, 8:00 AM",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(1520),
  },
  {
    id: "library-makers",
    title: "Public libraries open neighborhood maker spaces",
    summary: "Each branch will host evening classes in sewing, electronics, and audio production.",
    body: [
      "The public library system is rolling out maker spaces at each of its twelve branches over the next year.",
      "Programming will include sewing, electronics, audio production, and a rotating residency for local artists.",
      "Staff said the spaces are designed to complement, not replace, existing book and study areas.",
    ],
    category: "Culture",
    source: "City Table",
    publishedAt: "Two days ago",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(1640),
  },
  {
    id: "marathon-route",
    title: "Marathon course will trace the harbor for the first time",
    summary:
      "Runners get a flatter route, and waterfront neighborhoods become the new finishing stretch.",
    body: [
      "The fall marathon's route will trace the harbor for the first time, replacing the older inland loop.",
      "Course designers said the new course is flatter overall and adds a dramatic waterfront finishing stretch.",
      "Race day road closures will be published next week.",
    ],
    category: "Sports",
    source: "City Sports",
    publishedAt: "Two days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(1770),
  },
  {
    id: "secure-firmware",
    title: "Standards body lands a secure firmware update format",
    summary:
      "The new spec covers signed payloads, rollback windows, and verifiable build provenance.",
    body: [
      "A widely-used standards body finalized a secure firmware update format covering signed payloads, rollback windows, and verifiable build provenance.",
      "Device vendors had been asking for a common spec to reduce supply-chain audit overhead.",
      "Reference implementations in two open source projects are already underway.",
    ],
    category: "Tech",
    source: "Engineering Daily",
    publishedAt: "Two days ago",
    readTime: "4 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(1890),
  },
  {
    id: "school-budget",
    title: "School board approves expanded literacy budget",
    summary:
      "Funding will pay for a third reading specialist and new screening tools at every elementary site.",
    body: [
      "The school board approved an expanded literacy budget that adds a third reading specialist district-wide.",
      "Each elementary site will receive new screening tools designed to catch reading delays earlier.",
      "Implementation begins next quarter, with progress reports each semester.",
    ],
    category: "Local",
    source: "Schoolhouse",
    publishedAt: "Three days ago",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2030),
  },
  {
    id: "forest-canopy",
    title: "Canopy drone survey maps an entire watershed",
    summary:
      "Researchers stitched 14 days of flight data into the region's first uniform canopy map.",
    body: [
      "Researchers completed a uniform canopy survey of a major regional watershed after fourteen days of drone flights.",
      "The dataset will support fire risk modeling, invasive species tracking, and water resource planning.",
      "Raw flight data will be archived and made available to qualified researchers on request.",
    ],
    category: "Science",
    source: "Field Notes",
    publishedAt: "Three days ago",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2150),
  },
  {
    id: "small-shipyard",
    title: "Coastal shipyard takes on its largest order in a decade",
    summary: "The contract covers six new harbor vessels with hybrid-electric drivetrains.",
    body: [
      "A small coastal shipyard signed its largest order in ten years, covering six new harbor vessels built around hybrid-electric drivetrains.",
      "The order will keep the yard's primary slip busy through the end of next year.",
      "Local contractors will supply electrical, machining, and finish work.",
    ],
    category: "Business",
    source: "Market Wire",
    publishedAt: "Three days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2300),
  },
  {
    id: "regional-noodles",
    title: "Regional noodle festival returns with twice the stalls",
    summary: "The two-day event will spotlight hand-pulled, knife-cut, and rice noodle traditions.",
    body: [
      "The regional noodle festival is returning to the downtown plaza with twice as many stalls as last year.",
      "Programming spotlights hand-pulled, knife-cut, and rice noodle traditions, along with guest chefs from neighboring cities.",
      "Tickets are free, with limited reservations for early-evening tasting flights.",
    ],
    category: "Culture",
    source: "City Table",
    publishedAt: "Four days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2420),
  },
  {
    id: "junior-coach",
    title: "Junior basketball league names new head coach",
    summary:
      "She'll lead training, league scheduling, and a new mentorship program for assistant coaches.",
    body: [
      "The junior basketball league announced its new head coach this week.",
      "Her responsibilities cover training, league scheduling, and a new mentorship program for assistant coaches.",
      "The first preseason scrimmages begin in three weeks.",
    ],
    category: "Sports",
    source: "City Sports",
    publishedAt: "Four days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2560),
  },
  {
    id: "open-spec",
    title: "Working group publishes an open spec for app permissions",
    summary:
      "The draft proposes a single permission grammar that mobile, desktop, and web apps can share.",
    body: [
      "A multi-vendor working group published an open draft spec for app permissions that aims to unify mobile, desktop, and web grammars.",
      "Editors said the proposal is intentionally conservative — it codifies what most platforms already do rather than introducing new capabilities.",
      "The next milestone is two interoperable reference implementations.",
    ],
    category: "Tech",
    source: "Engineering Daily",
    publishedAt: "Four days ago",
    readTime: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2700),
  },
  {
    id: "neighborhood-grants",
    title: "Neighborhood grant cycle funds eleven small projects",
    summary:
      "Awards will support community gardens, repair cafés, and a new outdoor lending library.",
    body: [
      "The annual neighborhood grant cycle funded eleven small projects this round.",
      "Awards will support community gardens, repair cafés, and a new outdoor lending library at the south branch park.",
      "Reporting from each project is due at the end of the calendar year.",
    ],
    category: "Local",
    source: "Riverside Weekly",
    publishedAt: "Five days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1466428996289-fb355538da1b?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2860),
  },
  {
    id: "telescope-time",
    title: "Open telescope time announces a public astronomy slate",
    summary:
      "Educators and amateur teams can apply for two-night observation blocks through the fall.",
    body: [
      "An observatory consortium announced an open public astronomy slate, offering two-night observation blocks through the fall.",
      "Educators and amateur teams can apply. Selected proposals will be paired with a staff astronomer for instrument time.",
      "Applications close in three weeks.",
    ],
    category: "Science",
    source: "Lab Notebook",
    publishedAt: "Five days ago",
    readTime: "3 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(2990),
  },
  {
    id: "community-fund",
    title: "Local community fund posts its strongest quarter to date",
    summary: "Grants to childcare, food access, and small-arts groups all reached new records.",
    body: [
      "A long-running local community fund reported its strongest quarter to date.",
      "Grants to childcare, food access, and small-arts groups all reached new records during the period.",
      "The fund's board will meet next month to discuss the next round of priorities.",
    ],
    category: "Business",
    source: "Market Wire",
    publishedAt: "Five days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(3110),
  },
  {
    id: "documentary-series",
    title: "City film center premieres a documentary series",
    summary:
      "Six features from regional filmmakers will play over two weeks of evening screenings.",
    body: [
      "The city film center will premiere a documentary series featuring six regional filmmakers over two weeks of evening screenings.",
      "Each program pairs a feature with a short Q&A.",
      "Tickets are pay-what-you-can and sold at the door.",
    ],
    category: "Culture",
    source: "City Table",
    publishedAt: "Six days ago",
    readTime: "2 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    createdAt: minutesAgo(3260),
  },
];
