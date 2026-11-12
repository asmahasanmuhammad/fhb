"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app-store";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeamCrest } from "@/components/football/team-badge";
import {
  Shirt,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Star,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flag,
  X,
  Image as ImageIcon,
} from "lucide-react";

export type AdminPlayer = {
  id: string;
  name: string;
  teamId: string | null;
  position: "GK" | "DF" | "MF" | "FW";
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
  photoUrl: string | null;
  bio: string | null;
  team: {
    id: string;
    name: string;
    shortName: string;
    initials: string;
    color: string;
    logoUrl: string | null;
  } | null;
};

type AdminPlayersData = {
  players: AdminPlayer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  teams: Array<{ id: string; name: string; shortName: string; initials: string; color: string; logoUrl: string | null }>;
  availablePhotos: string[];
};

const POSITION_COLORS: Record<string, string> = {
  GK: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  DF: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  MF: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  FW: "bg-rose-500/15 text-rose-500 border-rose-500/30",
};

const DEFAULT_FORM = {
  name: "",
  teamId: "",
  position: "FW" as "GK" | "DF" | "MF" | "FW",
  jerseyNumber: "10",
  nationality: "Bangladesh",
  photoUrl: "",
  rating: "7.8",
  goals: "0",
  assists: "0",
  appearances: "10",
  cleanSheets: "0",
  birthYear: "1998",
  heightCm: "180",
  isNationalTeam: false,
  bio: "",
};

