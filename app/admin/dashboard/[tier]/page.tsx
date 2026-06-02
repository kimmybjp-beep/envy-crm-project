import { notFound } from "next/navigation";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { getSupabaseClient } from "@/lib/supabase";
import type { Scan, Store, StoreTier } from "@/lib/types";

export const dynamic = "force-dynamic";

const tiers: StoreTier[] = ["DISTRIBUTOR", "TIER2", "TIER3"];

export default async function TierDashboardPage({
  params
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier: rawTier } = await params;
  const tier = rawTier as StoreTier;

  if (!tiers.includes(tier)) notFound();

  const supabase = getSupabaseClient();
  const [{ data: stores }, { data: scans }] = await Promise.all([
    supabase.from("stores").select("*").eq("tier", tier).returns<Store[]>(),
    supabase.from("scans").select("*").eq("tier_level", tier).order("scanned_at", { ascending: false }).returns<Scan[]>()
  ]);
  const storeRows = stores ?? [];
  const scanRows = scans ?? [];
  const scanCounts = scanRows.reduce<Record<string, number>>((counts, scan) => {
    if (scan.store_id) counts[scan.store_id] = (counts[scan.store_id] ?? 0) + 1;
    return counts;
  }, {});
  const storesById = new Map(storeRows.map((store) => [store.id, store]));

  return (
    <AdminShell title={`${tier} Dashboard`} subtitle="Tier-specific store and scan activity">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 18 }}>
        <Metric label="Stores" value={storeRows.length} />
        <Metric label="Approved" value={storeRows.filter((store) => store.status === "APPROVED").length} />
        <Metric label="Scans" value={scanRows.length} />
        <Metric label="Points" value={storeRows.reduce((sum, store) => sum + store.points, 0)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.7fr)", gap: 18 }}>
        <section style={{ ...adminUi.panel, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", fontWeight: 950 }}>Stores in {tier}</div>
          {storeRows.map((store) => (
            <div key={store.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 12, padding: 16, borderBottom: "1px solid rgba(101,0,19,.08)" }}>
              <div>
                <b>{store.name}</b>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{store.owner_name}</p>
              </div>
              <span>{store.phone}</span>
              <span>{store.status}</span>
              <span style={{ color: adminUi.ruby, fontWeight: 950 }}>{store.points} pts</span>
              <span style={{ fontWeight: 950 }}>{scanCounts[store.id] ?? 0} scans</span>
            </div>
          ))}
          {!storeRows.length ? <p style={{ padding: 22, color: "rgba(21,19,19,.58)" }}>No stores in this tier yet.</p> : null}
        </section>

        <section style={{ ...adminUi.panel, padding: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Recent {tier} Scans</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {scanRows.slice(0, 10).map((scan) => (
              <div key={scan.id} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 14, padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 950 }}>{storesById.get(scan.store_id ?? "")?.name ?? "Unknown store"}</p>
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
