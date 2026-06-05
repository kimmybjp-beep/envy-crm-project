import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QrBatch, QrCodeRecord, Reward, RewardRedemption, Store } from "@/lib/types";

const allowedTables = new Set([
  "stores",
  "scans",
  "scan_alerts",
  "password_reset_requests",
  "qr_batches",
  "qr_codes",
  "qr_code_counters",
  "rewards",
  "reward_redemptions"
]);

const reportSlugs = new Set([
  "report-qr-claims",
  "report-qr-inventory",
  "report-reward-fulfillment"
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("envy_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin login is required" }, { status: 401 });
  }

  const { table } = await params;
  const supabase = getSupabaseAdminClient();

  if (reportSlugs.has(table)) {
    const report = await buildBusinessReport(table, supabase);

    return csvResponse(report.filename, report.rows, report.headers);
  }

  if (!allowedTables.has(table)) {
    return NextResponse.json({ error: "Table is not exportable" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return csvResponse(table, ((data ?? []) as Record<string, unknown>[]).map(stripSensitiveFields));
}

async function buildBusinessReport(table: string, supabase: ReturnType<typeof getSupabaseAdminClient>) {
  if (table === "report-qr-claims") {
    const [{ data: qrCodes }, { data: stores }] = await Promise.all([
      supabase.from("qr_codes").select("*").order("claimed_at", { ascending: false }).returns<QrCodeRecord[]>(),
      supabase.from("stores").select("*").returns<Store[]>()
    ]);
    const storesById = new Map((stores ?? []).map((store) => [store.id, store]));
    const headers = [
      "Claim Status",
      "QR ID",
      "Distributor",
      "Apple Size",
      "Campaign",
      "Point Value",
      "Store Name",
      "Owner Name",
      "Phone",
      "Store Tier",
      "Store Status",
      "Claimed At",
      "Store Latitude",
      "Store Longitude",
      "QR URL"
    ];
    const rows = (qrCodes ?? [])
      .filter(isQrClaimed)
      .map((qrCode) => {
        const store = qrCode.claimed_by_outlet_id ? storesById.get(qrCode.claimed_by_outlet_id) : undefined;

        return {
          "Claim Status": qrCode.status ?? "claimed",
          "QR ID": getQrDisplayCode(qrCode),
          Distributor: getQrDistributorName(qrCode),
          "Apple Size": getQrAppleSize(qrCode),
          Campaign: getQrCampaignName(qrCode),
          "Point Value": qrCode.point_value ?? 0,
          "Store Name": store?.name ?? "",
          "Owner Name": store?.owner_name ?? "",
          Phone: store?.phone ?? "",
          "Store Tier": store?.tier ?? "",
          "Store Status": store?.status ?? "",
          "Claimed At": formatDateTime(qrCode.claimed_at),
          "Store Latitude": store?.latitude ?? "",
          "Store Longitude": store?.longitude ?? "",
          "QR URL": getQrUrl(qrCode)
        };
      });

    return { filename: "envy-qr-claim-report", headers, rows };
  }

  if (table === "report-qr-inventory") {
    const [{ data: qrCodes }, { data: batches }] = await Promise.all([
      supabase.from("qr_codes").select("*").order("created_at", { ascending: false }).returns<QrCodeRecord[]>(),
      supabase.from("qr_batches").select("*").returns<QrBatch[]>()
    ]);
    const batchesById = new Map((batches ?? []).map((batch) => [batch.id, batch]));
    const headers = [
      "Batch Name",
      "Batch Status",
      "Distributor",
      "Distributor Code",
      "Apple Size",
      "Campaign",
      "Sticker Color",
      "Point Value",
      "Batch Quantity",
      "Generated At",
      "QR ID",
      "QR Status",
      "Claimed At",
      "QR URL"
    ];
    const rows = (qrCodes ?? []).map((qrCode) => {
      const batch = batchesById.get(qrCode.batch_id);

      return {
        "Batch Name": batch?.batch_name ?? "",
        "Batch Status": batch?.status ?? "",
        Distributor: getQrDistributorName(qrCode),
        "Distributor Code": qrCode.distributor_id ?? batch?.distributor_id ?? "",
        "Apple Size": getQrAppleSize(qrCode),
        Campaign: getQrCampaignName(qrCode),
        "Sticker Color": qrCode.sticker_color_name ?? qrCode.sticker_color ?? "",
        "Point Value": qrCode.point_value ?? batch?.point_value ?? 0,
        "Batch Quantity": batch?.quantity ?? "",
        "Generated At": formatDateTime(qrCode.created_at ?? batch?.generated_at ?? batch?.created_at),
        "QR ID": getQrDisplayCode(qrCode),
        "QR Status": qrCode.status ?? "",
        "Claimed At": formatDateTime(qrCode.claimed_at),
        "QR URL": getQrUrl(qrCode)
      };
    });

    return { filename: "envy-qr-inventory-report", headers, rows };
  }

  const [{ data: redemptions }, { data: rewards }, { data: stores }] = await Promise.all([
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }).returns<RewardRedemption[]>(),
    supabase.from("rewards").select("*").returns<Reward[]>(),
    supabase.from("stores").select("*").returns<Store[]>()
  ]);
  const rewardsById = new Map((rewards ?? []).map((reward) => [reward.id, reward]));
  const storesById = new Map((stores ?? []).map((store) => [store.id, store]));
  const headers = [
    "Redemption Status",
    "Requested At",
    "Reward Name",
    "Reward Description",
    "Points Spent",
    "Store Name",
    "Owner Name",
    "Phone",
    "Store Tier",
    "Store Points Balance"
  ];
  const rows = (redemptions ?? []).map((redemption) => {
    const reward = rewardsById.get(redemption.reward_id);
    const store = storesById.get(redemption.store_id);

    return {
      "Redemption Status": redemption.status,
      "Requested At": formatDateTime(redemption.created_at),
      "Reward Name": reward?.name ?? "",
      "Reward Description": reward?.description ?? "",
      "Points Spent": redemption.points_spent,
      "Store Name": store?.name ?? "",
      "Owner Name": store?.owner_name ?? "",
      Phone: store?.phone ?? "",
      "Store Tier": store?.tier ?? "",
      "Store Points Balance": store?.points ?? ""
    };
  });

  return { filename: "envy-reward-fulfillment-report", headers, rows };
}