export function PlayerManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useAppStore((s) => s.navigate);

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [positionFilter, setPositionFilter] = useState<"ALL" | "GK" | "DF" | "MF" | "FW">("ALL");
  const [sortBy, setSortBy] = useState<"rating" | "goals" | "name" | "appearances">("rating");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlayer | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminPlayer | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const queryParams = useMemo(() => {
    const sp = new URLSearchParams();
    if (search.trim()) sp.set("q", search.trim());
    if (teamFilter !== "ALL") sp.set("teamId", teamFilter);
    if (positionFilter !== "ALL") sp.set("position", positionFilter);
    sp.set("sort", sortBy);
    sp.set("page", String(page));
    sp.set("limit", "50");
    return sp.toString();
  }, [search, teamFilter, positionFilter, sortBy, page]);

  const { data, isLoading } = useQuery<AdminPlayersData>({
    queryKey: ["admin", "players", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/admin/players?${queryParams}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load players");
      return json.data;
    },
    staleTime: 5000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isEdit = Boolean(editing);
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        teamId: form.teamId || null,
        position: form.position,
        nationality: form.nationality.trim() || "Bangladesh",
        jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber, 10) : null,
        birthYear: form.birthYear ? parseInt(form.birthYear, 10) : null,
        heightCm: form.heightCm ? parseInt(form.heightCm, 10) : null,
        rating: form.rating ? parseFloat(form.rating) : 7.0,
        goals: form.goals ? parseInt(form.goals, 10) : 0,
        assists: form.assists ? parseInt(form.assists, 10) : 0,
        appearances: form.appearances ? parseInt(form.appearances, 10) : 0,
        cleanSheets: form.cleanSheets ? parseInt(form.cleanSheets, 10) : 0,
        isNationalTeam: Boolean(form.isNationalTeam),
        photoUrl: form.photoUrl.trim() || null,
        bio: form.bio.trim() || null,
      };

      if (isEdit && editing) {
        payload.id = editing.id;
      }

      const res = await fetch("/api/admin/players", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save player");
      return json.data;
    },
    onSuccess: (res) => {
      toast({
        title: editing ? "Player Updated Successfully" : "Player Created Successfully",
        description: `${res.player.name} profile is now live across tactics, squads & match views.`,
      });
      setDialogOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "players"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["lineups"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: Error) => {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/players?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete player");
      return json.data;
    },
    onSuccess: () => {
      toast({ title: "Player Deleted", description: "Player removed from squads & database." });
      setConfirmDel(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "players"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["lineups"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: Error) => {
      toast({ title: "Delete Failed", description: e.message, variant: "destructive" });
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (player: AdminPlayer) => {
    setEditing(player);
    setForm({
      name: player.name,
      teamId: player.teamId || "",
      position: player.position,
      jerseyNumber: player.jerseyNumber != null ? String(player.jerseyNumber) : "",
      nationality: player.nationality || "Bangladesh",
      photoUrl: player.photoUrl || "",
      rating: player.rating != null ? String(player.rating) : "7.0",
      goals: String(player.goals ?? 0),
      assists: String(player.assists ?? 0),
      appearances: String(player.appearances ?? 0),
      cleanSheets: String(player.cleanSheets ?? 0),
      birthYear: player.birthYear != null ? String(player.birthYear) : "",
      heightCm: player.heightCm != null ? String(player.heightCm) : "",
      isNationalTeam: Boolean(player.isNationalTeam),
      bio: player.bio || "",
    });
    setDialogOpen(true);
  };

  const players = data?.players ?? [];
  const total = data?.total ?? 0;
  const teams = data?.teams ?? [];
  const availablePhotos = data?.availablePhotos ?? [];

  // Summary counts
  const gkCount = players.filter((p) => p.position === "GK").length;
  const dfCount = players.filter((p) => p.position === "DF").length;
  const mfCount = players.filter((p) => p.position === "MF").length;
  const fwCount = players.filter((p) => p.position === "FW").length;

  return (
    <div>
      {/* ── Section Title & Create Button ── */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="label-cond text-[1.35rem] font-bold leading-none text-foreground flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary" />
            Players Directory &amp; Squads
          </h2>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">
            Centralized player database. Any addition or edit here updates Tactical Pitches, Squad lists, and Player Profiles in real-time.
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 rounded-md bg-primary font-bold shadow-sm">
          <Plus className="h-4 w-4" aria-hidden /> Add New Player
        </Button>
      </div>

      {/* ── Tip Banner ── */}
      <div className="mb-4 flex items-start gap-2.5 rounded-md border border-border bg-card px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          <span className="font-bold text-foreground">Single Source of Truth:</span> Players created or edited here provide the authentic photos, ratings, and numbers across the 2D Tactical Board, Team details, and Player Profiles.
        </p>
      </div>

      {/* ── Summary Stat Strips ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-5">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Players</p>
          <p className="mt-1 text-2xl font-black text-foreground">{fmtNum(total)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Goalkeepers (GK)</p>
          <p className="mt-1 text-2xl font-black text-amber-500">{fmtNum(gkCount)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Defenders (DF)</p>
          <p className="mt-1 text-2xl font-black text-blue-500">{fmtNum(dfCount)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Midfielders (MF)</p>
          <p className="mt-1 text-2xl font-black text-emerald-500">{fmtNum(mfCount)}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Forwards (FW)</p>
          <p className="mt-1 text-2xl font-black text-rose-500">{fmtNum(fwCount)}</p>
        </div>
      </div>

      {/* ── Main Data Card ── */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        {/* Controls Toolbar: Search + Team + Position + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 p-3.5 sm:px-5">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by player name, club, or country…"
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-[12px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Team Dropdown */}
            <select
              value={teamFilter}
              onChange={(e) => {
                setTeamFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="ALL">All Clubs / Teams ({teams.length})</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Position Filter */}
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
              {(["ALL", "GK", "DF", "MF", "FW"] as const).map((pos) => {
                const active = positionFilter === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => {
                      setPositionFilter(pos);
                      setPage(1);
                    }}
                    className={cn(
                      "rounded-[4px] px-2 py-0.5 text-[11px] font-bold transition-colors cursor-pointer",
                      active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-[11.5px] font-medium text-foreground outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="rating">Top Rating ★</option>
              <option value="goals">Top Goals ⚽</option>
              <option value="appearances">Most Apps</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Players Table */}
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Shirt className="h-6 w-6" aria-hidden />
            </span>
            <p className="label-cond text-[14px] text-foreground">No players found</p>
            <p className="text-[11.5px] text-muted-foreground">Try clearing search filters or add a new player.</p>
            <Button size="sm" onClick={openNew} className="mt-2 gap-1.5 rounded-md bg-primary">
              <Plus className="h-3.5 w-3.5" /> Add Player
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="py-2.5 px-4 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Player &amp; Nation
                </TableHead>
                <TableHead className="py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Club
                </TableHead>
                <TableHead className="py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pos &amp; No.
                </TableHead>
                <TableHead className="py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                  Rating
                </TableHead>
                <TableHead className="py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground text-center hidden sm:table-cell">
                  Stats (G / A / Apps)
                </TableHead>
                <TableHead className="py-2.5 text-right px-4 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {players.map((p) => {
                const posClass = POSITION_COLORS[p.position] || "bg-muted text-muted-foreground border-border";
                return (
                  <TableRow key={p.id} className="border-border/50 transition-colors hover:bg-muted/40">
                    {/* Player Info with Photo */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-slate-900 shadow-sm">
                          {p.photoUrl ? (
                            <img
                              src={p.photoUrl}
                              alt={p.name}
                              className="h-full w-full object-cover object-top"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {p.jerseyNumber ? `#${p.jerseyNumber}` : p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-foreground flex items-center gap-1.5">
                            {p.name}
                            {p.isNationalTeam && (
                              <span title="National Team Player">
                                <Flag className="h-3 w-3 text-emerald-400" />
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span>{p.nationality || "Bangladesh"}</span>
                            {p.birthYear && (
                              <>
                                <span>•</span>
                                <span>Born {p.birthYear}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Club */}
                    <TableCell className="py-3">
                      {p.team ? (
                        <div className="flex items-center gap-2">
                          <TeamCrest team={p.team} size="xs" />
                          <span className="truncate text-[12px] font-semibold text-foreground/90">
                            {p.team.shortName || p.team.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Free Agent / National</span>
                      )}
                    </TableCell>

                    {/* Position & Number */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("px-2 py-0.5 rounded text-[10.5px] font-black border uppercase", posClass)}>
                          {p.position}
                        </span>
                        {p.jerseyNumber != null && (
                          <span className="text-[11.5px] font-bold font-mono text-muted-foreground">
                            #{p.jerseyNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {p.rating.toFixed(1)}
                      </span>
                    </TableCell>

                    {/* Stats */}
                    <TableCell className="py-3 text-center hidden sm:table-cell">
                      <span className="text-[12px] font-medium text-muted-foreground font-mono">
                        <span className="font-bold text-emerald-400">{p.goals}G</span> /{" "}
                        <span className="font-bold text-blue-400">{p.assists}A</span> /{" "}
                        <span>{p.appearances} Apps</span>
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate({ name: "player-detail", id: p.id })}
                          className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                          title="View Live Player Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Edit Player Info"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDel(p)}
                          className="p-1.5 rounded text-fhb-red hover:bg-fhb-red/10 transition-colors cursor-pointer"
                          title="Delete Player"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 sm:px-5">
            <span className="text-xs text-muted-foreground">
              Showing page <b className="text-foreground">{data.page}</b> of{" "}
              <b className="text-foreground">{data.totalPages}</b> ({total} players)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="h-7 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={data.page >= data.totalPages}
                className="h-7 px-2.5 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Player Modal Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Shirt className="h-5 w-5 text-primary" />
              {editing ? `Edit Player: ${editing.name}` : "Add New Player"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure name, photo, tactical position, club, and season stats.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Visual Photo Preview & URL */}
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/50 bg-slate-900 shadow-md">
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt={form.name || "Preview"}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-primary font-black text-sm">
                    {form.jerseyNumber ? `#${form.jerseyNumber}` : "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground">Live Photo Preview</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Enter an image URL or choose a high-resolution portrait from the library below.
                </p>
                <input
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  placeholder="/players/kylian_mbappe.jpg or https://…"
                  className="mt-2 h-7 w-full rounded border border-border bg-background px-2.5 text-[11.5px] text-foreground outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Quick Pick Photo suggestions */}
            {availablePhotos.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  Quick Pick Portrait from Library ({availablePhotos.length} available)
                </label>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 max-h-24">
                  {availablePhotos.slice(0, 30).map((photo) => {
                    const active = form.photoUrl === photo;
                    const name = photo.replace("/players/", "").replace(".jpg", "").replace(/_/g, " ");
                    return (
                      <button
                        key={photo}
                        type="button"
                        onClick={() => setForm({ ...form, photoUrl: photo })}
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10.5px] transition-colors cursor-pointer",
                          active
                            ? "border-primary bg-primary/20 text-primary font-bold"
                            : "border-border bg-card text-muted-foreground hover:border-white/20 hover:text-foreground"
                        )}
                      >
                        <img src={photo} alt={name} className="h-4 w-4 rounded-full object-cover" />
                        <span className="capitalize">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Basic Info: Name & Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Player Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ousmane Dembélé"
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Club / Team</label>
                <select
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-2.5 text-[12px] text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">None / Free Agent</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Position, Number, Rating, Nationality */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value as any })}
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[12px] text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="GK">GK (Goalkeeper)</option>
                  <option value="DF">DF (Defender)</option>
                  <option value="MF">MF (Midfielder)</option>
                  <option value="FW">FW (Forward)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Jersey #</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.jerseyNumber}
                  onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
                  placeholder="10"
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Rating (1-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="8.5"
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nationality</label>
                <input
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  placeholder="Bangladesh"
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Career Stats: Goals, Assists, Apps, Clean Sheets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Goals</label>
                <input
                  type="number"
                  min="0"
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Assists</label>
                <input
                  type="number"
                  min="0"
                  value={form.assists}
                  onChange={(e) => setForm({ ...form, assists: e.target.value })}
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Appearances</label>
                <input
                  type="number"
                  min="0"
                  value={form.appearances}
                  onChange={(e) => setForm({ ...form, appearances: e.target.value })}
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Clean Sheets</label>
                <input
                  type="number"
                  min="0"
                  value={form.cleanSheets}
                  onChange={(e) => setForm({ ...form, cleanSheets: e.target.value })}
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Birth Year, Height, National Team toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-xs font-semibold text-foreground">Birth Year</label>
                <input
                  type="number"
                  min="1970"
                  max="2015"
                  value={form.birthYear}
                  onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                  placeholder="1998"
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Height (cm)</label>
                <input
                  type="number"
                  min="140"
                  max="220"
                  value={form.heightCm}
                  onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                  placeholder="182"
                  className="mt-1 h-8 w-full rounded border border-border bg-background px-3 text-[12px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Switch
                  checked={form.isNationalTeam}
                  onCheckedChange={(checked) => setForm({ ...form, isNationalTeam: checked })}
                  id="national-toggle"
                />
                <label htmlFor="national-toggle" className="text-xs font-semibold text-foreground cursor-pointer">
                  National Team Star
                </label>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-semibold text-foreground">Bio / Profile Description</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={2}
                placeholder="Tactical highlights, playing style, international career details…"
                className="mt-1 w-full rounded border border-border bg-background p-2.5 text-[12px] text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name.trim()}
              className="bg-primary font-bold"
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Update Player" : "Create Player"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={Boolean(confirmDel)} onOpenChange={() => setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <b className="text-foreground">{confirmDel?.name}</b>? This will remove them
              from tactical pitch lineups, club squads, and search index permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDel && deleteMutation.mutate(confirmDel.id)}
              className="bg-fhb-red text-white hover:bg-fhb-red/90 font-bold"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete Player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
