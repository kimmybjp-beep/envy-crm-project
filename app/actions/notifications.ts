"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSummary } from "@/lib/admin-summary";
import { summarizeWithGemini } from "@/lib/gemini";
import { pushLineText } from "@/lib/line";

export async function sendLineDailySummaryAction() {
  const summary = await getAdminSummary();
  const text = await summarizeWithGemini(summary);
  const result = await pushLineText(text);

  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?message=${result.ok ? "line-summary-sent" : "line-summary-error"}`);
}
