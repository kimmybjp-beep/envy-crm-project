import type { AdminSummary } from "@/lib/admin-summary";
import { formatFallbackSummary } from "@/lib/admin-summary";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function summarizeWithGemini(summary: AdminSummary) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

  if (!apiKey) {
    return formatFallbackSummary(summary);
  }

  const prompt = [
    "You are an operations assistant for Apple ENVY Reward CRM in Thailand.",
    "Write a concise Thai LINE notification for Back Office.",
    "Do not approve, reject, or decide anything. Only summarize and recommend what humans should check.",
    "Keep it under 900 characters.",
    "",
    JSON.stringify(summary, null, 2)
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      return formatFallbackSummary(summary);
    }

    const payload = (await response.json()) as GeminiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

    return text || formatFallbackSummary(summary);
  } catch {
    return formatFallbackSummary(summary);
  }
}
