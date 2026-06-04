"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSupabaseClient } from "@/lib/supabase";

const DUPLICATE_SCAN_MESSAGE = "\u0e42\u0e04\u0e49\u0e14\u0e19\u0e35\u0e49\u0e16\u0e39\u0e01\u0e2a\u0e41\u0e01\u0e19\u0e43\u0e19 Tier \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e44\u0e1b\u0e41\u0e25\u0e49\u0e27!";
const INVALID_SCAN_MESSAGE = "\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e2a\u0e41\u0e01\u0e19\u0e43\u0e2b\u0e49\u0e04\u0e23\u0e1a\u0e16\u0e49\u0e27\u0e19";
const SCAN_ERROR_MESSAGE = "\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e01\u0e32\u0e23\u0e2a\u0e41\u0e01\u0e19\u0e44\u0e14\u0e49 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e2d\u0e1a\u0e27\u0e48\u0e32\u0e2a\u0e32\u0e02\u0e32\u0e44\u0e14\u0e49\u0e23\u0e31\u0e1a\u0e2d\u0e19\u0e38\u0e21\u0e31\u0e15\u0e34\u0e41\u0e25\u0e49\u0e27";
const SCAN_SUCCESS_MESSAGE = "\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e01\u0e32\u0e23\u0e2a\u0e41\u0e01\u0e19\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08";

type RegisterScanResult = {
  ok?: boolean;
  code?: string;
};

const scanResultMessages: Record<string, string> = {
  DUPLICATE_SCAN_IN_TIER: DUPLICATE_SCAN_MESSAGE,
  SAME_STORE_TIER2_DUPLICATE: "ระบบไม่อนุมัติ: QR นี้เคยถูกสแกนโดยร้านคุณใน Tier 2 แล้ว ระบบแจ้ง Admin ตรวจสอบแล้ว",
  STORE_NOT_APPROVED: SCAN_ERROR_MESSAGE,
  INVALID_SCAN_CODE: INVALID_SCAN_MESSAGE
};

const scanSchema = z.object({
  scannedCode: z.string().min(3),
  storeId: z.string().uuid()
});

export async function registerScanAction(
  _previousState: { ok: boolean; message: string } | null,
  formData: FormData
) {
  const parsed = scanSchema.safeParse({
    scannedCode: formData.get("scannedCode"),
    storeId: formData.get("storeId")
  });

  if (!parsed.success) {
    return { ok: false, message: INVALID_SCAN_MESSAGE };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("register_scan", {
    p_store_id: parsed.data.storeId,
    p_scanned_code: parsed.data.scannedCode
  });
  const scanResult = data as RegisterScanResult | null;

  if (error?.code === "23505" || error?.message.includes("DUPLICATE_SCAN_IN_TIER")) {
    return { ok: false, message: DUPLICATE_SCAN_MESSAGE };
  }

  if (error) {
    return { ok: false, message: SCAN_ERROR_MESSAGE };
  }

  if (!scanResult?.ok) {
    return {
      ok: false,
      message: scanResultMessages[scanResult?.code ?? ""] ?? SCAN_ERROR_MESSAGE
    };
  }

  revalidatePath("/scan");
  return { ok: true, message: SCAN_SUCCESS_MESSAGE };
}

export async function resolveScanAlertAction(formData: FormData) {
  const alertId = z.string().uuid().parse(formData.get("alertId"));
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("scan_alerts")
    .update({
      status: "RESOLVED",
      resolved_at: new Date().toISOString()
    })
    .eq("id", alertId);

  if (error) redirect("/admin?message=scan-alert-error");

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  redirect("/admin?message=scan-alert-resolved");
}
