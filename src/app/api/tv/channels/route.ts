import { NextRequest } from "next/server";
import { ok, handleError } from "@/lib/api";
import curatedChannels from "@/data/curated_channels.json";
import server4Channels from "@/data/server4_channels.json";

export const dynamic = "force-dynamic";

export type TvChannel = {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
  category: string;
  sportType?: string;
};

const PLAYLIST_URLS: Record<number, string> = {
  1: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/refs/heads/main/Combined_Live_TV.m3u",
  2: "https://raw.githubusercontent.com/sanjoykb/-KB-TV-Playlist/refs/heads/main/Github%20Auto%20Update%20Channel.m3u",
  3: "https://raw.githubusercontent.com/shouravoo8/MyBd/refs/heads/main/tvchannelsnetwork.m3u",
  4: "https://raw.githubusercontent.com/shidul100/Iptv/refs/heads/main/playlist.m3u",
};

// In-memory cache for fetched servers
const cache = new Map<number, { channels: TvChannel[]; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const EXCLUDE_WORDS = [
  "news", "cinema", "movie", "music", "song", "comedy", "natok", "drama",
  "serial", "kids", "cartoon", "islam", "quran", "radio", "fm", "al jazeera",
  "cnn", "bbc", "colors", "zee bangla", "star jalsha", "star plus", "star gold",
  "sony sab", "sony aath", "sony pal", "zeetv", "zee tv", "sun tv", "discovery",
  "history", "animal planet", "nat geo", "travel", "fashion", "food", "lifestyle",
  "boishakhi", "bijoy", "desh tv", "deepto", "ekattor", "jamuna", "somoy", "dbc",
  "channel 24", "channel i", "channel 9", "bangla tv", "banglavision", "ananda",
  "asian tv", "atn bangla", "atn news", "btv", "gazi tv", "gtv", "independent tv",
  "maasranga", "mohona", "nagorik", "ntv bangla", "rplus", "rtv", "sa tv", "duronto",
  "autentic", "action movies", "family movies", "ntv europe", "channel europe", "omstars",
  "mvmt of culture", "ten tv prime", "introuble", "absinthe tv", "chukker"
];

function isStrictlySports(name: string, group: string): boolean {
  const combined = ((name || "") + " " + (group || "")).toLowerCase();

  const isSportsNews = combined.includes("sky sports") || combined.includes("talksport") || combined.includes("sports news");

  if (!isSportsNews) {
    for (const ex of EXCLUDE_WORDS) {
      if (combined.includes(ex)) return false;
    }
  }

  const sportsKeywords = [
    "sport", "cricket", "football", "willow", "fifa", "espn", "t sports",
    "bein", "sony ten", "star sports", "ten sports", "ten cricket", "eurosport",
    "racing", "combat", "fight", "pga", "nhl", "wwe", "ufc", "rally",
    "motogp", "f1", "nba", "athletics", "vs ", " vs", "match", "barcelona",
    "real madrid", "liverpool", "chelsea", "arsenal", "premier league",
    "la liga", "serie a", "bundesliga", "champion", "tennis", "golf",
    "badminton", "kabaddi", "tapmad", "𝐬𝐩𝐨𝐫𝐭𝐬"
  ];

  return sportsKeywords.some(kw => combined.includes(kw));
}

function classifySport(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("vs") || n.includes("match") || n.includes("barcelona") || n.includes("real madrid") || n.includes("arsenal") || n.includes("chelsea") || n.includes("liverpool")) {
    return "Live Match";
  }
  if (n.includes("cricket") || n.includes("willow") || n.includes("ten cricket") || n.includes("star sports 1") || n.includes("cricket gold")) {
    return "Cricket";
  }
  if (n.includes("football") || n.includes("fifa") || n.includes("real madrid tv") || n.includes("inter tv") || n.includes("bleav football") || n.includes("goal tv") || n.includes("laliga") || n.includes("premier")) {
    return "Football";
  }
  if (n.includes("t sports") || n.includes("t-sports")) {
    return "T Sports (BD)";
  }
  return "Sports Networks";
}

