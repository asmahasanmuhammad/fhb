"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import type { SafeUser, Post, Video } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { timeAgo, bnCompact, bnNumber } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Crown, UserPlus, UserCheck, Play, Pencil, Check, X, LogIn, Wallet,
  LayoutGrid, MessageSquare, Heart, BadgeCheck, CalendarDays,
} from "lucide-react";

export function ProfileView({ username }: { username?: string }) {
  const me = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  useReveal();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"posts" | "videos">("posts");
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
    onError: (e: Error) => toast({ title: "ফলো ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  if (!me && !username) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <LogIn className="h-7 w-7 text-muted-foreground" aria-hidden />
        </span>
        <p className="text-sm text-muted-foreground">আপনার প্রোফাইল দেখতে লগইন করুন।</p>
        <Button onClick={() => navigate({ name: "auth" })} className="sheen gap-2 rounded-full bg-primary px-6 font-bold">
          <LogIn className="h-4 w-4" aria-hidden /> লগইন / রেজিস্ট্রেশন
        </Button>
      </div>
    );
  }

  if (isLoading || !data?.user) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 pt-6">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const { user, posts, videos, following, totalLikes } = data;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-14 pt-6 sm:px-6">
      {/* ═══ Profile header — cinematic ═══ */}
      <div className="noise stadium-panel relative overflow-hidden rounded-3xl border border-border/70">
        {/* Top accent line */}
        <span
          aria-hidden
          className={cn(
            "block h-1.5 w-full",
            user.isPremium
              ? "bg-gradient-to-r from-fhb-gold/70 via-fhb-gold to-fhb-gold/70"
              : "bg-gradient-to-r from-primary/60 via-primary to-primary/60"
          )}
        />
        <div className="pitch-pattern p-6 sm:p-7">
          <div className="flex flex-wrap items-start gap-5">
            <div className="relative">
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
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-fhb-gold text-black shadow-lg"
                  title="প্রিমিয়াম সদস্য"
                >
                  <Crown className="h-4 w-4" aria-hidden />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="space-y-2.5">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="নাম"
                    className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    aria-label="নাম এডিট করুন"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="বায়ো..."
                    rows={2}
                    className="w-full max-w-md resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    aria-label="বায়ো এডিট করুন"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        useAppStore.getState().setUser({ ...me!, name: editForm.name || me!.name });
                        setEditing(false);
                        toast({ title: "প্রোফাইল আপডেট হয়েছে" });
                      }}
                      className="gap-1.5 rounded-md"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden /> সেভ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="gap-1.5 rounded-md">
                      <X className="h-3.5 w-3.5" aria-hidden /> বাতিল
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="display-hero text-2xl text-foreground sm:text-3xl">{user.name}</h1>
                    {user.isPremium && (
                      <span className="flex items-center gap-1 rounded-md bg-fhb-gold/15 px-2 py-0.5 text-[10px] font-bold text-fhb-gold">
                        <Crown className="h-3 w-3" aria-hidden /> প্রিমিয়াম
                      </span>
                    )}
                    {user.role === "ADMIN" && (
                      <span className="rounded-md bg-fhb-red/15 px-2 py-0.5 text-[10px] font-bold text-fhb-red">অ্যাডমিন</span>
                    )}
                    {user.role === "CREATOR" && (
                      <span className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <BadgeCheck className="h-3 w-3" aria-hidden /> ক্রিয়েটর
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    @{user.username}
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" aria-hidden />
                      FHB সদস্য {timeAgo(user.createdAt ?? new Date().toISOString())} থেকে
                    </span>
                  </p>
                  {user.bio && <p className="mt-2 max-w-lg text-sm leading-relaxed text-foreground/80">{user.bio}</p>}
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
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
                      className="gap-1.5 rounded-full"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> প্রোফাইল এডিট
                    </Button>
                  )}
                  {(me?.role === "CREATOR" || me?.role === "ADMIN") && (
                    <Button variant="outline" size="sm" onClick={() => navigate({ name: "earnings" })} className="gap-1.5 rounded-full">
                      <Wallet className="h-3.5 w-3.5" aria-hidden /> আয়ের ড্যাশবোর্ড
                    </Button>
                  )}
                  {me?.role === "ADMIN" && (
                    <Button size="sm" onClick={() => navigate({ name: "admin" })} className="sheen gap-1.5 rounded-full bg-primary font-bold">
                      <LayoutGrid className="h-3.5 w-3.5" aria-hidden /> অ্যাডমিন প্যানেল
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  variant={following ? "secondary" : "default"}
                  className={cn("gap-1.5 rounded-full px-5 font-bold", !following && "bg-fhb-red shadow-[0_10px_24px_-10px_var(--fhb-red)] hover:bg-fhb-red/90")}
                >
                  {following ? <UserCheck className="h-4 w-4" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
                  {following ? "ফলোয়িং" : "ফলো করুন"}
                </Button>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <dl className="mt-6 grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/50 backdrop-blur-sm sm:grid-cols-4">
            {[
              [bnNumber(user.followerCount ?? 0), "ফলোয়ার"],
              [bnNumber(user.followingCount ?? 0), "ফলোয়িং"],
              [bnNumber(totalLikes), "মোট লাইক"],
              [bnNumber(posts.length + videos.length), "কনটেন্ট"],
            ].map(([v, l], i) => (
              <div key={l} className={cn("py-4 text-center", i === 0 && "sm:border-l-0")}>
                <dd className="tabular font-display text-xl font-bold text-primary sm:text-2xl">{v}</dd>
                <dt className="mt-1 text-[10px] text-muted-foreground">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 mt-7 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/40 p-1.5" role="tablist" aria-label="প্রোফাইল কনটেন্ট">
        {(
          [
            ["posts", "পোস্ট", <MessageSquare key="m" className="h-3.5 w-3.5" aria-hidden />, posts.length],
            ["videos", "শর্টস", <Play key="p" className="h-3.5 w-3.5" aria-hidden />, videos.length],
          ] as const
        ).map(([key, label, icon, count]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.97]",
              tab === key ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {icon}
            {label}
            <span className={cn("tabular rounded-md px-1.5 py-0.5 text-[10px] font-bold", tab === key ? "bg-black/20" : "bg-muted text-muted-foreground")}>
              {bnNumber(count)}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "posts" ? (
        posts.length === 0 ? (
          <div className="edge-lit rounded-2xl border border-border bg-card p-12 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">এখনো কোনো পোস্ট নেই।</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {posts.map((p) => (
              <div key={p.id} className="edge-lit card-lift rounded-2xl border border-border bg-card p-5">
                <p className="whitespace-pre-line text-sm leading-relaxed">{p.content}</p>
                <div className="mt-3.5 flex items-center gap-3.5 border-t border-border/60 pt-3.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3" aria-hidden /> {bnCompact(p.likeCount)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" aria-hidden /> {bnCompact(p.commentCount)}
                  </span>
                  <span className="ml-auto">{timeAgo(p.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : videos.length === 0 ? (
        <div className="edge-lit rounded-2xl border border-border bg-card p-12 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Play className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">এখনো কোনো শর্টস নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate({ name: "shorts" })}
              className="card-lift group relative aspect-[9/16] overflow-hidden rounded-2xl border border-border"
              aria-label={`শর্টস দেখুন: ${v.title}`}
            >
              {v.thumbnailUrl && (
                <Image src={v.thumbnailUrl} alt={v.title} fill sizes="200px" className="img-zoom object-cover" unoptimized />
              )}
              <div className="photo-scrim absolute inset-0" aria-hidden />
              <div className="absolute inset-x-3 bottom-3 text-left">
                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white">{v.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[9px] text-white/70">
                  <Play className="h-2.5 w-2.5 fill-white" aria-hidden /> {bnCompact(v.views)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
