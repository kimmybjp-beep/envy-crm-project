import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const batchScanSchema = z.object({
  storeId: z.string().uuid(),
  codes: z.array(z.string().min(3)).min(1).max(200)
});

type RegisterScanResult = {
  ok?: boolean;
  code?: string;
  tier_level?: string;
  alert_id?: string;
};

const scanMessages: Record<string, string> = {
  DUPLICATE_SCAN_IN_TIER: "โค้ดนี้ถูกสแกนใน Tier ของคุณไปแล้ว!",
  SAME_STORE_TIER2_DUPLICATE: "ระบบไม่อนุมัติ: QR นี้เคยถูกสแกนโดยร้านคุณใน Tier 2 แล้ว ระบบแจ้ง Admin ตรวจสอบแล้ว",
  STORE_NOT_APPROVED: "ร้านยังไม่ได้รับอนุมัติ จึงยังสแกนไม่ได้",
  LOCKED_WITH_UNASSIGNED_TIER: "ร้านนี้ถูกล็อก Tier เป็น UNASSIGNED กรุณาติดต่อ Back Office",
  INVALID_SCAN_CODE: "โค้ด QR ไม่ถูกต้อง",
  STORE_REQUIRED: "ไม่พบข้อมูลร้าน",
  STORE_NOT_FOUND: "ไม่พบร้านในระบบ"
};

export async function POST(request: Request) {
  const parsed = batchScanSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "ข้อมูลสแกนไม่ถูกต้อง" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const normalizedCodes = Array.from(
    new Set(parsed.data.codes.map((code) => code.trim().toUpperCase()).filter(Boolean))
  );

  const results = [];

  for (const code of normalizedCodes) {
    const { data, error } = await supabase.rpc("register_scan", {
      p_store_id: parsed.data.storeId,
      p_scanned_code: code
    });
    const scanResult = data as RegisterScanResult | null;

    if (error) {
      results.push({ code, ok: false, message: error.message });
    } else if (!scanResult?.ok) {
      results.push({
        code,
        ok: false,
        message: scanMessages[scanResult?.code ?? ""] ?? "ไม่สามารถบันทึกการสแกนได้"
      });
    } else {
      results.push({
        code,
        ok: true,
        message: `บันทึกสำเร็จ (${scanResult.tier_level ?? "AUTO"})`
      });
    }
  }

  return NextResponse.json({
    ok: true,
    saved: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results
  });
}