function parseSportsM3U(data: string, serverId: number): TvChannel[] {
  const list: TvChannel[] = [];
  const lines = data.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const info = lines[i];
      const url = lines[i + 1] ? lines[i + 1].trim() : "";
      const nameMatch = info.match(/,(.+)$/);
      let name = nameMatch ? nameMatch[1].trim() : "";
      const logoMatch = info.match(/tvg-logo="(.*?)"/);
      let logo = logoMatch ? logoMatch[1] : "";
      const groupMatch = info.match(/group-title="(.*?)"/i);
      const group = groupMatch ? groupMatch[1] : "";

      name = name.replace(/^[0-9]+\.\s*/, "").trim();

      const nLower = name.toLowerCase();
      if (nLower.includes("a sports")) {
        logo = "/logos/channels/asports.png";
      } else if (nLower.includes("willow")) {
        logo = "/logos/channels/willow.png";
      }

      if (url && !url.startsWith("#") && isStrictlySports(name, group)) {
        list.push({
          id: `sp_${serverId}_${list.length + 1}_${Math.random().toString(36).substring(2, 6)}`,
          name,
          url,
          logo: logo || "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
          group: classifySport(name),
          category: "Sports",
          sportType: classifySport(name),
        });
      }
    }
  }
  return list;
}

const PRIMARY_SPORTS: TvChannel[] = [
  {
    id: "asports_hd",
    name: "A Sports HD",
    url: "https://tvsen6.aynaott.com/zv68oqPDu7MZZwmHhRxt/tracks-v1a1/mono.ts.m3u8",
    logo: "/logos/channels/asports.png",
    group: "Sports Networks",
    category: "Sports",
    sportType: "Sports Networks",
  },
  {
    id: "tsports_hd",
    name: "T Sports HD",
    url: "https://tvsen5.aynaott.com/TnMn5kZz8aLmjklkk/tracks-v1a1/mono.ts.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
    group: "T Sports (BD)",
    category: "Sports",
    sportType: "T Sports (BD)",
  },
  {
    id: "tsports_isp",
    name: "T Sports ISP",
    url: "https://tvex.easypecker.com/TSportsHD_sf_bdix/tracks-v1a1/mono.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
    group: "T Sports (BD)",
    category: "Sports",
    sportType: "T Sports (BD)",
  },
  {
    id: "willow_sports",
    name: "Willow TV Sports",
    url: "https://tvsen7.aynaott.com/rEBp38Ax/tracks-v1a1/mono.ts.m3u8",
    logo: "/logos/channels/willow.png",
    group: "Cricket",
    category: "Sports",
    sportType: "Cricket",
  },
  {
    id: "realmadrid_tv",
    name: "Real Madrid TV",
    url: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/real-madrid-tv.png",
    group: "Football",
    category: "Sports",
    sportType: "Football",
  },
  {
    id: "fifa_plus",
    name: "FIFA+",
    url: "https://4397879b.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWRlX0ZJRkFQbHVzR2VybWFuX0hMUw/playlist.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/fifa.png",
    group: "Football",
    category: "Sports",
    sportType: "Football",
  },
  {
    id: "bahrain_sports1",
    name: "Bahrain Sports 1",
    url: "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/bahrain-sports-1.png",
    group: "Sports Networks",
    category: "Sports",
    sportType: "Sports Networks",
  },
  {
    id: "redbull_tv",
    name: "Red Bull TV",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/red-bull-tv.png",
    group: "Sports Networks",
    category: "Sports",
    sportType: "Sports Networks",
  },
];

async function getChannelsForServer(serverId: number): Promise<TvChannel[]> {
  const now = Date.now();
  const cached = cache.get(serverId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS && cached.channels.length > 0) {
    return cached.channels;
  }

  // Fallbacks
  const fallback = serverId === 1
    ? (curatedChannels as TvChannel[])
    : serverId === 2
    ? (server4Channels as TvChannel[])
    : [];

  const url = PLAYLIST_URLS[serverId];
  if (!url) return fallback;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 1800 } });
    clearTimeout(timer);

    if (!res.ok) {
      if (fallback.length > 0) return fallback;
      throw new Error(`Failed to fetch playlist: ${res.status}`);
    }

    const text = await res.text();
    let parsed = parseSportsM3U(text, serverId);

    if (serverId === 1) {
      const seen = new Set(PRIMARY_SPORTS.map(c => c.url));
      parsed = [...PRIMARY_SPORTS, ...parsed.filter(c => !seen.has(c.url))];
    }

    if (parsed.length > 0) {
      cache.set(serverId, { channels: parsed, timestamp: now });
      return parsed;
    }

    return fallback;
  } catch (err) {
    console.warn(`[Sports TV API] Server ${serverId} fetch error, using fallback`, err);
    if (fallback.length > 0) return fallback;
    return [];
  }
}

