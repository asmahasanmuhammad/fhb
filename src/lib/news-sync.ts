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

const FEEDS = [
  {
    name: "Dhaka Post Sports",
    url: "https://www.dhakapost.com/rss/sports.xml",
    defaultCategory: "NATIONAL",
    lang: "bn",
  },
  {
    name: "ESPN FC Soccer",
    url: "https://www.espn.com/espn/rss/soccer/news",
    defaultCategory: "INTERNATIONAL",
    lang: "en",
  },
  {
    name: "BBC Sport Football",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    defaultCategory: "INTERNATIONAL",
    lang: "en",
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
    .replace(/\s+/g, " ")
    .trim();
}

function generateSlug(title: string): string {
  // Transliterate/clean title to ascii or alphanumeric
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 70);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${clean}-${suffix}`.replace(/--+/g, "-");
}

function detectCategory(title: string, desc: string): string {
  const combined = `${title} ${desc}`.toLowerCase();
  if (
    combined.includes("দলবদল") ||
    combined.includes("চুক্তি") ||
    combined.includes("transfer") ||
    combined.includes("signing") ||
    combined.includes("deal") ||
    combined.includes("fee")
  ) {
    return "TRANSFER";
  }
  if (
    combined.includes("বিপিএল") ||
    combined.includes("বসুন্ধরা") ||
    combined.includes("মোহামেডান") ||
    combined.includes("আবাহনী") ||
    combined.includes("বাফুফে") ||
    combined.includes("bfl") ||
    combined.includes("kings") ||
    combined.includes("sheikh") ||
    combined.includes("bashundhara") ||
    combined.includes("abahan")
  ) {
    return "BFL";
  }
  if (
    combined.includes("বাংলাদেশ") ||
    combined.includes("জামাল") ||
    combined.includes("মোরসালিন") ||
    combined.includes("হামজা") ||
    combined.includes("bangladesh") ||
    combined.includes("saff") ||
    combined.includes("choudhury")
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FHBNewsAggregator/1.0",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: ParsedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRegex.exec(xml)) !== null && items.length < 15) {
      const block = m[1];
      const rawTitle = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || block.match(/<title>([\s\S]*?)<\/title>/i))?.[1] || "";
      const rawDesc = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || block.match(/<description>([\s\S]*?)<\/description>/i))?.[1] || "";
      const rawLink = (block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) || block.match(/<link>([\s\S]*?)<\/link>/i))?.[1] || "";
      
      // Image extract
      const imgMatch =
        block.match(/url=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i) ||
        block.match(/<enclosure[^>]+url=["'](https?:\/\/[^"']+)["']/i) ||
        rawDesc.match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i);
      
      const title = cleanHtml(rawTitle);
      const description = cleanHtml(rawDesc);
      const link = rawLink.trim();
      const imageUrl = imgMatch?.[1];

      if (title && title.length > 10) {
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
 * Automatically syncs and publishes 1 new sports news article if 30 minutes have elapsed.
 * @param force If true, bypasses the 30-minute cooldown check.
 */
export async function autoSyncOneNewsArticle(force = false): Promise<SyncResult> {
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  const now = Date.now();

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

  // 3. Fetch from feeds in order (shuffling feeds slightly for diversity)
  const shuffledFeeds = [...FEEDS].sort(() => Math.random() - 0.5);

  for (const feed of shuffledFeeds) {
    const items = await fetchFeedItems(feed);

    for (const item of items) {
      // Check if article already exists in DB
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
        continue; // Already published, try next
      }

      // New article found! Publish it now.
      const category = detectCategory(item.title, item.description);
      const slug = generateSlug(item.title);
      const coverUrl =
        item.imageUrl ||
        FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];

      const markdownContent = `**${item.title}**

${item.description}

---

*প্রতিবেদনটি স্বয়ংক্রিয়ভাবে সংগৃহীত ও প্রকাশিত।*  
*মূল সোর্স: [${item.sourceName}](${item.link || "#"})*
`;

      const newArticle = await db.newsArticle.create({
        data: {
          title: item.title,
          slug,
          excerpt: item.description.slice(0, 220),
          content: markdownContent,
          category,
          coverUrl,
          authorId: author.id,
          status: "PUBLISHED",
          featured: Math.random() < 0.25, // 25% chance of being featured
          views: Math.floor(Math.random() * 500) + 150,
          likeCount: Math.floor(Math.random() * 35) + 8,
          commentCount: Math.floor(Math.random() * 6),
          createdAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
          createdAt: true,
        },
      });

      console.log(`[news-sync] ✅ Successfully auto-published 1 new article: "${newArticle.title}" (${newArticle.category})`);

      return {
        published: true,
        article: newArticle,
      };
    }
  }

  return {
    published: false,
    reason: "No new unread articles found across all feeds right now",
  };
}
