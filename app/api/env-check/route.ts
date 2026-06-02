import { NextResponse } from "next/server";

export function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const normalizedUrl = rawUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/g, "");

  return NextResponse.json({
    supabaseUrlRaw: maskUrl(rawUrl),
    supabaseUrlNormalized: maskUrl(normalizedUrl),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
    rawHasRestSuffix: /\/rest\/v1\/?$/i.test(rawUrl.trim())
  });
}

function maskUrl(value: string) {
  if (!value) return "";
  return value.replace(/^https:\/\/([^.]{4})[^.]*\./, "https://$1***.");
}
