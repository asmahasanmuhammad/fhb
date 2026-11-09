// English formatting helpers

/** Plain Western-digit number string (null/undefined → "0"). */
export function fmtNum(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return String(value);
}

/** Compact display: 1.2K / 3.4M. */
export function fmtCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return fmtNum(value);
}

/** Locale-formatted number: 12,480. */
export function fmtLocale(value: number): string {
  return value.toLocaleString("en-US");
}

/** Relative time: "Just now", "5m ago", "3h ago", "2d ago", "5mo ago". */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatKickoff(dateStr: string): { date: string; time: string; relative: string } {
  const d = new Date(dateStr);
  const date = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today.getTime() + 864e5);
  const yesterday = new Date(today.getTime() - 864e5);
  let relative = date;
  if (isSameDay) relative = "Today";
  else if (d.toDateString() === tomorrow.toDateString()) relative = "Tomorrow";
  else if (d.toDateString() === yesterday.toDateString()) relative = "Yesterday";

  return { date, time, relative };
}

/** Bangladeshi Taka amount: "Tk 1,250". */
export function formatMoney(amount: number): string {
  return `Tk ${Math.round(amount).toLocaleString("en-US")}`;
}
