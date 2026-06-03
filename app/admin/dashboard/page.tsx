import Link from "next/link";
import { Send } from "lucide-react";
import { sendLineDailySummaryAction } from "@/app/actions/notifications";
import { updateRedemptionStatusAction } from "@/app/actions/rewards";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { MessageBanner } from "@/components/message-banner";
import { getSupabaseClient } from "@/lib/supabase";
import type { Reward, RewardRedemption, Scan, Store, StoreTier } from "@/lib/types";

export const dynamic = "force-dynamic";

const tiers: StoreTier[] = ["DISTRIBUTOR", "TIER2", "TIER3"];

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = getSupabaseClient();
  const [{ data: stores }, { data: scans }, { data: redemptions }, { data: rewards }] = await Promise.all([
    supabase.from("stores").select("*").returns<Store[]>(),
    supabase.from("scans").select("*").order("scanned_at", { ascending: false }).returns<Scan[]>(),
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }).returns<RewardRedemption[]>(),
    supabase.from("rewards").select("*").returns<Reward[]>()
  ]);

  const storeRows = stores ?? [];
  const scanRows = scans ?? [];
  const redemptionRows = redemptions ?? [];
  const pendingRedemptions = redemptionRows.filter((item) => item.status === "PENDING" || item.status === "PROCESSING");
  const paidRedemptions = redemptionRows.filter((item) => item.status === "PAID" || item.status === "SHIPPED");
  const pendingRedemptionStores = new Set(pendingRedemptions.map((item) => item.store_id)).size;
  const paidRedemptionStores = new Set(paidRedemptions.map((item) => item.store_id)).size;
  const storesById = new Map(storeRows.map((store) => [store.id, store]));
  const rewardsById = new Map((rewards ?? []).map((reward) => [reward.id, reward]));

  return (
    <AdminShell title="Interactive Dashboard" subtitle="Track store activity, points, and scans by tier">
      <MessageBanner message={message} />
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
        <Metric label="Total Stores" value={storeRows.length} />
        <Metric label="Approved" value={storeRows.filter((store) => store.status === "APPROVED").length} />
        <Metric label="Pending" value={storeRows.filter((store) => store.status === "PENDING_APPROVAL").length} />
        <Metric label="Total Scans" value={scanRows.length} />
        <Metric label="Total Points" value={storeRows.reduce((sum, store) => sum + store.points, 0)} />
        <Metric label="Reward Pending Stores" value={pendingRedemptionStores} />
        <Metric label="Reward Paid Stores" value={paidRedemptionStores} />
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
              <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)" }}>{scanRows.filter((scan) => scan.tier_level === tier).length} scans recorded</p>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.75fr)", gap: 18 }}>
        <section style={{ ...adminUi.panel, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", fontWeight: 950 }}>Top Stores by Points</div>
          {[...storeRows].sort((a, b) => b.points - a.points).slice(0, 12).map((store) => (
            <div key={store.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 12, padding: 16, borderBottom: "1px solid rgba(101,0,19,.08)" }}>
              <b>{store.name}</b>
              <span>{store.tier}</span>
              <span>{store.status}</span>
              <span style={{ color: adminUi.ruby, fontWeight: 950 }}>{store.points} pts</span>
            </div>
          ))}
        </section>

        <section style={{ ...adminUi.panel, padding: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Recent Scans</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {scanRows.slice(0, 8).map((scan) => (
              <div key={scan.id} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 14, padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 950 }}>{storesById.get(scan.store_id ?? "")?.name ?? "Unknown store"}</p>
                <p style={{ margin: "4px 0 0", color: adminUi.ruby, fontWeight: 900 }}>{scan.tier_level}</p>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{new Date(scan.scanned_at).toLocaleString()}</p>
              </div>
            ))}
            {!scanRows.length ? <p style={{ color: "rgba(21,19,19,.58)" }}>No scans yet.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ ...adminUi.panel, padding: 20 }}>
      <p style={{ margin: 0, color: "rgba(21,19,19,.55)", fontWeight: 800 }}>{label}</p>
      <p style={{ margin: "8px 0 0", color: adminUi.ruby, fontSize: 38, fontWeight: 950 }}>{value}</p>
    </div>
  );
}
