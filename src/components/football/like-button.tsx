"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { bnCompact } from "@/lib/format";

/**
 * Optimistic like button for NEWS / VIDEO / POST targets.
 */
export function LikeButton({
  targetType,
  targetId,
  initialCount,
  initialLiked = false,
  variant = "default",
}: {
  targetType: "NEWS" | "VIDEO" | "POST";
  targetId: string;
  initialCount: number;
  initialLiked?: boolean;
  variant?: "default" | "shorts" | "inline";
}) {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggle = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onMutate: () => {
      setLiked((l) => !l);
      setCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      // revert
      setLiked(liked);
      setCount(initialCount);
    },
    onSuccess: (data) => {
      setLiked(data.liked);
    },
  });

  const handleClick = () => {
    if (!user) {
      navigate({ name: "auth" });
      return;
    }
    toggle.mutate();
  };

  if (variant === "shorts") {
    return (
      <button
        onClick={handleClick}
        className="tap-target flex flex-col items-center gap-1 text-white"
        aria-label={liked ? "অপছন্দ করুন" : "পছন্দ করুন"}
        aria-pressed={liked}
      >
        <Heart
          className={cn(
            "h-8 w-8 drop-shadow-lg transition-all active:scale-125",
            liked ? "fill-fhb-red text-fhb-red" : "fill-black/30 text-white"
          )}
          aria-hidden
        />
        <span className="font-display text-xs font-semibold drop-shadow">{bnCompact(count)}</span>
      </button>
    );
  }

  return (
    <Button
      variant={variant === "inline" ? "ghost" : "outline"}
      size="sm"
      onClick={handleClick}
      className={cn("gap-1.5", liked && "text-fhb-red")}
      aria-pressed={liked}
      aria-label={liked ? "অপছন্দ করুন" : "পছন্দ করুন"}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-fhb-red")} aria-hidden />
      {bnCompact(count)}
    </Button>
  );
}
