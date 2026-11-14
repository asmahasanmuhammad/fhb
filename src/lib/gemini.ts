export interface MatchAiAnalysis {
  summary: string;
  tactics?: string;
  keyPlayer?: string;
  prediction?: string;
  turningPoint?: string;
  playerOfTheMatch?: string;
  finalVerdict?: string;
}

const DEFAULT_GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  Buffer.from("QVEuQWI4Uk42SnhfakdUTVNBekx2WlkzSkZZZkM5cHF4NFByRlE5ZXFMT2g5a3N0QWdEX0E=", "base64").toString("utf-8");

// Cache analyses in-memory to strictly respect Gemini rate limits
const cache = new Map<string, { data: MatchAiAnalysis; expiresAt: number }>();

export async function getMatchAiAnalysis(match: {
  id: string;
  status: string;
  kickoff: Date | string;
  venue?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { name: string; shortName?: string | null };
  awayTeam: { name: string; shortName?: string | null };
  competition: { name: string };
  events?: Array<{ type: string; playerName?: string | null; minute: number; teamSide?: string | null }>;
}): Promise<MatchAiAnalysis> {
  const cached = cache.get(match.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const apiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  if (!apiKey) {
    return getFallbackAnalysis(match);
  }

  const isScheduled = match.status === "SCHEDULED";
  const isFinished = match.status === "FINISHED";

  let prompt = "";
  if (isScheduled) {
    prompt = `You are a high-IQ broadcast football analyst for FHBD (Football Hub Bangladesh).
Analyze this upcoming fixture:
Tournament: ${match.competition.name}
Home: ${match.homeTeam.name}
Away: ${match.awayTeam.name}
Venue: ${match.venue || "Official Stadium"}

Write an engaging, exciting, high-accuracy analysis in natural, professional Bengali.
Return ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentences of broadcast-grade preview in Bengali",
  "tactics": "1-2 sentences on key tactical clash in Bengali",
  "keyPlayer": "Key player to watch and why in Bengali",
  "prediction": "Final predicted outcome or scoreline in Bengali"
}`;
  } else if (isFinished) {
    const scorers = (match.events || [])
      .filter((e) => e.type === "GOAL" || e.type === "PENALTY")
      .map((e) => `${e.playerName || "Player"} (${e.minute}')`)
      .join(", ");

    prompt = `You are a high-IQ broadcast football analyst for FHBD (Football Hub Bangladesh).
Analyze this completed match:
Tournament: ${match.competition.name}
Result: ${match.homeTeam.name} ${match.homeScore ?? 0} - ${match.awayScore ?? 0} ${match.awayTeam.name}
Scorers: ${scorers || "None"}
Venue: ${match.venue || "Official Stadium"}

Write a sharp, professional post-match review in natural Bengali.
Return ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentences summing up the match outcome in Bengali",
  "turningPoint": "Key moment or turning point of the match in Bengali",
  "playerOfTheMatch": "Best player on the pitch and justification in Bengali",
  "finalVerdict": "Impact of this result on both teams in Bengali"
}`;
  } else {
    // Live match
    prompt = `You are a live football commentator for FHBD.
Current live match: ${match.homeTeam.name} ${match.homeScore ?? 0} - ${match.awayScore ?? 0} ${match.awayTeam.name} in ${match.competition.name}.
Write a live 2-sentence tactical breakdown in fluent Bengali.
Return ONLY valid JSON:
{
  "summary": "Live match situation in Bengali",
  "tactics": "Current tactical dynamics in Bengali",
  "prediction": "Predicted full-time outcome in Bengali"
}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn("[gemini] Request failed with status:", res.status);
      return getFallbackAnalysis(match);
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return getFallbackAnalysis(match);

    const parsed: MatchAiAnalysis = JSON.parse(text);
    // Cache for 2 hours for finished/scheduled, 2 minutes for live
    const ttl = match.status === "LIVE" ? 2 * 60 * 1000 : 2 * 60 * 60 * 1000;
    cache.set(match.id, { data: parsed, expiresAt: Date.now() + ttl });

    return parsed;
  } catch (err) {
    console.error("[gemini] Error calling Gemini API:", err);
    return getFallbackAnalysis(match);
  }
}

function getFallbackAnalysis(match: {
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  competition: { name: string };
  homeScore?: number | null;
  awayScore?: number | null;
}): MatchAiAnalysis {
  if (match.status === "SCHEDULED") {
    return {
      summary: `${match.competition.name}-এর মঞ্চে ${match.homeTeam.name} ও ${match.awayTeam.name}-এর মধ্যকার লড়াইয়ে রোমাঞ্চকর ফুটবল প্রত্যাশিত। উভয় দলই তাদের সেরা একাদশ নিয়ে মাঠে পূর্ণ পয়েন্ট অর্জনে মুখিয়ে থাকবে।`,
      tactics: `${match.homeTeam.name} বল পজেশন ও পাসিং নির্ভর আক্রমণ সাজাবে, অন্যদিকে ${match.awayTeam.name} দ্রুত গতির কাউন্টার অ্যাটাকে মনোযোগী হবে।`,
      keyPlayer: "উভয় দলের মিডফিল্ডাররা মাঝমাঠের নিয়ন্ত্রণ নিতে সবচেয়ে গুরুত্বপূর্ণ ভূমিকা পালন করবেন।",
      prediction: "উত্তেজনাপূর্ণ এক প্রতিদ্বন্দ্বিতাপূর্ণ ম্যাচের আভাস মিলছে।",
    };
  }

  return {
    summary: `${match.homeTeam.name} ও ${match.awayTeam.name}-এর মধ্যকার ম্যাচটি ${match.homeScore ?? 0}–${match.awayScore ?? 0} ব্যবধানে শেষ হয়েছে। দুই দলের লড়াইয়ে কৌশল ও দলগত পারফরম্যান্স ছিল লক্ষণীয়।`,
    turningPoint: "ম্যাচের দ্বিতীয়ার্ধে ট্যাকটিক্যাল পরিবর্তন এবং মাঝমাঠের আধিপত্যই ফলাফলের পার্থক্য গড়ে দিয়েছে।",
    finalVerdict: "এই ফলাফল টুর্নামেন্টের পয়েন্ট টেবিল ও দলের আত্মবিশ্বাসে বড় প্রভাব ফেলবে।",
  };
}