function csvResponse(filename: string, rows: Record<string, unknown>[], headers?: string[]) {
  const csv = toCsv(rows, headers);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}

function toCsv(rows: Record<string, unknown>[], preferredHeaders?: string[]) {
  const headers = preferredHeaders?.length ? preferredHeaders : Object.keys(rows[0] ?? {});
  if (!headers.length) return "\ufeff";

  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
  ];

  return `\ufeff${lines.join("\n")}`;
}

function stripSensitiveFields(row: Record<string, unknown>) {
  const safeRow = { ...row };
  delete safeRow.password_hash;
  delete safeRow.password_salt;
  return safeRow;
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function isQrClaimed(qrCode: QrCodeRecord) {
  return qrCode.status === "claimed" || Boolean(qrCode.claimed_by_outlet_id || qrCode.claimed_at);
}

function getQrDistributorName(qrCode: QrCodeRecord) {
  return qrCode.distributor_name?.trim() || qrCode.distributor_id?.trim() || "Unknown Distributor";
}

function getQrAppleSize(qrCode: QrCodeRecord) {
  return qrCode.apple_size?.trim() || "Unknown";
}

function getQrCampaignName(qrCode: QrCodeRecord) {
  return qrCode.campaign_name?.trim() || "No campaign";
}

function getQrDisplayCode(qrCode: QrCodeRecord) {
  return (qrCode.human_readable_code || qrCode.code || qrCode.qr_code || "").trim();
}

function getQrUrl(qrCode: QrCodeRecord) {
  const rawUrl = qrCode.qr_code?.trim();
  if (rawUrl?.startsWith("http")) return rawUrl;

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://envy-crm-project.vercel.app").replace(/\/$/, "");
  return `${origin}/scan/${encodeURIComponent(getQrDisplayCode(qrCode))}?openExternalBrowser=1`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
}
