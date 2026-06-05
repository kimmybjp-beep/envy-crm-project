import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { PasswordResetRequest, QrBatch, QrCodeRecord, RewardRedemption, Scan, Store } from "@/lib/types";

export type AdminSummary = {
  generatedAt: string;
  totalStores: number;
  approvedStores: number;
  pendingStores: number;
  totalScans: number;
  todayScans: number;
  pendingRedemptions: number;
  pendingRedemptionStores: number;
  paidRedemptions: number;
  paidRedemptionStores: number;
  pendingPasswordResetRequests: number;
  qrBatches: number;
  qrIssued: number;
  qrClaimed: number;
  qrUnclaimed: number;
  qrClaimRate: number;
  topStores: Array<{
    name: string;
    tier: string;
    points: number;
  }>;
};

export async function getAdminSummary(): Promise<AdminSummary> {
  const supabase = getSupabaseAdminClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    { data: stores },
    { data: scans },
    { data: todayScans },
    { data: redemptions },
    { data: qrBatches },
    { data: qrCodes },
    { data: passwordResetRequests }
  ] = await Promise.all([
    supabase.from("stores").select("*").returns<Store[]>(),
    supabase.from("scans").select("*").returns<Scan[]>(),
    supabase.from("scans").select("*").gte("scanned_at", startOfDay.toISOString()).returns<Scan[]>(),
    supabase.from("reward_redemptions").select("*").returns<RewardRedemption[]>(),
    supabase.from("qr_batches").select("*").returns<QrBatch[]>(),
    supabase.from("qr_codes").select("*").returns<QrCodeRecord[]>(),
    supabase.from("password_reset_requests").select("*").eq("status", "OPEN").returns<PasswordResetRequest[]>()
  ]);

  const storeRows = stores ?? [];
  const redemptionRows = redemptions ?? [];
  const pendingRedemptions = redemptionRows.filter((item) => item.status === "PENDING" || item.status === "PROCESSING");
  const paidRedemptions = redemptionRows.filter((item) => item.status === "PAID" || item.status === "SHIPPED");
  const qrRows = qrCodes ?? [];
  const qrClaimed = qrRows.filter((qrCode) => qrCode.status === "claimed" || Boolean(qrCode.claimed_by_outlet_id || qrCode.claimed_at)).length;
  const qrUnclaimed = qrRows.filter((qrCode) => qrCode.status !== "claimed" && !qrCode.claimed_by_outlet_id && !qrCode.claimed_at && qrCode.status !== "void").length;

  return {
    generatedAt: new Date().toISOString(),
    totalStores: storeRows.length,
    approvedStores: storeRows.filter((store) => store.status === "APPROVED").length,
    pendingStores: storeRows.filter((store) => store.status === "PENDING_APPROVAL").length,
    totalScans: (scans ?? []).length,
    todayScans: (todayScans ?? []).length,
    pendingRedemptions: pendingRedemptions.length,
    pendingRedemptionStores: new Set(pendingRedemptions.map((item) => item.store_id)).size,
    paidRedemptions: paidRedemptions.length,
    paidRedemptionStores: new Set(paidRedemptions.map((item) => item.store_id)).size,
    pendingPasswordResetRequests: (passwordResetRequests ?? []).length,
    qrBatches: (qrBatches ?? []).length,
    qrIssued: qrRows.length,
    qrClaimed,
    qrUnclaimed,
    qrClaimRate: qrRows.length ? Math.round((qrClaimed / qrRows.length) * 100) : 0,
    topStores: [...storeRows]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((store) => ({
        name: store.name,
        tier: store.tier,
        points: store.points
      }))
  };
}

export function formatFallbackSummary(summary: AdminSummary) {
  const topStores = summary.topStores.length
    ? summary.topStores.map((store, index) => `${index + 1}. ${store.name} (${store.tier}) - ${store.points} pts`).join("\n")
    : "No store points yet.";

  return [
    "ENVY Reward CRM Daily Summary",
    `Time: ${new Date(summary.generatedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`,
    "",
    `Stores: ${summary.totalStores}`,
    `Approved: ${summary.approvedStores}`,
    `Pending approval: ${summary.pendingStores}`,
    `Scans today: ${summary.todayScans}`,
    `Total scans: ${summary.totalScans}`,
    `Pending reward payments: ${summary.pendingRedemptions} redemptions / ${summary.pendingRedemptionStores} stores`,
    `Paid rewards: ${summary.paidRedemptions} redemptions / ${summary.paidRedemptionStores} stores`,
    `Pending password resets: ${summary.pendingPasswordResetRequests}`,
    `QR batches: ${summary.qrBatches}`,
    `QR issued: ${summary.qrIssued}`,
    `QR claimed: ${summary.qrClaimed} (${summary.qrClaimRate}%)`,
    `QR unclaimed: ${summary.qrUnclaimed}`,
    "",
    "Top stores:",
    topStores,
    "",
    "Admin: https://envy-crm-project.vercel.app/admin"
  ].join("\n");
}
