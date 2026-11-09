// Shared frontend types mirroring API responses

export type SafeUser = {
  id: string;
  email?: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role: "USER" | "CREATOR" | "ADMIN";
  isPremium: boolean;
  premiumUntil?: string | null;
  followerCount?: number;
  followingCount?: number;
  earningsTotal?: number;
  createdAt?: string;
};

export type TeamRef = {
  id: string;
  name: string;
  shortName?: string;
  initials: string;
  color: string;
  color2?: string;
  city?: string;
};

export type CompetitionRef = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  accentColor?: string;
};

export type Match = {
  id: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  period: string | null;
  kickoff: string;
  venue: string | null;
  matchday: number | null;
  round: string | null;
  featured: boolean;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  competition: CompetitionRef;
};

export type MatchEvent = {
  id: string;
  minute: number;
  type: "GOAL" | "YELLOW" | "RED" | "SUB" | "HT" | "FT" | "PENALTY" | string;
  teamSide: "home" | "away" | null;
  playerName: string | null;
  detail: string | null;
};

export type MatchDetail = Match & { events: MatchEvent[] };

export type Standing = {
  id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string | null;
  team: TeamRef;
};

export type Player = {
  id: string;
  name: string;
  position: "GK" | "DF" | "MF" | "FW" | string;
  nationality: string;
  jerseyNumber: number | null;
  birthYear: number | null;
  heightCm: number | null;
  goals: number;
  assists: number;
  appearances: number;
  cleanSheets: number;
  rating: number;
  isNationalTeam: boolean;
  bio: string | null;
  team: TeamRef | null;
};

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverUrl: string | null;
  status: string;
  featured: boolean;
  views: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: { id: string; name: string; username: string; avatarUrl?: string | null; bio?: string | null };
};

export type Video = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  tags: string | null;
  views: number;
  likeCount: number;
  commentCount: number;
  monetized: boolean;
  createdAt: string;
  creator: { id: string; name: string; username: string; avatarUrl?: string | null; followerCount?: number; isPremium?: boolean };
};

export type Post = {
  id: string;
  content: string;
  matchTag: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: { id: string; name: string; username: string; avatarUrl?: string | null; isPremium?: boolean; role?: string; followerCount?: number };
};

export type Comment = {
  id: string;
  content: string;
  likeCount: number;
  createdAt: string;
  user: { id: string; name: string; username: string; avatarUrl?: string | null; isPremium?: boolean; role?: string };
};

export type LiveMatchUpdate = {
  id: string;
  minute: number;
  period: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; initials: string; color: string };
  awayTeam: { id: string; name: string; initials: string; color: string };
  status: "LIVE";
};

export type AdSlotData = {
  id: string;
  name: string;
  placement: string;
  provider: string;
  adCode: string | null;
  imageHint: string | null;
  linkUrl: string | null;
  headline: string | null;
  bodyText: string | null;
  ctaLabel: string | null;
  brandColor: string | null;
  brandInitials: string | null;
  active: boolean;
  impressions: number;
  clicks: number;
};

export type MembershipPlan = {
  id: string;
  code: "FREE" | "PRO" | "LEGEND" | string;
  name: string;
  price: number;
  period: string;
  features: string; // JSON array
  popular: boolean;
  sortOrder: number;
};

export const CATEGORY_LABELS: Record<string, string> = {
  ALL: "All",
  BFL: "Bangladesh Football League",
  NATIONAL: "National Team",
  TRANSFER: "Transfer",
  INTERNATIONAL: "International",
  OPINION: "Opinion",
};

/** Team initials that mark national teams (used for grouping/filters). */
export const NATIONAL_TEAM_INITIALS = ["BAN", "IND", "MDV", "NEP", "ESP", "ARG"];

export const POSITION_LABELS: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};
