"use client";

import Image from "next/image";
import { timeAgo, bnCompact } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { NewsArticle } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle } from "lucide-react";

export function NewsCard({ article, size = "md" }: { article: NewsArticle; size?: "md" | "lg" | "compact" }) {
  const navigate = useAppStore((s) => s.navigate);

  if (size === "compact") {
    return (
      <button
        onClick={() => navigate({ name: "news-detail", id: article.id })}
        className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/40"
      >
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md">
          {article.coverUrl && (
            <Image src={article.coverUrl} alt={article.title} fill sizes="80px" className="object-cover" unoptimized />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug group-hover:text-primary sm:text-sm">{article.title}</p>
          <p className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{CATEGORY_LABELS[article.category] ?? article.category}</span>
            <span>•</span>
            <span>{timeAgo(article.createdAt)}</span>
          </p>
        </div>
      </button>
    );
  }

  const large = size === "lg";
  return (
    <button
      onClick={() => navigate({ name: "news-detail", id: article.id })}
      className={cn(
        "card-lift group overflow-hidden rounded-xl border bg-card text-left",
        large ? "relative flex h-full min-h-[260px] flex-col" : "flex flex-col"
      )}
    >
      <div className={cn("relative w-full overflow-hidden", large ? "absolute inset-0" : "aspect-[16/9]")}>
        {article.coverUrl && (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes={large ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
            className={cn("object-cover transition-transform duration-500 group-hover:scale-105", large && "brightness-[0.45]")}
            unoptimized
          />
        )}
        <Badge className="absolute left-3 top-3 bg-fhb-red text-[10px] text-white hover:bg-fhb-red">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </Badge>
        {large && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-4">
            <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow sm:text-2xl">{article.title}</h3>
            <p className="mb-2 line-clamp-2 text-xs text-white/85 sm:text-sm">{article.excerpt}</p>
            <div className="flex items-center gap-3 text-[11px] text-white/75">
              <span>{article.author.name}</span>
              <span>•</span>
              <span>{timeAgo(article.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {bnCompact(article.views)}
              </span>
            </div>
          </div>
        )}
      </div>
      {!large && (
        <div className="flex flex-1 flex-col p-3.5">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary">{article.title}</h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-muted-foreground">{article.excerpt}</p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="truncate">
              {article.author.name} • {timeAgo(article.createdAt)}
            </span>
            <span className="flex shrink-0 items-center gap-2.5">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {bnCompact(article.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {bnCompact(article.likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> {toBnCount(article.commentCount)}
              </span>
            </span>
          </div>
        </div>
      )}
    </button>
  );
}

function toBnCount(n: number) {
  const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => BN[parseInt(d)]);
}
