import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

const qrRequestSchema = z.object({
  distributorName: z.string().min(2),
  quantity: z.number().int().positive().max(5000)
});

export async function POST(request: Request) {
  try {
    const parsed = qrRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "กรอกชื่อ distributor และจำนวน QR ให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: batch, error: batchError } = await supabase
      .from("qr_batches")
      .insert({
        distributor_name: parsed.data.distributorName,
        quantity: parsed.data.quantity
      })
      .select("id")
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        {
          ok: false,
          message: `สร้าง batch ไม่สำเร็จ: ${batchError?.code ?? "NO_CODE"} ${batchError?.message ?? "No batch returned"}`
        },
        { status: 500 }
      );
    }

    const codes = buildUniqueCodes(parsed.data.quantity);
    const { error: codeError } = await supabase.from("qr_codes").insert(
      codes.map((code) => ({
        batch_id: batch.id,
        distributor_name: parsed.data.distributorName,
        code
      }))
    );

    if (codeError) {
      return NextResponse.json(
        {
          ok: false,
          message: `บันทึก QR ลง database ไม่สำเร็จ: ${codeError.code ?? "NO_CODE"} ${codeError.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `สร้าง QR สำเร็จ ${codes.length} รายการ กำลังดาวน์โหลด ZIP`,
      distributorName: parsed.data.distributorName,
      codes
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: `เกิด error จาก server: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    );
  }
}

function buildUniqueCodes(quantity: number) {
  const codes = new Set<string>();

  while (codes.size < quantity) {
    const candidate = Array.from({ length: 18 }, () => randomInt(0, 10).toString()).join("");
    codes.add(candidate);
  }

  return Array.from(codes);
}
