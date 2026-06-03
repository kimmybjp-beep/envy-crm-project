import { NextResponse } from "next/server";
import { getAdminSummary } from "@/lib/admin-summary";
import { summarizeWithGemini } from "@/lib/gemini";
import { pushLineText } from "@/lib/line";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = authorizeCronRequest(request);

  if (!authResult.ok) {
    return NextResponse.json({ ok: false, message: authResult.message }, { status: 401 });
  }

  return sendDailySummary();
}

export async function POST(request: Request) {
  const authResult = authorizeManualRequest(request);

  if (!authResult.ok) {
    return NextResponse.json({ ok: false, message: authResult.message }, { status: 401 });
  }

  return sendDailySummary();
}

async function sendDailySummary() {
  const summary = await getAdminSummary();
  const text = await summarizeWithGemini(summary);
  const lineResult = await pushLineText(text);

  return NextResponse.json({
    ok: lineResult.ok,
    message: lineResult.message,
    summary,
    text
  }, {
    status: lineResult.ok ? 200 : 500
  });
}

function authorizeCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return {
      ok: false,
      message: "CRON_SECRET is not configured."
    };
  }

  const authorization = request.headers.get("authorization");

  if (authorization === `Bearer ${secret}`) {
    return { ok: true, message: "Authorized." };
  }

  return { ok: false, message: "Unauthorized cron request." };
}

function authorizeManualRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) return { ok: false, message: "CRON_SECRET is not configured." };

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${secret}`
    ? { ok: true, message: "Authorized." }
    : { ok: false, message: "Unauthorized manual request." };
}
