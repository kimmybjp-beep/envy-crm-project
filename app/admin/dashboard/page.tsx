import Link from "next/link";
import { GitBranch, Send } from "lucide-react";
import { sendLineDailySummaryAction } from "@/app/actions/notifications";
import { updateRedemptionStatusAction } from "@/app/actions/rewards";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { DashboardFilters, type DashboardPeriod, type DashboardTierFilter } from "@/components/dashboard-filters";
import { MessageBanner } from "@/components/message-banner";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QrCodeRecord, Reward, RewardRedemption, Scan, ScanAlert, Store, StoreTier } from "@/lib/types";

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
  const [{ data: stores }, { data: scans }, { data: redemptions }, { data: rewards }, { data: scanAlerts }, { data: qrCodes }] = await Promise.all([
    supabase.from("stores").select("*").returns<Store[]>(),
    supabase.from("scans").select("*").order("scanned_at", { ascending: false }).returns<Scan[]>(),
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }).returns<RewardRedemption[]>(),
    supabase.from("rewards").select("*").returns<Reward[]>(),
    supabase.from("scan_alerts").select("*").neq("status", "RESOLVED").returns<ScanAlert[]>(),
    supabase.from("qr_codes").select("*").returns<QrCodeRecord[]>()
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
  const salesTrees = buildSalesTrees({
    qrCodes: qrCodes ?? [],
    scans: filteredScans,
    storesById,
    selectedTier
  });

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
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 950, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <GitBranch size={24} color={adminUi.ruby} /> Wholesale Network Sales Tree
            </h2>
            <p style={{ margin: "6px 0 0", color: "rgba(21,19,19,.58)" }}>
              Distributor comes from QR database. 1st scan becomes Tier 2, then the next scan becomes Tier 3.
            </p>
          </div>
          <div style={{ borderRadius: 999, background: "#fff1f4", color: adminUi.ruby, padding: "9px 13px", fontWeight: 950 }}>
            {salesTrees.length} distributor flows
          </div>
        </div>
        {salesTrees.length ? (
          <SalesNetworkGraph trees={salesTrees} />
        ) : (
          <p style={{ margin: 0, padding: 22, color: "rgba(21,19,19,.58)" }}>No wholesale network flow matches this filter yet.</p>
        )}
      </section>

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

type SalesTreeFlow = {
  code: string;
  tier2StoreName: string | null;
  tier2Time: string | null;
  tier3StoreName: string | null;
  tier3Time: string | null;
};

type SalesTree = {
  distributorName: string;
  totalCodes: number;
  flowCount: number;
  tier2Count: number;
  tier3Count: number;
  flows: SalesTreeFlow[];
};

