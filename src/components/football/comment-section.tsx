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
      <h3 className="flex items-center gap-2 border-b border-border pb-3.5 text-sm font-bold">
        <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
        Comments
        <span className="tabular rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{countStr}</span>
      </h3>

      {user ? (
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
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
              className="resize-none bg-background text-sm"
              aria-label="Write a comment"
            />
            <div className="flex items-center justify-between">
              <span className="tabular text-[10px] text-muted-foreground">{content.length}/500</span>
              <Button
                size="sm"
                onClick={() => submit.mutate()}
                disabled={!content.trim() || submit.isPending}
                className="gap-1.5"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 p-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          To comment, <span className="font-semibold text-primary">log in</span>
        </button>
      )}

      <div className="space-y-2.5">
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No comments yet — be the first to share your take.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/25">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={c.user.avatarUrl ?? undefined} alt={c.user.name} />
                <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">{c.user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => navigate({ name: "profile", username: c.user.username })}
                    className="text-xs font-bold transition-colors hover:text-primary"
                  >
                    {c.user.name}
                  </button>
                  {c.user.isPremium && (
                    <span className="flex items-center gap-0.5 rounded-sm bg-fhb-gold/15 px-1 py-0.5 text-[9px] font-bold text-fhb-gold">
                      <Crown className="h-2.5 w-2.5" aria-hidden /> Premium
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
