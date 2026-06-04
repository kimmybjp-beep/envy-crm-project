import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QrBatch, RewardRedemption, Scan, Store } from "@/lib/types";

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
  qrBatches: number;
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
    { data: qrBatches }
  ] = await Promise.all([
    supabase.from("stores").select("*").returns<Store[]>(),
    supabase.from("scans").select("*").returns<Scan[]>(),
    supabase.from("scans").select("*").gte("scanned_at", startOfDay.toISOString()).returns<Scan[]>(),
    supabase.from("reward_redemptions").select("*").returns<RewardRedemption[]>(),
    supabase.from("qr_batches").select("*").returns<QrBatch[]>()
  ]);

  const storeRows = stores ?? [];
  const redemptionRows = redemptions ?? [];
  const pendingRedemptions = redemptionRows.filter((item) => item.status === "PENDING" || item.status === "PROCESSING");
  const paidRedemptions = redemptionRows.filter((item) => item.status === "PAID" || item.status === "SHIPPED");

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
    qrBatches: (qrBatches ?? []).length,
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
    `QR batches: ${summary.qrBatches}`,
    "",
    "Top stores:",
    topStores,
    "",
    "Admin: https://envy-crm-project.vercel.app/admin"
  ].join("\n");
}
