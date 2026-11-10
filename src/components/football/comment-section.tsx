"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import type { Comment } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, Crown, LogIn } from "lucide-react";

/**
 * Shared comment section for NEWS / VIDEO / POST targets.
 */
export function CommentSection({ targetType, targetId }: { targetType: "NEWS" | "VIDEO" | "POST"; targetId: string }) {
  const { toast } = useToast();
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery<{ comments: Comment[] }>({
    queryKey: ["comments", targetType, targetId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
      return res.json().then((j) => j.data);
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
    },
    onError: (e: Error) => toast({ title: "Comment failed", description: e.message, variant: "destructive" }),
  });

  const comments = data?.comments ?? [];
  const countStr = comments.length.toLocaleString("en-US");

  return (
    <section aria-label="Comments" className="space-y-4">
      <h3 className="flex items-center gap-2 border-b border-white/15 pb-3.5 text-sm font-black text-white">
        <MessageCircle className="h-4 w-4 text-red-500" aria-hidden />
        Comments
        <span className="tabular rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black text-slate-300">{countStr}</span>
      </h3>

      {user ? (
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-red-600/30 text-xs font-black text-red-400">
              {user.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment... (max 500 characters)"
              rows={2}
              maxLength={500}
              className="resize-none bg-[#06080f] border-white/20 text-white text-sm font-medium placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
              aria-label="Write a comment"
            />
            <div className="flex items-center justify-between">
              <span className="tabular text-[10.5px] font-semibold text-slate-400">{content.length}/500</span>
              <Button
                size="sm"
                onClick={() => submit.mutate()}
                disabled={!content.trim() || submit.isPending}
                className="gap-1.5 bg-red-600 hover:bg-red-500 text-white font-black shadow-md shadow-red-600/30"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                {submit.isPending ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate({ name: "auth" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 p-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-red-500/50 hover:text-white"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          To comment, <span className="font-bold text-red-400">log in</span>
        </button>
      )}

      <div className="space-y-2.5">
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg bg-[#0b101d]" />)
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-xs font-semibold text-slate-400">No comments yet — be the first to share your take.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-xl border border-white/15 bg-[#0b101d] p-3.5 transition-colors hover:border-red-500/40">
              <Avatar className="h-8 w-8 border border-white/15">
                <AvatarImage src={c.user.avatarUrl ?? undefined} alt={c.user.name} />
                <AvatarFallback className="bg-red-600/30 text-xs font-black text-red-400">{c.user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => navigate({ name: "profile", username: c.user.username })}
                    className="text-xs font-black text-white transition-colors hover:text-red-400"
                  >
                    {c.user.name}
                  </button>
                  {c.user.isPremium && (
                    <span className="flex items-center gap-0.5 rounded-sm bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                      <Crown className="h-2.5 w-2.5" aria-hidden /> Premium
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-400">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line break-words text-sm font-medium leading-relaxed text-slate-100">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
