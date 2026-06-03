import { NextResponse } from "next/server";
import { getAdminSummary } from "@/lib/admin-summary";
import { summarizeWithGemini } from "@/lib/gemini";
import { replyLineText, verifyLineSignature } from "@/lib/line";

type LineWebhookPayload = {
  events?: Array<{
    replyToken?: string;
    type?: string;
    source?: {
      type?: string;
      userId?: string;
      groupId?: string;
      roomId?: string;
    };
    message?: {
      type?: string;
      text?: string;
    };
  }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(body, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid LINE signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as LineWebhookPayload;

  for (const event of payload.events ?? []) {
    if (!event.replyToken || event.type !== "message" || event.message?.type !== "text") continue;

    const text = event.message.text?.trim().toLowerCase() ?? "";
    const isGroupChat = event.source?.type === "group";

    if (isGroupIdCommand(text)) {
      const id = event.source?.groupId ?? event.source?.roomId ?? event.source?.userId ?? "unknown";
      await replyLineText(event.replyToken, `LINE_ADMIN_TO for this chat:\n${id}`);
      continue;
    }

    if (isSummaryCommand(text)) {
      const summary = await getAdminSummary();
      const summaryText = await summarizeWithGemini(summary);
      await replyLineText(event.replyToken, summaryText);
      continue;
    }

    if (isGroupChat) {
      continue;
    }

    await replyLineText(event.replyToken, [
      "ENVY Reward CRM Bot",
      "Commands:",
      "- summary",
      "- dashboard",
      "- groupid"
    ].join("\n"));
  }

  return NextResponse.json({ ok: true });
}

function isGroupIdCommand(text: string) {
  return [
    "groupid",
    "group id",
    "\u0e02\u0e2d\u0e23\u0e2b\u0e31\u0e2a\u0e01\u0e25\u0e38\u0e48\u0e21\u0e2b\u0e19\u0e48\u0e2d\u0e22"
  ].includes(text);
}

function isSummaryCommand(text: string) {
  return [
    "\u0e2a\u0e23\u0e38\u0e1b",
    "summary",
    "dashboard"
  ].includes(text);
}
