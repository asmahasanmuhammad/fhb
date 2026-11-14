/**
 * Reliable TV Channel Logo Resolver
 * Resolves channels to local SVGs and verified CDN logos.
 */

const BRAND_RULES: Array<{ pattern: RegExp; logo: string }> = [
  // Specific multi-word names first
  { pattern: /\btnt\s*sports?\b/i, logo: "/logos/channels/tntsports.svg" },
  { pattern: /\bt[- ]?sports?\b/i, logo: "/logos/channels/tsports.svg" },
  { pattern: /\bstar\s*sports?\b/i, logo: "/logos/channels/starsports.svg" },
  { pattern: /\bwillow\b/i, logo: "/logos/channels/willow.png" },
  { pattern: /\ba[- ]?sports?\b/i, logo: "/logos/channels/asports.png" },
  { pattern: /\bbein\b/i, logo: "/logos/channels/beinsports.svg" },
  { pattern: /\breal\s*madrid\b/i, logo: "/logos/channels/realmadrid.svg" },
  { pattern: /\b(barca|barcelona)\b/i, logo: "/logos/channels/barcelona.svg" },
  { pattern: /\bfifa\b/i, logo: "/logos/channels/fifa.svg" },
  { pattern: /\bcricket\s*gold\b/i, logo: "/logos/channels/cricketgold.svg" },
  { pattern: /\bdd\s*sports?\b/i, logo: "/logos/channels/ddsports.svg" },
  { pattern: /\bptv\b/i, logo: "/logos/channels/ptvsports.svg" },
  { pattern: /\bgoal\s*tv\b/i, logo: "/logos/channels/goaltv.svg" },
  { pattern: /\bred\s*bull\b/i, logo: "/logos/channels/redbull.svg" },
  { pattern: /\bufc\b/i, logo: "/logos/channels/ufc.svg" },
  { pattern: /\bwwe\b/i, logo: "/logos/channels/wwe.svg" },
  { pattern: /\bdazn\b/i, logo: "/logos/channels/dazn.svg" },
  { pattern: /\btennis\b/i, logo: "/logos/channels/tennis.svg" },
  { pattern: /\bnbc\b/i, logo: "/logos/channels/nbcsports.svg" },
  { pattern: /\bbahrain\b/i, logo: "/logos/channels/bahrainsports.svg" },
  { pattern: /\bswerve\b/i, logo: "/logos/channels/swervesports.svg" },
  { pattern: /\bstadium\b/i, logo: "/logos/channels/stadium.svg" },
  { pattern: /\beurosport\b/i, logo: "/logos/channels/eurosport.svg" },
  { pattern: /\b(sony|ten\s*sports?|ten\s*cricket)\b/i, logo: "/logos/channels/sonysports.svg" },
  { pattern: /\bsky\s*sports?\b/i, logo: "/logos/channels/skysports.svg" },
];

export function resolveChannelLogo(name: string, originalLogo?: string): string {
  const n = (name || "").trim();
  const orig = (originalLogo || "").trim();

  // 1. Check verified brand regex rules
  for (const rule of BRAND_RULES) {
    if (rule.pattern.test(n)) {
      return rule.logo;
    }
  }

  // 2. Filter out known 404/429 dead domains
  if (
    !orig ||
    orig.includes("wikipedia.org") ||
    orig.includes("wikimedia.org") ||
    orig.includes("paste.pics") ||
    orig.includes("assets.antenaplay.ro") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/star-sports") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/fc-barcelona") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/tnt-sports") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/dd-sports") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/goal-tv") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/bahrain-sports-1") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/ufc") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/wwe") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/dazn") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/nbc-sports") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/acc") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/swerve") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/stadium") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/ktv-sport") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/sports-first") ||
    orig.includes("raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/sports-fishing")
  ) {
    const nLower = n.toLowerCase();
    if (nLower.includes("cricket")) return "/logos/channels/cricketgold.svg";
    if (nLower.includes("football") || nLower.includes("soccer") || nLower.includes("goal")) return "/logos/channels/goaltv.svg";
    if (nLower.includes("fight") || nLower.includes("combat") || nLower.includes("boxing")) return "/logos/channels/ufc.svg";
    return "/logos/channels/sportsnetwork.svg";
  }

  return orig;
}
