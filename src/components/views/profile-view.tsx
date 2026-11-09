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
  LayoutGrid, MessageSquare, Heart, BadgeCheck, CalendarDays, Info, Upload,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   ProfileView — fan / creator profile
   Header card with identity + tabular stats, editorial underline
   tabs (Posts · Shorts · About) and an in-feed ad at the tab foot.
   ════════════════════════════════════════════════════════════════ */

type TabKey = "posts" | "videos" | "about";

export function ProfileView({ username }: { username?: string }) {
  const me = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  useReveal();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("posts");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", targetUsername] }),
    onError: (e: Error) => toast({ title: "Follow failed", description: e.message, variant: "destructive" }),
  });

  if (!me && !username) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <LogIn className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">Your profile lives behind a login</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Log in to see your posts, shorts, followers and earnings in one place.
          </p>
        </div>
        <Button onClick={() => navigate({ name: "auth" })} className="sheen gap-2 bg-primary px-6 font-bold">
          <LogIn className="h-4 w-4" aria-hidden /> Log In / Sign Up
        </Button>
      </div>
    );
  }

  if (isLoading || !data?.user) {
    if (!isLoading && !data) {
      return (
        <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Info className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Profile not found</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {targetUsername ? `No FHB member goes by "@${targetUsername}".` : "This profile is unavailable."}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate({ name: "community" })} className="font-semibold">
            Back to the community
          </Button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-[1080px] space-y-5 px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="rounded-xl border border-border bg-card p-6" aria-hidden>
          <div className="flex flex-wrap items-start gap-5">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3 pt-1">
              <Skeleton className="h-6 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-3.5 w-64 max-w-full rounded-md" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-background/50 py-4">
                <Skeleton className="mx-auto h-5 w-14 rounded-md" />
                <Skeleton className="mx-auto mt-2 h-2.5 w-10 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const { user, posts, videos, following, totalLikes } = data;
  const canManageContent = isMe && (me?.role === "CREATOR" || me?.role === "ADMIN");

  const stats: Array<[string, string]> = [
    [fmtLocale(user.followerCount ?? 0), "Followers"],
    [fmtLocale(user.followingCount ?? 0), "Following"],
    [fmtLocale(totalLikes), "Total likes"],
    [fmtLocale(posts.length + videos.length), "Content"],
  ];

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode; count?: number }> = [
    { key: "posts", label: "Posts", icon: <MessageSquare className="h-3.5 w-3.5" aria-hidden />, count: posts.length },
    { key: "videos", label: "Shorts", icon: <Play className="h-3.5 w-3.5" aria-hidden />, count: videos.length },
    { key: "about", label: "About", icon: <Info className="h-3.5 w-3.5" aria-hidden /> },
  ];

  const joinedLine = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const aboutStats: Array<[string, string]> = [
    [fmtLocale(posts.length), "Posts"],
    [fmtLocale(videos.length), "Shorts"],
    [fmtLocale(totalLikes), "Likes received"],
  ];
  if (isMe && me?.earningsTotal != null) {
    aboutStats.push([formatMoney(me.earningsTotal), "Total earnings"]);
  }

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ═══ Profile header card ═══ */}
      <header className="reveal noise stadium-panel relative overflow-hidden rounded-xl border border-border/70">
        <span
          aria-hidden
          className={cn(
            "block h-1 w-full",
            user.isPremium
              ? "bg-gradient-to-r from-fhb-gold/60 via-fhb-gold to-fhb-gold/60"
              : "bg-gradient-to-r from-primary/50 via-primary to-primary/50"
          )}
        />
        <div className="pitch-pattern p-5 sm:p-7">
          <div className="flex flex-wrap items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar
                className={cn(
                  "h-20 w-20 border-2 sm:h-24 sm:w-24",
                  user.isPremium ? "border-fhb-gold/70" : "border-primary/40"
                )}
              >
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/15 font-display text-2xl font-bold text-primary">
                  {user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {user.isPremium && (
                <span
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-fhb-gold text-black"
                  title="Premium member"
                >
                  <Crown className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="space-y-2.5">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Name"
                    className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                    aria-label="Edit name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Bio..."
                    rows={2}
                    className="w-full max-w-md resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
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
                      className="gap-1.5 font-semibold"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="gap-1.5 font-semibold">
                      <X className="h-3.5 w-3.5" aria-hidden /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground sm:text-[1.7rem]">
                      {user.name}
                    </h1>
                    {user.isPremium && (
                      <span className="flex items-center gap-1 rounded-md bg-fhb-gold/15 px-2 py-0.5 text-[10px] font-bold text-fhb-gold">
                        <Crown className="h-3 w-3" aria-hidden /> Premium
                      </span>
                    )}
                    {user.role === "ADMIN" && (
                      <span className="rounded-md bg-fhb-red/15 px-2 py-0.5 text-[10px] font-bold text-fhb-red">Admin</span>
                    )}
                    {user.role === "CREATOR" && (
                      <span className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <BadgeCheck className="h-3 w-3" aria-hidden /> Creator
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>@{user.username}</span>
                    {joinedLine && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" aria-hidden />
                          Member since {joinedLine}
                        </span>
                      </>
                    )}
                  </p>
                  {user.bio && <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-foreground/85">{user.bio}</p>}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
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
                      className="gap-1.5 font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit Profile
                    </Button>
                  )}
                  {canManageContent && (
                    <Button variant="outline" size="sm" onClick={() => navigate({ name: "upload" })} className="gap-1.5 font-semibold">
                      <Upload className="h-3.5 w-3.5" aria-hidden /> Upload Short
                    </Button>
                  )}
                  {canManageContent && (
                    <Button variant="outline" size="sm" onClick={() => navigate({ name: "earnings" })} className="gap-1.5 font-semibold">
                      <Wallet className="h-3.5 w-3.5" aria-hidden /> Earnings Dashboard
                    </Button>
                  )}
                  {me?.role === "ADMIN" && (
                    <Button size="sm" onClick={() => navigate({ name: "admin" })} className="sheen gap-1.5 bg-primary font-bold">
                      <LayoutGrid className="h-3.5 w-3.5" aria-hidden /> Admin Panel
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  variant={following ? "secondary" : "default"}
                  className={cn("gap-1.5 px-5 font-bold", !following && "sheen bg-primary")}
                >
                  {following ? <UserCheck className="h-4 w-4" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
                  {following ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <dl className="mt-6 grid grid-cols-2 divide-x divide-border overflow-hidden rounded-lg border border-border bg-background/50 sm:grid-cols-4">
            {stats.map(([v, l], i) => (
              <div key={l} className={cn("py-3.5 text-center", i === 0 && "sm:border-l-0")}>
                <dd className="tabular font-display text-xl font-bold text-foreground">{v}</dd>
                <dt className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ═══ Tabs ═══ */}
      <div className="mt-7 flex gap-1 border-b border-border" role="tablist" aria-label="Profile content">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold transition-colors sm:px-4",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {t.icon}
            {t.label}
            {t.count != null && (
              <span
                className={cn(
                  "tabular rounded px-1.5 py-0.5 text-[9.5px] font-bold",
                  tab === t.key ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {fmtLocale(t.count)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ Tab panels ═══ */}
      {tab === "posts" ? (
        posts.length === 0 ? (
          <div className="reveal mt-6 flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">No posts yet</p>
            <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
              {isMe
                ? "Share your first take from the community feed."
                : `${user.name} hasn't posted in the community yet.`}
            </p>
            {isMe && (
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "community" })} className="mt-1 font-semibold">
                Go to the community
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3.5">
            {posts.map((p) => (
              <article key={p.id} className="reveal card-lift rounded-xl border border-border bg-card p-5">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{p.content}</p>
                <div className="mt-3.5 flex items-center gap-3.5 border-t border-border/60 pt-3.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3" aria-hidden /> {fmtCompact(p.likeCount)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" aria-hidden /> {fmtCompact(p.commentCount)}
                  </span>
                  {p.matchTag && (
                    <span className="hidden rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary sm:inline">
                      #{p.matchTag}
                    </span>
                  )}
                  <span className="ml-auto">{timeAgo(p.createdAt)}</span>
                </div>
              </article>
            ))}
            {/* In-feed ad at the foot of the posts tab */}
            <div className="reveal pt-2">
              <AdSlot placement="IN_FEED" />
            </div>
          </div>
        )
      ) : tab === "videos" ? (
        videos.length === 0 ? (
          <div className="reveal mt-6 flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Play className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">No shorts yet</p>
            <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
              {canManageContent
                ? "Upload your first short and it will appear here."
                : `${user.name} hasn't published any shorts yet.`}
            </p>
            {canManageContent && (
              <Button variant="outline" size="sm" onClick={() => navigate({ name: "upload" })} className="mt-1 gap-1.5 font-semibold">
                <Upload className="h-3.5 w-3.5" aria-hidden /> Upload Short
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate({ name: "shorts" })}
                className="card-lift group relative aspect-[9/16] overflow-hidden rounded-xl border border-border bg-elevated"
                aria-label={`Watch short: ${v.title}`}
              >
                {v.thumbnailUrl ? (
                  <Image src={v.thumbnailUrl} alt={v.title} fill sizes="240px" className="img-zoom object-cover" unoptimized />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                    <Play className="h-8 w-8" aria-hidden />
                  </span>
                )}
                <span className="photo-scrim absolute inset-0" aria-hidden />
                <span className="absolute inset-x-3 bottom-3 block text-left">
                  <span className="line-clamp-2 block text-[11px] font-semibold leading-snug text-white">{v.title}</span>
                  <span className="tabular mt-1 flex items-center gap-2.5 text-[9.5px] font-medium text-white/75">
                    <span className="flex items-center gap-1">
                      <Play className="h-2.5 w-2.5 fill-white" aria-hidden /> {fmtCompact(v.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-2.5 w-2.5 fill-white" aria-hidden /> {fmtCompact(v.likeCount)}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="reveal edge-lit mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border/60">
            <div className="px-5 py-4 sm:px-6">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Bio</p>
              <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-foreground/90">
                {user.bio || "This member hasn't written a bio yet."}
              </p>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4 sm:px-6">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Joined</p>
                <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-foreground">
                  {joinedLine ?? "—"}
                  {user.createdAt && (
                    <span className="text-xs font-normal text-muted-foreground">({timeAgo(user.createdAt)})</span>
                  )}
                </p>
              </div>
              <div className="px-5 py-4 sm:px-6">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Role</p>
                <p className="mt-1.5 text-sm font-semibold capitalize text-foreground">
                  {user.role === "ADMIN" ? "Administrator" : user.role === "CREATOR" ? "Creator" : "Fan"}
                </p>
              </div>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Membership</p>
              <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                {user.isPremium ? (
                  <>
                    <Crown className="h-4 w-4 text-fhb-gold" aria-hidden />
                    Premium member — ad-free everywhere
                  </>
                ) : (
                  "Free plan"
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border/60 sm:grid-cols-4">
              {aboutStats.map(([v, l]) => (
                <div key={l} className="px-5 py-4 sm:px-6">
                  <p className="tabular font-display text-lg font-bold text-foreground">{v}</p>
                  <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
          {isMe && (
            <div className="flex flex-wrap gap-2.5 border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
              {canManageContent && (
                <Button variant="outline" size="sm" onClick={() => navigate({ name: "earnings" })} className="gap-1.5 font-semibold">
                  <Wallet className="h-3.5 w-3.5" aria-hidden /> Earnings dashboard
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ name: "premium" })}
                className={cn("gap-1.5 font-semibold", user.isPremium && "border-fhb-gold/40 text-fhb-gold hover:text-fhb-gold")}
              >
                <Crown className="h-3.5 w-3.5" aria-hidden />
                {user.isPremium ? "Manage membership" : "Upgrade to Premium"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
