import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const batchScanSchema = z.object({
  storeId: z.string().uuid(),
  codes: z.array(z.string().min(3)).min(1).max(200)
});

const DUPLICATE_SCAN_MESSAGE = "\u0e42\u0e04\u0e49\u0e14\u0e19\u0e35\u0e49\u0e16\u0e39\u0e01\u0e2a\u0e41\u0e01\u0e19\u0e43\u0e19 Tier \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e44\u0e1b\u0e41\u0e25\u0e49\u0e27!";

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
    const { error } = await supabase.rpc("register_scan", {
      p_store_id: parsed.data.storeId,
      p_scanned_code: code
    });

    if (error?.code === "23505" || error?.message.includes("DUPLICATE_SCAN_IN_TIER")) {
      results.push({ code, ok: false, message: DUPLICATE_SCAN_MESSAGE });
    } else if (error) {
      results.push({ code, ok: false, message: error.message });
    } else {
      results.push({ code, ok: true, message: "บันทึกสำเร็จ" });
    }
  }

  return NextResponse.json({
    ok: true,
    saved: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results
  });
}
