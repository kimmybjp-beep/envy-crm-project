import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const sizeDefaults: Record<string, { colorName: string; hex: string; defaultPoints: number; campaignName: string }> = {
  "24": {
    colorName: "Red",
    hex: "#E53935",
    defaultPoints: 20,
    campaignName: "Jumbo Bonus"
  },
  "30": {
    colorName: "Green",
    hex: "#43A047",
    defaultPoints: 10,
    campaignName: "Standard Rewards"
  },
  "36": {
    colorName: "Blue",
    hex: "#1E88E5",
    defaultPoints: 10,
    campaignName: "Standard Rewards"
  },
  other: {
    colorName: "Gray",
    hex: "#757575",
    defaultPoints: 5,
    campaignName: "General Rewards"
  }
};

const qrRequestSchema = z.object({
  distributorName: z.string().min(2).max(120),
  distributorCode: z.string().max(12).optional(),
  appleSize: z.string().min(1).max(12),
  quantity: z.number().int().positive().max(5000),
  pointValue: z.number().int().positive().max(1000).optional(),
  campaignName: z.string().max(120).optional(),
  stickerColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  stickerColorName: z.string().max(40).optional(),
  generatedBy: z.string().max(80).optional()
});

type ReservedRange = {
  start_number: number;
  end_number: number;
};

type GeneratedQrCode = {
  code: string;
  humanReadableCode: string;
  qrUrl: string;
};

export async function POST(request: Request) {
  try {
    const parsed = qrRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "กรอก Distributor, Apple Size, จำนวน QR และแต้มให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const selectedDefault = sizeDefaults[parsed.data.appleSize] ?? sizeDefaults.other;
    const distributorCode = normalizeDistributorCode(parsed.data.distributorCode || parsed.data.distributorName);
    const appleSize = parsed.data.appleSize.trim();
    const prefix = `EV-${distributorCode}-S${appleSize.toUpperCase()}`;
    const pointValue = parsed.data.pointValue ?? selectedDefault.defaultPoints;
    const campaignName = (parsed.data.campaignName || selectedDefault.campaignName).trim();
    const stickerColor = parsed.data.stickerColor ?? selectedDefault.hex;
    const stickerColorName = (parsed.data.stickerColorName || selectedDefault.colorName).trim();
    const batchName = `${parsed.data.distributorName} / Size ${appleSize} / ${campaignName}`;
    const supabase = getSupabaseAdminClient();

    const { data: rangeData, error: rangeError } = await supabase
      .rpc("reserve_qr_code_range", {
        p_prefix: prefix,
        p_quantity: parsed.data.quantity
      })
      .single<ReservedRange>();

    if (rangeError || !rangeData) {
      return NextResponse.json(
        {
          ok: false,
          message: `จอง running number ไม่สำเร็จ: ${rangeError?.code ?? "NO_CODE"} ${rangeError?.message ?? "No range returned"}`
        },
        { status: 500 }
      );
    }

    const codes = buildCodes(prefix, rangeData.start_number, rangeData.end_number);
    const { data: batch, error: batchError } = await supabase
      .from("qr_batches")
      .insert({
        batch_name: batchName,
        distributor_id: distributorCode,
        distributor_name: parsed.data.distributorName,
        apple_size: appleSize,
        sticker_color: stickerColor,
        sticker_color_name: stickerColorName,
        point_value: pointValue,
        campaign_name: campaignName,
        quantity: parsed.data.quantity,
        generated_by: parsed.data.generatedBy ?? "admin",
        status: "generated"
      })
      .select("id")
      .single<{ id: string }>();

    if (batchError || !batch) {
      return NextResponse.json(
        {
          ok: false,
          message: `สร้าง batch ไม่สำเร็จ: ${batchError?.code ?? "NO_CODE"} ${batchError?.message ?? "No batch returned"}`
        },
        { status: 500 }
      );
    }

    const rows = codes.map((item) => ({
      batch_id: batch.id,
      distributor_id: distributorCode,
      distributor_name: parsed.data.distributorName,
      apple_size: appleSize,
      sticker_color: stickerColor,
      sticker_color_name: stickerColorName,
      point_value: pointValue,
      campaign_name: campaignName,
      code: item.humanReadableCode,
      human_readable_code: item.humanReadableCode,
      qr_code: item.qrUrl,
      status: "generated"
    }));

    const { error: codeError } = await supabase.from("qr_codes").insert(rows);

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
      message: `สร้าง QR sticker batch สำเร็จ ${codes.length} รายการ กำลังดาวน์โหลด ZIP`,
      batch: {
        id: batch.id,
        batchName,
        distributorId: distributorCode,
        distributorName: parsed.data.distributorName,
        appleSize,
        stickerColor,
        stickerColorName,
        pointValue,
        campaignName,
        quantity: parsed.data.quantity,
        generatedRange: `${codes[0]?.humanReadableCode} to ${codes.at(-1)?.humanReadableCode}`,
        status: "generated"
      },
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

function buildCodes(prefix: string, startNumber: number, endNumber: number): GeneratedQrCode[] {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://envy-crm-project.vercel.app").replace(/\/$/, "");
  const codes: GeneratedQrCode[] = [];

  for (let number = startNumber; number <= endNumber; number += 1) {
    const humanReadableCode = `${prefix}-${String(number).padStart(6, "0")}`;
    codes.push({
      code: humanReadableCode,
      humanReadableCode,
      qrUrl: `${origin}/scan/${encodeURIComponent(humanReadableCode)}?openExternalBrowser=1`
    });
  }

  return codes;
}

function normalizeDistributorCode(value: string) {
  const tokens = value
    .toUpperCase()
    .match(/[A-Z0-9]+/g);

  if (!tokens?.length) return "D";

  const lastToken = tokens[tokens.length - 1];
  const candidate = lastToken.length <= 4
    ? lastToken
    : tokens.map((token) => token[0]).join("");

  return candidate.replace(/[^A-Z0-9]/g, "").slice(0, 6) || "D";
}