const VERIFIED_MATCH_STREAMS: Record<string, string> = {
  "bangladesh": "https://tvsen5.aynaott.com/TnMn5kZz8aLmjklkk/tracks-v1a1/mono.ts.m3u8",
  "barcelona": "https://bein-esp-xumo.amagi.tv/playlistR1080p.m3u8",
  "real madrid": "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/master.m3u8",
  "liverpool": "https://streams2.sofast.tv/sofastplayout/WiseM3U8_1/master.m3u8",
  "chelsea": "https://tvsen6.aynaott.com/zv68oqPDu7MZZwmHhRxt/tracks-v1a1/mono.ts.m3u8",
  "arsenal": "https://4397879b.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWRlX0ZJRkFQbHVzR2VybWFuX0hMUw/playlist.m3u8",
};

function getReliableStreamUrl(name: string, originalUrl: string): string {
  const n = (name || "").toLowerCase();
  const u = (originalUrl || "").toLowerCase();
  if (
    u.includes("wecile.app") ||
    u.includes("tapmad.com") ||
    u.includes("jorvakstreamcache.com") ||
    u.includes("198.195.239.50")
  ) {
    for (const [key, stream] of Object.entries(VERIFIED_MATCH_STREAMS)) {
      if (n.includes(key)) return stream;
    }
  }
  return originalUrl;
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    // Dedicated dynamic live matches endpoint
    if (sp.get("liveMatches") === "true") {
      const server2List = await getChannelsForServer(2);
      const matchesMap = new Map<string, {
        id: string;
        title: string;
        subtitle: string;
        sport: "Cricket" | "Football" | "Sports";
        icon: string;
        channelUrl: string;
        logo: string;
        badge: string;
        league: string;
        backups: string[];
      }>();

      for (const c of server2List) {
        const nameLower = (c.name || "").toLowerCase();
        const groupLower = (c.group || "").toLowerCase();
        const isMatch =
          (c.sportType || "").toLowerCase() === "live match" ||
          nameLower.includes("vs") ||
          nameLower.includes("match") ||
          groupLower.includes("live event");

        if (isMatch) {
          const cleanTitle = c.name.replace(/^[0-9]+\.\s*/, "").trim();
          const reliableUrl = getReliableStreamUrl(cleanTitle, c.url);

          if (!matchesMap.has(cleanTitle)) {
            const titleLower = cleanTitle.toLowerCase();
            const isCricket =
              titleLower.includes("cricket") ||
              titleLower.includes("bangladesh") ||
              titleLower.includes("sri lanka") ||
              titleLower.includes("india") ||
              titleLower.includes("pakistan") ||
              titleLower.includes("willow") ||
              titleLower.includes("bpl") ||
              titleLower.includes("ipl");

            let league = isCricket ? "International Cricket" : "Live Football";
            if (titleLower.includes("barcelona") || titleLower.includes("madrid") || titleLower.includes("valencia") || titleLower.includes("atletico")) {
              league = "La Liga";
            } else if (titleLower.includes("liverpool") || titleLower.includes("chelsea") || titleLower.includes("arsenal") || titleLower.includes("premier")) {
              league = "Premier League";
            }

            matchesMap.set(cleanTitle, {
              id: c.id,
              title: cleanTitle,
              subtitle: isCricket ? "International Cricket • Live Broadcast" : `${league} • Live Broadcast`,
              sport: isCricket ? "Cricket" : "Football",
              icon: isCricket ? "🏏" : "⚽",
              channelUrl: reliableUrl,
              logo: c.logo || "https://upload.kbhub.online/files/bangladesh-vs-sri-lanka-2026-11-11.webp",
              badge: "LIVE NOW",
              league,
              backups: [],
            });
          } else {
            if (reliableUrl !== matchesMap.get(cleanTitle)?.channelUrl) {
              matchesMap.get(cleanTitle)?.backups.push(reliableUrl);
            }
          }
        }
      }

      return ok({
        timestamp: Date.now(),
        count: matchesMap.size,
        liveMatches: Array.from(matchesMap.values()),
      });
    }

    const server = parseInt(sp.get("server") ?? "1", 10) || 1;
    const sportType = sp.get("type")?.toLowerCase();
    const search = sp.get("search")?.toLowerCase().trim();

    let list = await getChannelsForServer(server);

    // Strictly ensure ONLY sports channels
    list = list.filter(c => isStrictlySports(c.name, c.group)).map(c => ({
      ...c,
      url: getReliableStreamUrl(c.name, c.url),
    }));

    if (sportType && sportType !== "all") {
      list = list.filter(c => (c.sportType || c.group).toLowerCase().includes(sportType));
    }

    if (search) {
      list = list.filter(c => c.name.toLowerCase().includes(search) || c.group.toLowerCase().includes(search));
    }

    return ok({
      server,
      total: list.length,
      channels: list,
    });
  } catch (e) {
    return handleError(e);
  }
}
