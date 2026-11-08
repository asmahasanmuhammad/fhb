// Bengali formatting helpers

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBn(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "০";
  return String(value).replace(/\d/g, (d) => BN_DIGITS[parseInt(d, 10)]);
}

export function bnCompact(value: number): string {
  if (value >= 10000000) return `${toBn((value / 10000000).toFixed(1))} কোটি`;
  if (value >= 100000) return `${toBn((value / 100000).toFixed(1))} লাখ`;
  if (value >= 1000) return `${toBn((value / 1000).toFixed(1))}হা`;
  return toBn(value);
}

export function bnNumber(value: number): string {
  return toBn(value.toLocaleString("en-US"));
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${toBn(mins)} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${toBn(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${toBn(days)} দিন আগে`;
  const months = Math.floor(days / 30);
  return `${toBn(months)} মাস আগে`;
}

export function formatKickoff(dateStr: string): { date: string; time: string; relative: string } {
  const d = new Date(dateStr);
  const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const bnDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
  const date = `${bnDays[d.getDay()]}, ${toBn(d.getDate())} ${bnMonths[d.getMonth()]}`;
  const time = `${toBn(d.getHours().toString().padStart(2, "0"))}:${toBn(d.getMinutes().toString().padStart(2, "0"))}`;

  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today.getTime() + 864e5);
  const yesterday = new Date(today.getTime() - 864e5);
  let relative = date;
  if (isSameDay) relative = "আজ";
  else if (d.toDateString() === tomorrow.toDateString()) relative = "আগামীকাল";
  else if (d.toDateString() === yesterday.toDateString()) relative = "গতকাল";

  return { date, time, relative };
}

export function formatMoney(amount: number): string {
  return `৳${toBn(Math.round(amount).toLocaleString("en-US"))}`;
}
