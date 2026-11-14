"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import type { SafeUser, Post, Video } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { timeAgo, fmtCompact, fmtLocale, formatMoney } from "@/lib/format";
import { AdSlot } from "@/components/football/ad-slot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Crown, UserPlus, UserCheck, Play, Pencil, Check, X, LogIn, Wallet,
  LayoutGrid, MessageSquare, Heart, CalendarDays, Info, Upload, Users,
  Share2, Link2, Twitter, Facebook,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   ProfileView — public member profile with cover, crown badge,
   stats strip, follow animation and social sharing.
   ════════════════════════════════════════════════════════════════ */

type TabKey = "posts" | "videos" | "about";

/** Animated gradient mesh cover used when no cover photo is set. */
function GradientCover({ seed }: { seed: string }) {
  // Deterministic hue from seed string
  const h1 = (seed.charCodeAt(0) * 37 + seed.charCodeAt(1) * 19) % 360;
  const h2 = (h1 + 140) % 360;
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 20% 40%, hsl(${h1} 60% 18%) 0%, transparent 70%),
                     radial-gradient(ellipse 60% 80% at 80% 60%, hsl(${h2} 55% 15%) 0%, transparent 70%),
                     radial-gradient(ellipse 100% 100% at 50% 50%, #06080f 60%, #0d1225 100%)`,
      }}
    />
  );
}

