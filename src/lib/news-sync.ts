import { db } from "@/lib/db";

export interface SyncResult {
  published: boolean;
  reason?: string;
  article?: {
    id: string;
    title: string;
    category: string;
    slug: string;
    createdAt: Date;
  };
  nextEligibleInMs?: number;
}

/**
 * Verified 100% Football-only, 100% English RSS Feeds
 */
const FEEDS = [
  {
    name: "BBC Sport Football",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    defaultCategory: "INTERNATIONAL",
  },
  {
    name: "Sky Sports Football",
    url: "https://www.skysports.com/rss/12040",
    defaultCategory: "INTERNATIONAL",
  },
  {
    name: "The Guardian Football",
    url: "https://www.theguardian.com/football/rss",
    defaultCategory: "INTERNATIONAL",
  },
  {
    name: "ESPN FC Soccer",
    url: "https://www.espn.com/espn/rss/soccer/news",
    defaultCategory: "INTERNATIONAL",
  },
];

const FALLBACK_COVERS = [
  "/news/news_cmwancsis0176ljfw8il4v70e.jpg",
  "/news/news_cmwancsj1017iljfw50iuxrfl.jpg",
  "/news/news_cmwancsir0174ljfwsa79r3zu.jpg",
  "/news/news_cmwancsip0172ljfwezkvayx1.jpg",
  "/news/news_cmwancsil016wljfw58uhu3cj.jpg",
  "/news/news_cmwancsim016yljfwwrjmv3sc.jpg",
];

/**
 * Strict Anti-Cricket and Non-Football Sports Blacklist
 * Cricket is strictly forbidden.
 */
const FORBIDDEN_TERMS = [
  "cricket",
  "ipl",
  "bpl cricket",
  "bcci",
  "bcb",
  "icc ",
  "t20",
  "odi",
  "test match",
  "wicket",
  "batsman",
  "batsmen",
  "bowler",
  "bowling",
  "innings",
  "century",
  "half-century",
  "cricketer",
  "stumps",
  "lbw",
  "sixes",
  "run-chase",
  "runs in",
  "batting",
  "suryavanshi",
  "ashwin",
  "kohli",
  "rohit sharma",
  "bumrah",
  "babar azam",
  "cricinfo",
  // Other non-football sports
  "rugby",
  "formula 1",
  "formula one",
  "tennis",
  "wimbledon",
  "grand slam",
  "golf",
  "basketball",
  "nba",
  "baseball",
  "hockey",
  "badminton",
  "boxing",
  "ufc",
  "mma",
];

const FOOTBALL_KEYWORDS = [
  "football",
  "soccer",
  "goal",
  "goals",
  "match",
  "league",
  "cup",
  "club",
  "premier league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "champions league",
  "europa league",
  "world cup",
  "fifa",
  "uefa",
  "afc",
  "saff",
  "striker",
  "midfielder",
  "defender",
  "goalkeeper",
  "manager",
  "coach",
  "transfer",
  "signing",
  "penalty",
  "pitch",
  "bfl",
  "derby",
  "arsenal",
  "chelsea",
  "liverpool",
  "man city",
  "manchester",
  "real madrid",
  "barcelona",
  "bayern",
  "psg",
  "juventus",
  "inter",
  "milan",
  "tottenham",
  "newcastle",
  "aston villa",
  "messi",
  "ronaldo",
  "haaland",
  "mbappe",
  "pochettino",
  "guardiola",
  "arteta",
  "hamza",
  "cabrera",
  "morsalin",
  "bangladesh",
];

function isForbiddenContent(text: string): boolean {
  // 1. Absolutely NO Bengali script allowed — must be 100% English
  if (/[\u0980-\u09FF]/.test(text)) return true;

  // 2. Strict cricket and non-football blacklist
  const lower = text.toLowerCase();
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) return true;
  }

  return false;
}

function isFootballRelated(title: string, desc: string): boolean {
  const combined = `${title} ${desc}`.toLowerCase();
  return FOOTBALL_KEYWORDS.some((kw) => combined.includes(kw));
}

function cleanHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSlug(title: string): string {
  // English ASCII only
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 65);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${clean}-${suffix}`.replace(/--+/g, "-");
}

function detectCategory(title: string, desc: string): string {
  const combined = `${title} ${desc}`.toLowerCase();
  if (
    combined.includes("transfer") ||
    combined.includes("signing") ||
    combined.includes("deal") ||
    combined.includes("bid") ||
    combined.includes("contract") ||
    combined.includes("fee") ||
    combined.includes("loan")
  ) {
    return "TRANSFER";
  }
  if (
    combined.includes("bfl") ||
    combined.includes("bashundhara") ||
    combined.includes("kings") ||
    combined.includes("mohammedan") ||
    combined.includes("abahani") ||
    combined.includes("police fc") ||
    combined.includes("fortis")
  ) {
    return "BFL";
  }
  if (
    combined.includes("bangladesh") ||
    combined.includes("hamza") ||
    combined.includes("cabrera") ||
    combined.includes("morsalin") ||
    combined.includes("saff") ||
    combined.includes("bengal tigers")
  ) {
    return "NATIONAL";
  }
  return "INTERNATIONAL";
}

interface ParsedItem {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  sourceName: string;
}

async function fetchFeedItems(feed: typeof FEEDS[0]): Promise<ParsedItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FHBNewsAggregator/2.0",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: ParsedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRegex.exec(xml)) !== null && items.length < 20) {
      const block = m[1];
      const rawTitle =
        (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
          block.match(/<title>([\s\S]*?)<\/title>/i))?.[1] || "";
      const rawDesc =
        (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
          block.match(/<description>([\s\S]*?)<\/description>/i))?.[1] || "";
      const rawLink =
        (block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) ||
          block.match(/<link>([\s\S]*?)<\/link>/i))?.[1] || "";

      // Image extract (thumbnails, enclosures, media:content, inline img src)
      const imgMatch =
        block.match(/<media:thumbnail[^>]+url=["'](https?:\/\/[^"']+)["']/i) ||
        block.match(/<media:content[^>]+url=["'](https?:\/\/[^"']+)["']/i) ||
        block.match(/<enclosure[^>]+url=["'](https?:\/\/[^"']+)["']/i) ||
        block.match(/url=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i) ||
        rawDesc.match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i);

      const title = cleanHtml(rawTitle);
      const description = cleanHtml(rawDesc);
      const link = rawLink.trim();
      let imageUrl = imgMatch?.[1];
      if (imageUrl) {
        imageUrl = imageUrl.replace(/&amp;/g, "&");
      }

      // Strict Validation:
      // 1. Must be at least 15 chars
      // 2. Must NOT be forbidden (no cricket, no non-football sports, NO Bengali script)
      // 3. Must be football related
      if (
        title &&
        title.length >= 15 &&
        !isForbiddenContent(title) &&
        !isForbiddenContent(description) &&
        isFootballRelated(title, description)
      ) {
        items.push({
          title,
          description: description || title,
          link,
          imageUrl,
          sourceName: feed.name,
        });
      }
    }
    return items;
  } catch (err) {
    console.error(`[news-sync] Failed to fetch feed ${feed.name}:`, err);
    return [];
  }
}

/**
 * Automatically syncs and publishes 1 new 100% football, 100% English news article if 30 minutes have elapsed.
 * @param force If true, bypasses the 30-minute cooldown check.
 */
export async function autoSyncOneNewsArticle(force = false): Promise<SyncResult> {
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  const now = Date.now();

  // 0. Auto-cleanup legacy Bengali or non-football articles from SQLite if any exist
  try {
    await db.newsArticle.deleteMany({
      where: {
        OR: [
          { title: { contains: "সূর্যবংশী" } },
          { title: { contains: "ফুটবল" } },
          { title: { contains: "টস" } },
          { slug: { contains: "p28vro" } },
          { slug: { contains: "6p9p89" } },
        ],
      },
    });
  } catch (cleanupErr) {
    // Ignore cleanup error if already deleted
  }

  // 1. Check timestamp of last published article
  try {
    const latest = await db.newsArticle.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, title: true },
    });

    if (!force && latest) {
      const elapsed = now - new Date(latest.createdAt).getTime();
      if (elapsed < THIRTY_MINUTES_MS) {
        return {
          published: false,
          reason: `Cooldown active: ${Math.round(elapsed / 60000)} mins since last post (wait ${Math.round((THIRTY_MINUTES_MS - elapsed) / 60000)}m)`,
          nextEligibleInMs: THIRTY_MINUTES_MS - elapsed,
        };
      }
    }
  } catch (e) {
    console.error("[news-sync] Error checking latest article:", e);
  }

  // 2. Resolve default author
  let author = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (!author) {
    author = await db.user.findFirst({
      select: { id: true },
    });
  }

  if (!author) {
    return { published: false, reason: "No user found in database to set as author" };
  }

  // 3. Fetch from verified English football feeds (shuffled)
  const shuffledFeeds = [...FEEDS].sort(() => Math.random() - 0.5);

  for (const feed of shuffledFeeds) {
    const items = await fetchFeedItems(feed);

    for (const item of items) {
      // Deduplication check: check if article already exists in DB
      const existing = await db.newsArticle.findFirst({
        where: {
          OR: [
            { title: item.title },
            { title: { contains: item.title.slice(0, 30) } },
          ],
        },
        select: { id: true },
      });

      if (existing) {
        continue; // Already published, try next item
      }

      // New English football article found!
      const category = detectCategory(item.title, item.description);
      const slug = generateSlug(item.title);
      const coverUrl =
        item.imageUrl ||
        FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];

      const markdownContent = `**${item.title}**

${item.description}

---

*This article was automatically curated from verified football sources.*  
*Original Source: [${item.sourceName}](${item.link || "#"})*
`;

      const newArticle = await db.newsArticle.create({
        data: {
          title: item.title,
          slug,
          excerpt: item.description.slice(0, 200),
          content: markdownContent,
          category,
          coverUrl,
          authorId: author.id,
          status: "PUBLISHED",
          featured: true,
          views: Math.floor(Math.random() * 800) + 150,
          likeCount: Math.floor(Math.random() * 50) + 10,
          commentCount: Math.floor(Math.random() * 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
          createdAt: true,
        },
      });

      console.log(`[news-sync] Successfully published football article: "${newArticle.title}" (${category})`);

      return {
        published: true,
        article: newArticle,
      };
    }
  }

  return {
    published: false,
    reason: "No new unique football articles found across all feeds.",
  };
}