function buildSalesTrees({
  qrCodes,
  scans,
  storesById,
  selectedTier
}: {
  qrCodes: QrCodeRecord[];
  scans: Scan[];
  storesById: Map<string, Store>;
  selectedTier: DashboardTierFilter;
}) {
  const scansByCode = scans.reduce<Record<string, Scan[]>>((groups, scan) => {
    const key = scan.scanned_code.trim().toUpperCase();
    groups[key] = groups[key] ?? [];
    groups[key].push(scan);
    return groups;
  }, {});
  const trees = new Map<string, SalesTree>();

  for (const qrCode of qrCodes) {
    const distributorName = qrCode.distributor_name || "Unknown Distributor";
    const tree = trees.get(distributorName) ?? {
      distributorName,
      totalCodes: 0,
      flowCount: 0,
      tier2Count: 0,
      tier3Count: 0,
      flows: []
    };
    const code = qrCode.code.trim().toUpperCase();
    const codeScans = [...(scansByCode[code] ?? [])].sort((a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime());
    const tier2Scan = codeScans.find((scan) => scan.tier_level === "TIER2") ?? null;
    const tier3Scan = codeScans.find((scan) => scan.tier_level === "TIER3") ?? null;

    tree.totalCodes += 1;

    if (tier2Scan || tier3Scan) {
      tree.flowCount += 1;
      if (tier2Scan) tree.tier2Count += 1;
      if (tier3Scan) tree.tier3Count += 1;

      tree.flows.push({
        code,
        tier2StoreName: tier2Scan?.store_id ? storesById.get(tier2Scan.store_id)?.name ?? "Unknown Tier 2 store" : null,
        tier2Time: tier2Scan?.scanned_at ?? null,
        tier3StoreName: tier3Scan?.store_id ? storesById.get(tier3Scan.store_id)?.name ?? "Unknown Tier 3 store" : null,
        tier3Time: tier3Scan?.scanned_at ?? null
      });
    }

    trees.set(distributorName, tree);
  }

  return [...trees.values()]
    .map((tree) => ({
      ...tree,
      flows: tree.flows
        .filter((flow) => selectedTier === "ALL" || selectedTier === "DISTRIBUTOR" || (selectedTier === "TIER2" && flow.tier2StoreName) || (selectedTier === "TIER3" && flow.tier3StoreName))
        .sort((a, b) => new Date(b.tier3Time ?? b.tier2Time ?? 0).getTime() - new Date(a.tier3Time ?? a.tier2Time ?? 0).getTime())
    }))
    .filter((tree) => tree.flows.length > 0)
    .sort((a, b) => b.flowCount - a.flowCount || b.tier3Count - a.tier3Count);
}

type GraphNode = {
  id: string;
  label: string;
  kind: "distributor" | "tier2" | "tier3";
  x: number;
  y: number;
};

type GraphLink = {
  sourceId: string;
  targetId: string;
};

function SalesNetworkGraph({ trees }: { trees: SalesTree[] }) {
  const graph = buildNetworkGraph(trees);

  return (
    <div style={{ padding: 18 }}>
      <div style={{
        borderRadius: 24,
        background: "radial-gradient(circle at 50% 0%, rgba(169,0,31,.42), rgba(18,18,18,.96) 38%, #111 100%)",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04), 0 24px 70px rgba(101,0,19,.18)",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "16px 18px", color: "white", borderBottom: "1px solid rgba(255,255,255,.08)", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, color: "#f8d98a", fontSize: 12, fontWeight: 950, letterSpacing: 1.5, textTransform: "uppercase" }}>Network Map</p>
            <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,.68)", fontSize: 13 }}>Live scan paths grouped by QR distributor source</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <LegendDot color="#f8d98a" label="Distributor" />
            <LegendDot color="#ffffff" label="Tier 2" />
            <LegendDot color="#ff4b6a" label="Tier 3" />
          </div>
        </div>
        <svg viewBox="0 0 1100 560" role="img" aria-label="Wholesale network graph" style={{ display: "block", width: "100%", minHeight: 360 }}>
          <defs>
            <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {graph.links.map((link) => {
            const source = graph.nodeMap.get(link.sourceId);
            const target = graph.nodeMap.get(link.targetId);
            if (!source || !target) return null;

            const midY = (source.y + target.y) / 2;
            return (
              <path
                key={`${link.sourceId}-${link.targetId}`}
                d={`M ${source.x} ${source.y} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${target.y}`}
                fill="none"
                stroke={target.kind === "tier3" ? "rgba(255,75,106,.38)" : "rgba(255,255,255,.22)"}
                strokeWidth={target.kind === "tier3" ? 1.35 : 1.1}
              />
            );
          })}
          {graph.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
              <circle
                r={node.kind === "distributor" ? 7 : node.kind === "tier2" ? 5.5 : 4.5}
                fill={node.kind === "distributor" ? "#f8d98a" : node.kind === "tier2" ? "#f4f4f4" : "#ff4b6a"}
                opacity={node.kind === "tier3" ? 0.92 : 1}
                filter="url(#node-glow)"
              />
              <text
                x={node.kind === "tier3" ? 8 : 9}
                y={node.kind === "distributor" ? -9 : 4}
                fill={node.kind === "distributor" ? "#f8d98a" : "rgba(255,255,255,.78)"}
                fontSize={node.kind === "distributor" ? 13 : 10}
                fontWeight={node.kind === "distributor" ? 900 : 650}
                style={{ pointerEvents: "none" }}
              >
                {shortLabel(node.label, node.kind === "distributor" ? 20 : 16)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.76)", fontSize: 12, fontWeight: 850 }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, background: color, boxShadow: `0 0 18px ${color}` }} />
      {label}
    </span>
  );
}

function buildNetworkGraph(trees: SalesTree[]) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();
  const tier2Parents = new Map<string, string>();
  const distributorTrees = trees.slice(0, 12);

  distributorTrees.forEach((tree, distributorIndex) => {
    const distributorX = spreadPosition(distributorIndex, distributorTrees.length, 90, 1010);
    const distributorId = `d:${tree.distributorName}`;
    addGraphNode(nodeMap, nodes, {
      id: distributorId,
      label: tree.distributorName,
      kind: "distributor",
      x: distributorX,
      y: 48 + (distributorIndex % 2) * 26
    });

    const tier2Names = uniqueValues(tree.flows.map((flow) => flow.tier2StoreName).filter(Boolean) as string[]).slice(0, 12);
    tier2Names.forEach((tier2Name, tier2Index) => {
      const tier2Id = `t2:${tree.distributorName}:${tier2Name}`;
      const tier2X = distributorX + spreadOffset(tier2Index, tier2Names.length, 150);
      const tier2Y = 195 + ((tier2Index + distributorIndex) % 3) * 34;
      addGraphNode(nodeMap, nodes, {
        id: tier2Id,
        label: tier2Name,
        kind: "tier2",
        x: clamp(tier2X, 45, 1055),
        y: tier2Y
      });
      addGraphLink(links, distributorId, tier2Id);
      tier2Parents.set(tier2Name, tier2Id);
    });

    tree.flows
      .filter((flow) => flow.tier2StoreName && flow.tier3StoreName)
      .slice(0, 48)
      .forEach((flow, flowIndex) => {
        const tier2Id = tier2Parents.get(flow.tier2StoreName ?? "");
        if (!tier2Id || !flow.tier3StoreName) return;

        const parent = nodeMap.get(tier2Id);
        const tier3Id = `t3:${tree.distributorName}:${flow.tier2StoreName}:${flow.tier3StoreName}:${flowIndex}`;
        const tier3X = (parent?.x ?? distributorX) + spreadOffset(flowIndex % 7, 7, 120);
        const tier3Y = 370 + (flowIndex % 4) * 38;
        addGraphNode(nodeMap, nodes, {
          id: tier3Id,
          label: flow.tier3StoreName,
          kind: "tier3",
          x: clamp(tier3X, 35, 1065),
          y: tier3Y
        });
        addGraphLink(links, tier2Id, tier3Id);
      });
  });

  return { nodes, links, nodeMap };
}

function addGraphNode(nodeMap: Map<string, GraphNode>, nodes: GraphNode[], node: GraphNode) {
  if (nodeMap.has(node.id)) return;
  nodeMap.set(node.id, node);
  nodes.push(node);
}

function addGraphLink(links: GraphLink[], sourceId: string, targetId: string) {
  if (links.some((link) => link.sourceId === sourceId && link.targetId === targetId)) return;
  links.push({ sourceId, targetId });
}

function spreadPosition(index: number, count: number, min: number, max: number) {
  if (count <= 1) return (min + max) / 2;
  return min + ((max - min) * index) / (count - 1);
}

function spreadOffset(index: number, count: number, width: number) {
  if (count <= 1) return 0;
  return -width / 2 + (width * index) / (count - 1);
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function shortLabel(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
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