/** Social share sheet — copies link or opens native share. */
function ShareSheet({ username }: { username: string }) {
  const { toast } = useToast();
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`;
  const copy = async () => {
    await navigator.clipboard.writeText(url).catch(() => {});
    toast({ title: "Link copied!" });
  };
  const nativeShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: `@${username} on FHBD`, url });
    }
  };
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={copy}
        title="Copy profile link"
        className="tap-target flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden />
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=Check+out+%40${username}+on+Football+Hub+Bangladesh&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        title="Share on X / Twitter"
        className="tap-target flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-[#1d9bf0]/40 hover:text-[#1d9bf0]"
      >
        <Twitter className="h-3.5 w-3.5" aria-hidden />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        title="Share on Facebook"
        className="tap-target flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-[#1877f2]/40 hover:text-[#1877f2]"
      >
        <Facebook className="h-3.5 w-3.5" aria-hidden />
      </a>
      {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
        <button
          onClick={nativeShare}
          title="Share via device"
          className="tap-target flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function ProfileView({ username }: { username?: string }) {
  const me = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  useReveal();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("posts");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [followAnim, setFollowAnim] = useState(false);

  const targetUsername = username ?? me?.username;
  const isMe = !username || username === me?.username;

  const { data, isLoading } = useQuery<{
    user: SafeUser;
    posts: Post[];
    videos: Video[];
    following: boolean;
    totalLikes: number;
  }>({
    queryKey: ["profile", targetUsername, me?.id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${targetUsername}`);
      if (!res.ok) return null;
      return res.json().then((j) => j.data);
    },
    enabled: !!targetUsername,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: data!.user.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onMutate: () => setFollowAnim(true),
    onSettled: () => setTimeout(() => setFollowAnim(false), 600),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", targetUsername] }),
    onError: (e: Error) => toast({ title: "Follow failed", description: e.message, variant: "destructive" }),
  });

  if (!me && !username) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground">
          <LogIn className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="label-cond text-[16px] font-bold tracking-[0.05em] text-foreground">Your profile lives behind a login</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Log in to see your posts, shorts, followers and earnings in one place.
          </p>
        </div>
        <Button
          onClick={() => navigate({ name: "auth" })}
          className="h-10 gap-2 rounded-[7px] bg-primary px-6 text-[11.5px] font-bold uppercase tracking-wider"
        >
          <LogIn className="h-4 w-4" aria-hidden /> Log In / Sign Up
        </Button>
      </div>
    );
  }

  if (isLoading || !data?.user) {
    if (!isLoading && !data) {
      return (
        <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground">
            <Info className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="label-cond text-[16px] font-bold tracking-[0.05em] text-foreground">Profile not found</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {targetUsername ? `No FHBD member goes by "@${targetUsername}".` : "This profile is unavailable."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ name: "community" })}
            className="h-9 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
          >
            Back to the community
          </Button>
        </div>
      );
    }
    return (
      <div className="mx-auto w-full max-w-[860px] space-y-5 px-4 pt-5 sm:px-6 lg:pt-7">
        <div className="overflow-hidden rounded-xl border border-border bg-card" aria-hidden>
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="flex flex-wrap items-start gap-5 p-5">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3 pt-1">
              <Skeleton className="h-6 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-3.5 w-64 max-w-full rounded-md" />
            </div>
          </div>
          <Skeleton className="mx-5 mb-5 h-12 w-full max-w-[460px] rounded-md" />
        </div>
        <Skeleton className="h-11 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  const { user, posts, videos, following } = data;
  const canManageContent = isMe && (me?.role === "CREATOR" || me?.role === "ADMIN");

  const joinedLine = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const likedRanked = [...posts].sort((a, b) => b.likeCount - a.likeCount);

  /* ── Stats strip data ── */
  type StatCell = { label: string; value: string; icon?: React.ReactNode; highlight?: boolean };
  const statCells: StatCell[] = [
    { label: "Posts", value: fmtLocale(posts.length) },
    {
      label: "Followers",
      value: fmtLocale(user.followerCount ?? 0),
      icon: <Users className="h-3.5 w-3.5" aria-hidden />,
      highlight: true,
    },
    {
      label: "Following",
      value: fmtLocale(user.followingCount ?? 0),
      icon: <UserCheck className="h-3.5 w-3.5" aria-hidden />,
    },
    { label: "Shorts", value: fmtLocale(videos.length) },
  ];
  if (isMe && me?.earningsTotal != null) {
    statCells.push({
      label: "Earnings",
      value: formatMoney(me.earningsTotal),
      icon: <Wallet className="h-3.5 w-3.5" aria-hidden />,
      highlight: true,
    });
  }

  const tabs: Array<{ key: TabKey; label: string; count?: number }> = [
    { key: "posts", label: "Posts", count: posts.length },
    { key: "videos", label: "Videos", count: videos.length },
    { key: "about", label: "About" },
  ];

  const isCreator = user.role === "CREATOR";
  const badgeLabel = user.role === "ADMIN" ? "ADMIN" : isCreator ? "CREATOR" : user.isPremium ? "PRO FAN" : null;
  const badgeCls = user.role === "ADMIN"
    ? "border-fhb-red/30 bg-fhb-red/15 text-fhb-red"
    : isCreator
    ? "border-primary/30 bg-primary/15 text-primary"
    : "border-fhb-gold/30 bg-fhb-gold/15 text-fhb-gold";

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      {/* ═══ Profile card ═══ */}
      <header className="reveal overflow-hidden rounded-xl border border-border bg-card" aria-label={`${user.name} profile`}>

        {/* Cover photo */}
        <div className="relative h-36 w-full overflow-hidden sm:h-44">
          <GradientCover seed={user.username} />
          {/* Cover overlay grid pattern */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Badge pill floating on cover */}
          {badgeLabel && (
            <span
              className={cn(
                "absolute right-3 top-3 flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
                badgeCls
              )}
            >
              {isCreator && <Crown className="h-3 w-3" aria-hidden />}
              {badgeLabel}
            </span>
          )}
        </div>

        {/* Identity row */}
        <div className="flex flex-wrap items-start gap-5 px-5 pb-0 pt-0 sm:px-6">
          {/* Avatar — overlaps the cover */}
          <div className="relative -mt-12 shrink-0 sm:-mt-14">
            <Avatar
              className={cn(
                "h-20 w-20 rounded-full border-4 border-card sm:h-24 sm:w-24",
                user.isPremium ? "ring-2 ring-fhb-gold/60 ring-offset-2 ring-offset-card" : ""
              )}
            >
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="rounded-full bg-primary/15 font-display text-2xl font-bold text-primary">
                {user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {user.isPremium && (
              <span
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-fhb-gold text-black"
                title="Premium member"
              >
                <Crown className="h-3.5 w-3.5" aria-hidden />
              </span>
            )}
          </div>

          {/* Name + bio + actions */}
          <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3 pt-3">
            <div className="min-w-0">
              {editing ? (
                <div className="space-y-2.5">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Name"
                    className="h-10 w-full max-w-xs rounded-[6px] border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary/50"
                    aria-label="Edit name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Bio..."
                    rows={2}
                    className="w-full max-w-md resize-none rounded-[6px] border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                    aria-label="Edit bio"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        useAppStore.getState().setUser({ ...me!, name: editForm.name || me!.name });
                        setEditing(false);
                        toast({ title: "Profile updated" });
                      }}
                      className="h-8 gap-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="h-8 gap-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[22px] font-bold leading-none tracking-[-0.015em] text-foreground sm:text-[26px]">
                      {user.name}
                    </h1>
                    {user.isPremium && (
                      <span className="flex items-center gap-1 rounded-[4px] bg-fhb-gold/15 px-2 py-0.5 text-[10px] font-bold text-fhb-gold">
                        <Crown className="h-3 w-3" aria-hidden /> Premium
                      </span>
                    )}
                    {user.role === "ADMIN" && (
                      <span className="rounded-[4px] bg-fhb-red/15 px-2 py-0.5 text-[10px] font-bold text-fhb-red">Admin</span>
                    )}
                    {user.role === "CREATOR" && (
                      <span className="flex items-center gap-1 rounded-[4px] bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <UserCheck className="h-3 w-3" aria-hidden /> Creator
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">@{user.username}</p>
                  {user.bio && <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-foreground/85">{user.bio}</p>}
                  {joinedLine && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CalendarDays className="h-3 w-3" aria-hidden /> Member since {joinedLine}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Social sharing — always visible */}
              {!editing && <ShareSheet username={user.username} />}

              {isMe ? (
                <>
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditForm({ name: user.name, bio: user.bio ?? "" });
                        setEditing(true);
                      }}
                      className="h-8 gap-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit Profile
                    </Button>
                  )}
                  {canManageContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ name: "upload" })}
                      className="h-8 gap-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden /> Upload
                    </Button>
                  )}
                  {canManageContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ name: "earnings" })}
                      className="h-8 gap-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Wallet className="h-3.5 w-3.5" aria-hidden /> Earnings
                    </Button>
                  )}
                  {me?.role === "ADMIN" && (
                    <Button
                      size="sm"
                      onClick={() => navigate({ name: "admin" })}
                      className="h-8 gap-1.5 rounded-[6px] bg-primary text-[11px] font-bold uppercase tracking-wider"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" aria-hidden /> Admin Panel
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  variant={following ? "secondary" : "default"}
                  className={cn(
                    "h-9 gap-1.5 rounded-[7px] px-5 text-[11.5px] font-bold uppercase tracking-wider transition-all",
                    !following && "bg-primary hover:brightness-110",
                    followAnim && "scale-95"
                  )}
                >
                  {following
                    ? <UserCheck className="h-4 w-4" aria-hidden />
                    : <UserPlus className="h-4 w-4" aria-hidden />
                  }
                  {following ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-2 divide-x divide-border/50 border-t border-border bg-elevated/40 sm:grid-cols-4 lg:grid-cols-5">
          {statCells.map((c) => (
            <div key={c.label} className="min-w-0 px-4 py-3">
              <p className="kicker flex items-center gap-1.5 truncate text-muted-foreground">
                {c.icon}
                {c.label}
              </p>
              <p className={cn("tabular mt-1 truncate text-[15px] font-bold", c.highlight ? "text-primary" : "text-foreground")}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </header>

      {/* ═══ Tabs ═══ */}
      <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Profile content">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-2 px-4 text-[12.5px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {t.count != null && (
                <span
                  className={cn(
                    "tabular rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {fmtLocale(t.count)}
                </span>
              )}
              {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-primary" aria-hidden />}
            </button>
          );
        })}
      </div>

      {/* ═══ Tab panels ═══ */}
      {tab === "posts" ? (
        posts.length === 0 ? (
          <div className="reveal mt-5 flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[15px] font-bold tracking-[0.05em] text-foreground">No posts yet</p>
            <p className="max-w-[36ch] text-[11.5px] leading-relaxed text-muted-foreground">
              {isMe ? "Share your first take from the community feed." : `${user.name} hasn't posted in the community yet.`}
            </p>
            {isMe && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ name: "community" })}
                className="mt-1 h-8 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
              >
                Go to the community
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {posts.map((p) => (
              <article key={p.id} className="reveal card-lift rounded-lg border border-border bg-card p-4">
                <p className="whitespace-pre-line break-words text-[13px] leading-relaxed text-foreground/90">{p.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3" aria-hidden /> {fmtCompact(p.likeCount)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" aria-hidden /> {fmtCompact(p.commentCount)}
                  </span>
                  {p.matchTag && (
                    <span className="hidden rounded-[4px] bg-primary/10 px-1.5 py-0.5 font-bold text-primary sm:inline">
                      #{p.matchTag}
                    </span>
                  )}
                  <span className="ml-auto">{timeAgo(p.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )
      ) : tab === "videos" ? (
        videos.length === 0 ? (
          <div className="reveal mt-5 flex flex-col items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-secondary text-muted-foreground">
              <Play className="h-5 w-5" aria-hidden />
            </span>
            <p className="label-cond text-[15px] font-bold tracking-[0.05em] text-foreground">No videos yet</p>
            <p className="max-w-[36ch] text-[11.5px] leading-relaxed text-muted-foreground">
              {canManageContent
                ? "Upload your first short and it will appear here."
                : `${user.name} hasn't published any shorts yet.`}
            </p>
            {canManageContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ name: "upload" })}
                className="mt-1 h-8 gap-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden /> Upload
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate({ name: "shorts" })}
                className="card-lift group overflow-hidden rounded-lg border border-border bg-card text-left"
                aria-label={`Watch short: ${v.title}`}
              >
                <span className="relative block aspect-[16/9] overflow-hidden bg-elevated">
                  {v.thumbnailUrl ? (
                    <Image src={v.thumbnailUrl} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="img-zoom object-cover" unoptimized />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Play className="h-8 w-8" aria-hidden />
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
                  <span className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
                    <Play className="h-3 w-3 fill-white text-white" aria-hidden />
                  </span>
                  <span className="tabular absolute bottom-2.5 right-2.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-white backdrop-blur-sm">
                    {fmtCompact(v.views)} views
                  </span>
                </span>
                <span className="block p-3.5">
                  <span className="line-clamp-1 block text-[13px] font-semibold text-foreground">{v.title}</span>
                  <span className="tabular mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" aria-hidden /> {fmtCompact(v.likeCount)}
                    </span>
                    <span className="ml-auto">{timeAgo(v.createdAt)}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )
      ) : (
        /* ── About tab ── */
        <div className="mt-5 space-y-4">
          <div className="reveal overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-elevated/50 px-5 py-3">
              <p className="label-cond text-[11px] tracking-[0.08em] text-muted-foreground">About @{user.username}</p>
            </div>
            <dl className="divide-y divide-border/50">
              {[
                { label: "Display name", value: user.name },
                { label: "Username", value: `@${user.username}` },
                { label: "Role", value: user.role === "ADMIN" ? "Administrator" : user.role === "CREATOR" ? "Content Creator" : "Fan" },
                { label: "Member since", value: joinedLine ?? "—" },
                { label: "Bio", value: user.bio ?? "No bio provided yet." },
                { label: "Followers", value: fmtLocale(user.followerCount ?? 0) },
                { label: "Following", value: fmtLocale(user.followingCount ?? 0) },
                { label: "Posts published", value: fmtLocale(posts.length) },
                { label: "Shorts uploaded", value: fmtLocale(videos.length) },
                ...(isMe && me?.earningsTotal != null
                  ? [{ label: "Total earnings", value: formatMoney(me.earningsTotal) }]
                  : []),
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[140px_minmax(0,1fr)] px-5 py-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <dt className="text-[12px] font-semibold text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 text-[13px] text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Top-liked posts in about tab */}
          {likedRanked.length > 0 && (
            <div className="reveal overflow-hidden rounded-lg border border-border bg-card">
              <p className="label-cond border-b border-border bg-elevated/50 px-4 py-2.5 text-[11px] tracking-[0.08em] text-muted-foreground">
                Most-liked posts from @{user.username}
              </p>
              <div className="divide-y divide-border/40">
                {likedRanked.slice(0, 5).map((p, i) => (
                  <article key={p.id} className="row-hover flex items-start gap-3.5 px-4 py-3.5">
                    <span className="score-num mt-0.5 w-6 shrink-0 text-right text-[18px] font-bold leading-none text-primary/70">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/90">{p.content}</p>
                      <p className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-semibold text-primary">
                          <Heart className="h-3 w-3 fill-primary" aria-hidden /> {fmtCompact(p.likeCount)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="h-3 w-3" aria-hidden /> {fmtCompact(p.commentCount)}
                        </span>
                        <span className="ml-auto">{timeAgo(p.createdAt)}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── In-feed ad after content ── */}
      <div className="reveal mt-6">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}
