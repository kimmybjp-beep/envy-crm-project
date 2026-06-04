import Link from "next/link";
import { Send } from "lucide-react";
import { sendLineDailySummaryAction } from "@/app/actions/notifications";
import { updateRedemptionStatusAction } from "@/app/actions/rewards";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { DashboardFilters, type DashboardPeriod, type DashboardTierFilter } from "@/components/dashboard-filters";
import { MessageBanner } from "@/components/message-banner";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Reward, RewardRedemption, Scan, ScanAlert, Store, StoreTier } from "@/lib/types";

export const dynamic = "force-dynamic";

const tiers: StoreTier[] = ["UNASSIGNED", "DISTRIBUTOR", "TIER2", "TIER3"];

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; period?: string; tier?: string }>;
}) {
  const { message, period: rawPeriod, tier: rawTier } = await searchParams;
  const selectedPeriod = normalizePeriod(rawPeriod);
  const selectedTier = normalizeTier(rawTier);
  const periodStart = getPeriodStart(selectedPeriod);
  const supabase = getSupabaseAdminClient();
  const [{ data: stores }, { data: scans }, { data: redemptions }, { data: rewards }, { data: scanAlerts }] = await Promise.all([
    supabase.from("stores").select("*").returns<Store[]>(),
    supabase.from("scans").select("*").order("scanned_at", { ascending: false }).returns<Scan[]>(),
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }).returns<RewardRedemption[]>(),
    supabase.from("rewards").select("*").returns<Reward[]>(),
    supabase.from("scan_alerts").select("*").neq("status", "RESOLVED").returns<ScanAlert[]>()
  ]);

  const storeRows = stores ?? [];
  const scanRows = scans ?? [];
  const redemptionRows = redemptions ?? [];
  const openAlerts = scanAlerts ?? [];
  const storesById = new Map(storeRows.map((store) => [store.id, store]));
  const rewardsById = new Map((rewards ?? []).map((reward) => [reward.id, reward]));
  const storeMatchesTier = (store: Store | undefined) => selectedTier === "ALL" || store?.tier === selectedTier;
  const filteredStores = storeRows.filter((store) => storeMatchesTier(store));
  const filteredScans = scanRows.filter((scan) => {
    const store = scan.store_id ? storesById.get(scan.store_id) : undefined;
    return isAfterPeriodStart(scan.scanned_at, periodStart) && (selectedTier === "ALL" || scan.tier_level === selectedTier || store?.tier === selectedTier);
  });
  const filteredRedemptions = redemptionRows.filter((item) => {
    const store = storesById.get(item.store_id);
    return isAfterPeriodStart(item.created_at, periodStart) && storeMatchesTier(store);
  });
  const pendingRedemptions = filteredRedemptions.filter((item) => item.status === "PENDING" || item.status === "PROCESSING");
  const successfulRedemptions = filteredRedemptions.filter((item) => item.status === "PAID" || item.status === "SHIPPED");
  const filteredAlerts = openAlerts.filter((alert) => {
    const store = alert.store_id ? storesById.get(alert.store_id) : undefined;
    return isAfterPeriodStart(alert.created_at, periodStart) && (selectedTier === "ALL" || alert.attempted_tier === selectedTier || store?.tier === selectedTier);
  });
  const scanCountByStore = filteredScans.reduce<Record<string, number>>((counts, scan) => {
    if (scan.store_id) counts[scan.store_id] = (counts[scan.store_id] ?? 0) + 1;
    return counts;
  }, {});
  const pointsFromFilteredStores = filteredStores.reduce((sum, store) => sum + store.points, 0);

  return (
    <AdminShell title="Interactive Dashboard" subtitle="Track store activity, points, and scans by tier">
      <MessageBanner message={message} />
      <DashboardFilters period={selectedPeriod} tier={selectedTier} />
      <section style={{ ...adminUi.panel, padding: 20, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, color: adminUi.ruby, fontWeight: 950, letterSpacing: 1.2, textTransform: "uppercase" }}>LINE Back Office Alert</p>
          <p style={{ margin: "5px 0 0", color: "rgba(21,19,19,.58)" }}>Send the latest dashboard summary to LINE now. Daily cron will also run after LINE env is configured.</p>
        </div>
        <form action={sendLineDailySummaryAction}>
          <button style={{ ...adminUi.button, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Send size={16} /> Send LINE Summary
          </button>
        </form>
      </section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 18 }}>
        <Metric label="Total Stores" value={filteredStores.length} />
        <Metric label="Approved" value={filteredStores.filter((store) => store.status === "APPROVED").length} />
        <Metric label="Pending" value={filteredStores.filter((store) => store.status === "PENDING_APPROVAL").length} />
        <Metric label="Total Scans" value={filteredScans.length} />
        <Metric label="Total Points" value={pointsFromFilteredStores} />
        <Metric label="Open Scan Alerts" value={filteredAlerts.length} tone="gold" />
        <Metric label="Total Rewards Claimed" value={filteredRedemptions.length} tone="ruby" />
        <Metric label="Pending Fulfillment" value={pendingRedemptions.length} tone="gold" />
        <Metric label="Successful Fulfills" value={successfulRedemptions.length} tone="green" />
      </div>

      <section style={{ ...adminUi.panel, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Reward Payment Queue</h2>
            <p style={{ margin: "5px 0 0", color: "rgba(21,19,19,.58)" }}>Pending reward redemptions can be marked paid directly from this dashboard.</p>
          </div>
          <Link href="/admin/rewards" style={{ color: adminUi.ruby, fontWeight: 950 }}>Open Rewards</Link>
        </div>
        {pendingRedemptions.length ? pendingRedemptions.slice(0, 8).map((item) => {
          const store = storesById.get(item.store_id);
          const reward = rewardsById.get(item.reward_id);

          return (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr .8fr auto", gap: 12, alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(101,0,19,.08)" }}>
              <div>
                <b>{store?.name ?? "Unknown store"}</b>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>{store?.tier ?? ""} {store?.phone ? `- ${store.phone}` : ""}</p>
              </div>
              <div>
                <b>{reward?.name ?? "Reward"}</b>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>{item.points_spent} pts</p>
              </div>
              <span style={{ color: adminUi.ruby, fontWeight: 950 }}>{item.status}</span>
              <form action={updateRedemptionStatusAction}>
                <input type="hidden" name="redemptionId" value={item.id} />
                <input type="hidden" name="status" value="PAID" />
                <input type="hidden" name="returnTo" value="dashboard" />
                <button style={{ ...adminUi.button, padding: "10px 13px", fontSize: 12 }}>Mark Paid</button>
              </form>
            </div>
          );
        }) : (
        <p style={{ margin: 0, padding: 22, color: "rgba(21,19,19,.58)" }}>No pending reward payments right now.</p>
        )}
      </section>

      <section style={{ ...adminUi.panel, padding: 22, marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 950 }}>Tier Pages</h2>
        <p style={{ margin: "6px 0 0", color: "rgba(21,19,19,.58)" }}>Click each card to open a separated tier dashboard.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 14 }}>
          {tiers.map((tier) => (
            <Link key={tier} href={`/admin/dashboard/${tier}`} style={{ textDecoration: "none", color: adminUi.charcoal, border: "1px solid rgba(101,0,19,.1)", borderRadius: 18, padding: 18 }}>
              <p style={{ margin: 0, color: adminUi.ruby, fontWeight: 950 }}>{tier}</p>
              <p style={{ margin: "10px 0 0", fontSize: 32, fontWeight: 950 }}>{storeRows.filter((store) => store.tier === tier).length} stores</p>
              <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)" }}>{filteredScans.filter((scan) => scan.tier_level === tier).length} scans in selected period</p>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.75fr)", gap: 18 }}>
        <section style={{ ...adminUi.panel, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", fontWeight: 950 }}>Top Stores by Points</div>
          {[...filteredStores].sort((a, b) => (scanCountByStore[b.id] ?? 0) - (scanCountByStore[a.id] ?? 0) || b.points - a.points).slice(0, 12).map((store) => (
            <div key={store.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 12, padding: 16, borderBottom: "1px solid rgba(101,0,19,.08)" }}>
              <b>{store.name}</b>
              <span>{store.tier}</span>
              <span>{store.status}</span>
              <span style={{ color: adminUi.ruby, fontWeight: 950 }}>{scanCountByStore[store.id] ?? 0} scans / {store.points} pts</span>
            </div>
          ))}
          {!filteredStores.length ? <p style={{ padding: 22, color: "rgba(21,19,19,.58)" }}>No stores match this filter.</p> : null}
        </section>

        <section style={{ ...adminUi.panel, padding: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Recent Scans</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {filteredScans.slice(0, 8).map((scan) => (
              <div key={scan.id} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 14, padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 950 }}>{storesById.get(scan.store_id ?? "")?.name ?? "Unknown store"}</p>
                <p style={{ margin: "4px 0 0", color: adminUi.ruby, fontWeight: 900 }}>{scan.tier_level}</p>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{new Date(scan.scanned_at).toLocaleString()}</p>
              </div>
            ))}
            {!filteredScans.length ? <p style={{ color: "rgba(21,19,19,.58)" }}>No scans match this filter.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function normalizePeriod(value?: string): DashboardPeriod {
  if (value === "day" || value === "week" || value === "month" || value === "all") return value;
  return "all";
}

function normalizeTier(value?: string): DashboardTierFilter {
  if (value === "UNASSIGNED" || value === "DISTRIBUTOR" || value === "TIER2" || value === "TIER3") return value;
  return "ALL";
}

function getPeriodStart(period: DashboardPeriod) {
  if (period === "all") return null;

  const start = new Date();
  if (period === "day") start.setDate(start.getDate() - 1);
  if (period === "week") start.setDate(start.getDate() - 7);
  if (period === "month") start.setMonth(start.getMonth() - 1);
  return start;
}

function isAfterPeriodStart(value: string, start: Date | null) {
  if (!start) return true;
  return new Date(value).getTime() >= start.getTime();
}

function Metric({ label, value, tone = "ruby" }: { label: string; value: number; tone?: "ruby" | "gold" | "green" }) {
  const color = tone === "green" ? "#047857" : tone === "gold" ? "#b98018" : adminUi.ruby;
  const background = tone === "green" ? "linear-gradient(135deg, rgba(4,120,87,.08), rgba(255,255,255,.96))" : tone === "gold" ? "linear-gradient(135deg, rgba(217,183,111,.18), rgba(255,255,255,.96))" : "rgba(255,255,255,.96)";

  return (
    <div style={{ ...adminUi.panel, padding: 20, background }}>
      <p style={{ margin: 0, color: "rgba(21,19,19,.55)", fontWeight: 800 }}>{label}</p>
      <p style={{ margin: "8px 0 0", color, fontSize: 38, fontWeight: 950 }}>{value}</p>
    </div>
  );
}
