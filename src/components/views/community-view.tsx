"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post, SafeUser } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { timeAgo, bnCompact } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Radio, MessageCircle, Crown, UserPlus, UserCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommunityView() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [matchTag, setMatchTag] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ posts: Post[]; suggested: SafeUser[] }>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      return res.json().then((j) => j.data);
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, matchTag }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent("");
      setMatchTag(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "পোস্ট হয়ে গেছে! 🎉", description: "কমিউনিটিতে আপনার মতামত এখন লাইভ।" });
    },
    onError: (e: Error) => toast({ title: "পোস্ট ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const posts = data?.posts ?? [];
  const suggested = data?.suggested ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <Radio className="h-6 w-6 text-primary" aria-hidden />
        ফ্যান কমিউনিটি
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">মতামত শেয়ার করুন, আলোচনায় জয়েন করুন — বাংলাদেশের ফুটবলপ্রেমীদের নিজের জায়গা।</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Feed */}
        <div className="space-y-4 lg:col-span-2">
          {/* Composer */}
          {user ? (
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`${user.name}, আজকের ম্যাচ নিয়ে কী মনে হচ্ছে?`}
                    rows={3}
                    maxLength={600}
                    className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary"
                    aria-label="পোস্ট লিখুন"
                  />
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {["আবাহনী", "মোহামেডান", "বসুন্ধরা", "জাতীয় দল"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setMatchTag((t) => (t === tag ? null : tag))}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-bold transition-colors",
                            matchTag === tag ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createPost.mutate()}
                      disabled={!content.trim() || createPost.isPending}
                      className="font-bold"
                    >
                      {createPost.isPending ? "পোস্ট হচ্ছে..." : "পোস্ট করুন"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => useAppStore.getState().navigate({ name: "auth" })}
              className="w-full rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center text-sm font-semibold text-primary"
            >
              কমিউনিটিতে পোস্ট করতে লগইন করুন →
            </button>
          )}

          {/* Posts */}
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
          ) : (
            posts.map((post) => (
              <article key={post.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
                    <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{post.author.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-bold">
                      {post.author.name}
                      {post.author.isPremium && <Crown className="h-3 w-3 text-fhb-gold" aria-label="প্রিমিয়াম সদস্য" />}
                      {post.author.role === "CREATOR" && (
                        <span className="rounded bg-fhb-red/15 px-1.5 text-[9px] font-bold text-fhb-red">ক্রিয়েটর</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      @{post.author.username} • {timeAgo(post.createdAt)}
                    </p>
                  </div>
                  {post.matchTag && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">#{post.matchTag}</span>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{post.content}</p>

                <div className="mt-3.5 flex items-center gap-2 border-t pt-3">
                  <LikeButton targetType="POST" targetId={post.id} initialCount={post.likeCount} variant="inline" />
                  <Button variant="ghost" size="sm" onClick={() => setOpenComments(openComments === post.id ? null : post.id)} className="gap-1.5">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {bnCompact(post.commentCount)}
                  </Button>
                </div>

                {openComments === post.id && (
                  <div className="mt-3 border-t pt-3">
                    <CommentSection targetType="POST" targetId={post.id} />
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* Sidebar: suggested creators */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-4">
            <p className="mb-3 flex items-center gap-1.5 font-display text-sm font-bold tracking-wide">
              <Sparkles className="h-4 w-4 text-fhb-gold" aria-hidden /> ফলো করার মতো ক্রিয়েটর
            </p>
            <div className="space-y-3">
              {suggested.map((s) => (
                <SuggestedCreator key={s.id} creator={s} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-fhb-gold/30 bg-fhb-gold/5 p-4">
            <p className="text-sm font-bold text-fhb-gold">ক্রিয়েটর হতে চান?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              শর্টস আপলোড করুন, ফলোয়ার বাড়ান এবং ভিউ থেকে আয় করুন। অ্যাডমিন প্যানেল থেকে ক্রিয়েটর রোল নিন (ডেমো)।
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SuggestedCreator({ creator }: { creator: SafeUser }) {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useAppStore((s) => s.navigate);

  const { data } = useQuery<{ following: boolean }>({
    queryKey: ["follow", creator.id, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/follow?followingId=${creator.id}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!user && user.id !== creator.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: creator.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow", creator.id] }),
    onError: (e: Error) => toast({ title: "ফলো ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const following = data?.following ?? false;

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => navigate({ name: "profile", username: creator.username })} aria-label={`${creator.name} প্রোফাইল`}>
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={creator.avatarUrl ?? undefined} alt={creator.name} />
          <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{creator.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{creator.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{bnCompact(creator.followerCount ?? 0)} ফলোয়ার</p>
      </div>
      {user && user.id !== creator.id && (
        <Button
          size="sm"
          variant={following ? "secondary" : "outline"}
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className="h-8 gap-1 rounded-full px-3 text-[11px] font-bold"
        >
          {following ? <UserCheck className="h-3 w-3" aria-hidden /> : <UserPlus className="h-3 w-3" aria-hidden />}
          {following ? "ফলোয়িং" : "ফলো"}
        </Button>
      )}
    </div>
  );
}
