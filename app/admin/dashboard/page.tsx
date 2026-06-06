import Link from "next/link";
import { GitBranch, Send } from "lucide-react";
import { sendLineDailySummaryAction } from "@/app/actions/notifications";
import { updateRedemptionStatusAction } from "@/app/actions/rewards";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { DashboardFilters, type DashboardPeriod, type DashboardTierFilter } from "@/components/dashboard-filters";
import { MessageBanner } from "@/components/message-banner";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QrBatch, QrCodeRecord, Reward, RewardRedemption, Scan, ScanAlert, Store, StoreTier } from "@/lib/types";

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
  const [{ data: stores }, { data: scans }, { data: redemptions }, { data: rewards }, { data: scanAlerts }, { data: qrCodes }, { data: qrBatches }] = await Promise.all([
    supabase.from("stores").select("*").returns<Store[]>(),
    supabase.from("scans").select("*").order("scanned_at", { ascending: false }).returns<Scan[]>(),
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }).returns<RewardRedemption[]>(),
    supabase.from("rewards").select("*").returns<Reward[]>(),
    supabase.from("scan_alerts").select("*").neq("status", "RESOLVED").returns<ScanAlert[]>(),
    supabase.from("qr_codes").select("*").returns<QrCodeRecord[]>(),
    supabase.from("qr_batches").select("*").order("created_at", { ascending: false }).returns<QrBatch[]>()
  ]);

  const storeRows = stores ?? [];
  const scanRows = scans ?? [];
  const redemptionRows = redemptions ?? [];
  const openAlerts = scanAlerts ?? [];
  const storesById = new Map(storeRows.map((store) => [store.id, store]));
  const rewardsById = new Map((rewards ?? []).map((reward) => [reward.id, reward]));
  const storeMatchesTier = (store: Store | undefined) => selectedTier === "ALL" || store?.tier === selectedTier;
  const qrMatchesTier = (qrCode: QrCodeRecord) => {
    if (selectedTier === "ALL" || selectedTier === "DISTRIBUTOR") return true;
    const code = normalizeScanCode(getQrDisplayCode(qrCode));
    return scanRows.some((scan) => {
      const store = scan.store_id ? storesById.get(scan.store_id) : undefined;
      return normalizeScanCode(scan.scanned_code) === code && (scan.tier_level === selectedTier || store?.tier === selectedTier);
    });
  };

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
  const qrRows = (qrCodes ?? []).filter((qrCode) => isAfterPeriodStart(qrCode.created_at, periodStart) && qrMatchesTier(qrCode));
  const qrClaimRows = qrRows.filter(isQrClaimed);
  const qrUnclaimedRows = qrRows.filter((qrCode) => !isQrClaimed(qrCode) && qrCode.status !== "void");
  const qrClaimRate = qrRows.length ? Math.round((qrClaimRows.length / qrRows.length) * 100) : 0;
  const qrPointsClaimed = qrClaimRows.reduce((sum, qrCode) => sum + (qrCode.point_value ?? 0), 0);
  const distributorSummaries = buildQrDistributorSummaries(qrRows, storesById);
  const sizeSummaries = buildQrSizeSummaries(qrRows);
  const qrNetwork = buildQrNetwork({ qrCodes: qrRows, scans: filteredScans, storesById });

  return (
    <AdminShell title="Interactive Dashboard" subtitle="Track QR issue, claims, points, rewards, and store activity">
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
        <Metric label="QR Issued" value={qrRows.length} />
        <Metric label="QR Claimed" value={qrClaimRows.length} tone="green" />
        <Metric label="Claim Rate" value={qrClaimRate} suffix="%" tone="gold" />
        <Metric label="Unclaimed QR" value={qrUnclaimedRows.length} tone="gold" />
        <Metric label="Claimed Points" value={qrPointsClaimed} />
        <Metric label="Store Points" value={pointsFromFilteredStores} />
        <Metric label="Open Scan Alerts" value={filteredAlerts.length} tone="gold" />
        <Metric label="Total Rewards Claimed" value={filteredRedemptions.length} tone="ruby" />
        <Metric label="Pending Fulfillment" value={pendingRedemptions.length} tone="gold" />
        <Metric label="Successful Fulfills" value={successfulRedemptions.length} tone="green" />
      </div>

      <section style={{ ...adminUi.panel, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 950 }}>QR Reward Performance</h2>
            <p style={{ margin: "6px 0 0", color: "rgba(21,19,19,.58)" }}>
              Report grouped by distributor and apple size, using QR claim data from the database.
            </p>
          </div>
          <div style={{ borderRadius: 999, background: "#fff1f4", color: adminUi.ruby, padding: "9px 13px", fontWeight: 950 }}>
            {qrBatches?.length ?? 0} batches generated
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.72fr)", gap: 0 }}>
          <div style={{ padding: 18, borderRight: "1px solid rgba(101,0,19,.08)" }}>
            <h3 style={{ margin: 0, color: adminUi.ruby, letterSpacing: 1.1, textTransform: "uppercase", fontSize: 14 }}>By Distributor</h3>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {distributorSummaries.slice(0, 8).map((item) => (
                <QrSummaryRow
                  key={item.distributorName}
                  title={item.distributorName}
                  detail={`${item.claimedStoreCount} claiming stores | ${item.totalPointsClaimed} pts claimed`}
                  issued={item.totalCodes}
                  claimed={item.claimedCount}
                  claimRate={item.claimRate}
                />
              ))}
              {!distributorSummaries.length ? <p style={{ color: "rgba(21,19,19,.58)" }}>No QR generated in this filter yet.</p> : null}
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: adminUi.ruby, letterSpacing: 1.1, textTransform: "uppercase", fontSize: 14 }}>By Apple Size</h3>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {sizeSummaries.slice(0, 8).map((item) => (
                <QrSummaryRow
                  key={item.appleSize}
                  title={`Size ${item.appleSize}`}
                  detail={`${item.campaignCount} campaigns | ${item.totalPointsClaimed} pts claimed`}
                  issued={item.totalCodes}
                  claimed={item.claimedCount}
                  claimRate={item.claimRate}
                />
              ))}
              {!sizeSummaries.length ? <p style={{ color: "rgba(21,19,19,.58)" }}>No apple size data in this filter yet.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...adminUi.panel, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 950, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <GitBranch size={24} color={adminUi.ruby} /> QR Market Landing Graph
            </h2>
            <p style={{ margin: "6px 0 0", color: "rgba(21,19,19,.58)" }}>
              Distributor comes from QR batch data. Claimed QR connects to the store that earned points.
            </p>
          </div>
          <div style={{ borderRadius: 999, background: "#fff1f4", color: adminUi.ruby, padding: "9px 13px", fontWeight: 950 }}>
            {qrNetwork.length} distributor networks
          </div>
        </div>
        {qrNetwork.length ? (
          <QrNetworkGraph trees={qrNetwork} />
        ) : (
          <p style={{ margin: 0, padding: 22, color: "rgba(21,19,19,.58)" }}>No QR claim network matches this filter yet.</p>
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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Recent QR Claims</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {qrClaimRows.slice(0, 8).map((qrCode) => {
              const store = qrCode.claimed_by_outlet_id ? storesById.get(qrCode.claimed_by_outlet_id) : undefined;

              return (
                <div key={qrCode.id} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 14, padding: 12 }}>
                  <p style={{ margin: 0, fontWeight: 950 }}>{store?.name ?? "Unknown store"}</p>
                  <p style={{ margin: "4px 0 0", color: adminUi.ruby, fontWeight: 900 }}>{getQrDisplayCode(qrCode)}</p>
                  <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>
                    {getQrDistributorName(qrCode)} | Size {getQrAppleSize(qrCode)} | {qrCode.point_value ?? 0} pts
                  </p>
                  <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{formatDateTime(qrCode.claimed_at ?? qrCode.created_at)}</p>
                </div>
              );
            })}
            {!qrClaimRows.length ? <p style={{ color: "rgba(21,19,19,.58)" }}>No QR claims match this filter.</p> : null}
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

function isAfterPeriodStart(value: string | null | undefined, start: Date | null) {
  if (!start) return true;
  if (!value) return false;
  return new Date(value).getTime() >= start.getTime();
}

type QrDistributorSummary = {
  distributorName: string;
  totalCodes: number;
  claimedCount: number;
  unclaimedCount: number;
  claimRate: number;
  totalPointsClaimed: number;
  claimedStoreCount: number;
};

type QrSizeSummary = {
  appleSize: string;
  totalCodes: number;
  claimedCount: number;
  unclaimedCount: number;
  claimRate: number;
  totalPointsClaimed: number;
  campaignCount: number;
};

type QrClaimNode = {
  storeId: string;
  storeName: string;
  storeTier: StoreTier;
  tierLevel: StoreTier;
  qrCode: string;
  claimedAt: string | null;
  pointValue: number;
};

type QrSizeNetwork = {
  label: string;
  appleSize: string;
  campaignName: string;
  totalCodes: number;
  claimedCount: number;
  claims: QrClaimNode[];
};

type QrNetworkGroup = {
  distributorName: string;
  totalCodes: number;
  claimedCount: number;
  unclaimedCount: number;
  totalPointsClaimed: number;
  sizes: QrSizeNetwork[];
};

function buildQrDistributorSummaries(qrCodes: QrCodeRecord[], storesById: Map<string, Store>): QrDistributorSummary[] {
  const groups = new Map<string, QrDistributorSummary & { claimedStoreIds: Set<string> }>();

  for (const qrCode of qrCodes) {
    const distributorName = getQrDistributorName(qrCode);
    const group = groups.get(distributorName) ?? {
      distributorName,
      totalCodes: 0,
      claimedCount: 0,
      unclaimedCount: 0,
      claimRate: 0,
      totalPointsClaimed: 0,
      claimedStoreCount: 0,
      claimedStoreIds: new Set<string>()
    };

    group.totalCodes += 1;

    if (isQrClaimed(qrCode)) {
      group.claimedCount += 1;
      group.totalPointsClaimed += qrCode.point_value ?? 0;
      if (qrCode.claimed_by_outlet_id && storesById.has(qrCode.claimed_by_outlet_id)) {
        group.claimedStoreIds.add(qrCode.claimed_by_outlet_id);
      }
    } else if (qrCode.status !== "void") {
      group.unclaimedCount += 1;
    }

    groups.set(distributorName, group);
  }

  return [...groups.values()]
    .map(({ claimedStoreIds, ...group }) => ({
      ...group,
      claimedStoreCount: claimedStoreIds.size,
      claimRate: group.totalCodes ? Math.round((group.claimedCount / group.totalCodes) * 100) : 0
    }))
    .sort((a, b) => b.claimedCount - a.claimedCount || b.totalCodes - a.totalCodes);
}

function buildQrSizeSummaries(qrCodes: QrCodeRecord[]): QrSizeSummary[] {
  const groups = new Map<string, QrSizeSummary & { campaigns: Set<string> }>();

  for (const qrCode of qrCodes) {
    const appleSize = getQrAppleSize(qrCode);
    const group = groups.get(appleSize) ?? {
      appleSize,
      totalCodes: 0,
      claimedCount: 0,
      unclaimedCount: 0,
      claimRate: 0,
      totalPointsClaimed: 0,
      campaignCount: 0,
      campaigns: new Set<string>()
    };

    group.totalCodes += 1;
    group.campaigns.add(getQrCampaignName(qrCode));

    if (isQrClaimed(qrCode)) {
      group.claimedCount += 1;
      group.totalPointsClaimed += qrCode.point_value ?? 0;
    } else if (qrCode.status !== "void") {
      group.unclaimedCount += 1;
    }

    groups.set(appleSize, group);
  }

  return [...groups.values()]
    .map(({ campaigns, ...group }) => ({
      ...group,
      campaignCount: campaigns.size,
      claimRate: group.totalCodes ? Math.round((group.claimedCount / group.totalCodes) * 100) : 0
    }))
    .sort((a, b) => b.claimedCount - a.claimedCount || b.totalCodes - a.totalCodes);
}

function buildQrNetwork({
  qrCodes,
  scans,
  storesById
}: {
  qrCodes: QrCodeRecord[];
  scans: Scan[];
  storesById: Map<string, Store>;
}): QrNetworkGroup[] {
  const groups = new Map<string, QrNetworkGroup & { sizesByKey: Map<string, QrSizeNetwork> }>();
  const scansByCode = new Map<string, Scan[]>();

  for (const scan of scans) {
    const code = normalizeScanCode(scan.scanned_code);
    const group = scansByCode.get(code) ?? [];
    group.push(scan);
    scansByCode.set(code, group);
  }

  for (const qrCode of qrCodes) {
    const distributorName = getQrDistributorName(qrCode);
    const group = groups.get(distributorName) ?? {
      distributorName,
      totalCodes: 0,
      claimedCount: 0,
      unclaimedCount: 0,
      totalPointsClaimed: 0,
      sizes: [],
      sizesByKey: new Map<string, QrSizeNetwork>()
    };
    const appleSize = getQrAppleSize(qrCode);
    const campaignName = getQrCampaignName(qrCode);
    const sizeKey = `${appleSize}|${campaignName}`;
    const sizeNode = group.sizesByKey.get(sizeKey) ?? {
      label: `Size ${appleSize} / ${campaignName}`,
      appleSize,
      campaignName,
      totalCodes: 0,
      claimedCount: 0,
      claims: []
    };

    group.totalCodes += 1;
    sizeNode.totalCodes += 1;

    const pointValue = qrCode.point_value ?? 0;
    const qrDisplayCode = getQrDisplayCode(qrCode);
    const qrScans = scansByCode.get(normalizeScanCode(qrDisplayCode)) ?? [];
    const legacyClaimStore = qrCode.claimed_by_outlet_id ? storesById.get(qrCode.claimed_by_outlet_id) : undefined;
    const hasClaim = qrScans.length > 0 || isQrClaimed(qrCode);

    if (hasClaim) {
      group.claimedCount += 1;
      group.totalPointsClaimed += qrScans.length ? qrScans.length * pointValue : pointValue;
      sizeNode.claimedCount += 1;

      if (qrScans.length) {
        for (const scan of qrScans) {
          const store = scan.store_id ? storesById.get(scan.store_id) : undefined;
          sizeNode.claims.push({
            storeId: store?.id ?? scan.store_id ?? `${qrDisplayCode}-${scan.tier_level}`,
            storeName: store?.name ?? "Unknown store",
            storeTier: store?.tier ?? scan.tier_level,
            tierLevel: scan.tier_level,
            qrCode: qrDisplayCode,
            claimedAt: scan.scanned_at,
            pointValue
          });
        }
      } else {
        sizeNode.claims.push({
          storeId: legacyClaimStore?.id ?? qrCode.claimed_by_outlet_id ?? `${qrDisplayCode}-legacy`,
          storeName: legacyClaimStore?.name ?? "Unknown store",
          storeTier: legacyClaimStore?.tier ?? "UNASSIGNED",
          tierLevel: legacyClaimStore?.tier ?? "UNASSIGNED",
          qrCode: qrDisplayCode,
          claimedAt: qrCode.claimed_at,
          pointValue
        });
      }
    } else if (qrCode.status !== "void") {
      group.unclaimedCount += 1;
    }

    group.sizesByKey.set(sizeKey, sizeNode);
    group.sizes = [...group.sizesByKey.values()].sort((a, b) => b.claimedCount - a.claimedCount || b.totalCodes - a.totalCodes);
    groups.set(distributorName, group);
  }

  return [...groups.values()]
    .map((group) => ({
      distributorName: group.distributorName,
      totalCodes: group.totalCodes,
      claimedCount: group.claimedCount,
      unclaimedCount: group.unclaimedCount,
      totalPointsClaimed: group.totalPointsClaimed,
      sizes: group.sizes
    }))
    .sort((a, b) => b.claimedCount - a.claimedCount || b.totalCodes - a.totalCodes)
    .filter((group) => group.totalCodes > 0);
}

type GraphNode = {
  id: string;
  label: string;
  kind: "distributor" | "size" | "tier2" | "tier3";
  x: number;
  y: number;
};

type GraphLink = {
  sourceId: string;
  targetId: string;
};

function QrNetworkGraph({ trees }: { trees: QrNetworkGroup[] }) {
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
            <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,.68)", fontSize: 13 }}>QR flow grouped by distributor, apple size, Tier 2 first scan, and Tier 3 second scan</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <LegendDot color="#f8d98a" label="Distributor" />
            <LegendDot color="#ffffff" label="Size / Campaign" />
            <LegendDot color="#ff4b6a" label="Tier 2 first scan" />
            <LegendDot color="#7dd3fc" label="Tier 3 second scan" />
          </div>
        </div>
        <svg viewBox="0 0 1100 560" role="img" aria-label="QR market landing network graph" style={{ display: "block", width: "100%", minHeight: 360 }}>
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
                stroke={target.kind === "tier3" ? "rgba(125,211,252,.48)" : target.kind === "tier2" ? "rgba(255,75,106,.38)" : "rgba(255,255,255,.22)"}
                strokeWidth={target.kind === "tier3" || target.kind === "tier2" ? 1.35 : 1.1}
              />
            );
          })}
          {graph.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
              <circle
                r={node.kind === "distributor" ? 7 : node.kind === "size" ? 5.5 : node.kind === "tier2" ? 4.8 : 4.3}
                fill={node.kind === "distributor" ? "#f8d98a" : node.kind === "size" ? "#f4f4f4" : node.kind === "tier2" ? "#ff4b6a" : "#7dd3fc"}
                opacity={node.kind === "tier2" || node.kind === "tier3" ? 0.92 : 1}
                filter="url(#node-glow)"
              />
              <text
                x={node.kind === "tier2" || node.kind === "tier3" ? 8 : 9}
                y={node.kind === "distributor" ? -9 : 4}
                fill={node.kind === "distributor" ? "#f8d98a" : "rgba(255,255,255,.78)"}
                fontSize={node.kind === "distributor" ? 13 : 10}
                fontWeight={node.kind === "distributor" ? 900 : 650}
                style={{ pointerEvents: "none" }}
              >
                {shortLabel(node.label, node.kind === "distributor" ? 20 : 18)}
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

function buildNetworkGraph(trees: QrNetworkGroup[]) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Map<string, GraphNode>();
  const distributorTrees = trees.slice(0, 10);

  distributorTrees.forEach((tree, distributorIndex) => {
    const distributorX = spreadPosition(distributorIndex, distributorTrees.length, 90, 1010);
    const distributorId = `d:${tree.distributorName}`;
    addGraphNode(nodeMap, nodes, {
      id: distributorId,
      label: `${tree.distributorName} (${tree.claimedCount}/${tree.totalCodes})`,
      kind: "distributor",
      x: distributorX,
      y: 48 + (distributorIndex % 2) * 26
    });

    const sizeNodes = tree.sizes.slice(0, 8);
    sizeNodes.forEach((sizeNode, sizeIndex) => {
      const sizeId = `s:${tree.distributorName}:${sizeNode.label}`;
      const sizeX = distributorX + spreadOffset(sizeIndex, sizeNodes.length, 180);
      const sizeY = 190 + ((sizeIndex + distributorIndex) % 3) * 34;
      addGraphNode(nodeMap, nodes, {
        id: sizeId,
        label: `${sizeNode.label} (${sizeNode.claimedCount}/${sizeNode.totalCodes})`,
        kind: "size",
        x: clamp(sizeX, 45, 1055),
        y: sizeY
      });
      addGraphLink(links, distributorId, sizeId);

      const tier2Nodes = groupClaimsByTierFlow(sizeNode.claims).slice(0, 8);
      tier2Nodes.forEach((tier2, tier2Index) => {
        const tier2Id = `t2:${tree.distributorName}:${sizeNode.label}:${tier2.storeKey}:${tier2Index}`;
        const tier2X = sizeX + spreadOffset(tier2Index % 4, Math.min(tier2Nodes.length, 4), 180);
        const tier2Y = 350 + Math.floor(tier2Index / 4) * 44 + ((tier2Index + sizeIndex) % 2) * 16;
        addGraphNode(nodeMap, nodes, {
          id: tier2Id,
          label: `T2 ${tier2.storeName} (${tier2.claimCount})`,
          kind: "tier2",
          x: clamp(tier2X, 35, 1065),
          y: tier2Y
        });
        addGraphLink(links, sizeId, tier2Id);

        const tier3Nodes = [...tier2.tier3Stores.values()].slice(0, 5);
        tier3Nodes.forEach((tier3, tier3Index) => {
          const tier3Id = `t3:${tree.distributorName}:${sizeNode.label}:${tier2.storeKey}:${tier3.storeKey}:${tier3Index}`;
          const tier3X = tier2X + spreadOffset(tier3Index, tier3Nodes.length, 140);
          const tier3Y = 455 + Math.floor(tier3Index / 4) * 44 + ((tier3Index + tier2Index) % 2) * 16;
          addGraphNode(nodeMap, nodes, {
            id: tier3Id,
            label: `T3 ${tier3.storeName} (${tier3.claimCount})`,
            kind: "tier3",
            x: clamp(tier3X, 35, 1065),
            y: tier3Y
          });
          addGraphLink(links, tier2Id, tier3Id);
        });
      });
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function shortLabel(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

type TierFlowStore = {
  storeKey: string;
  storeName: string;
  storeTier: StoreTier;
  claimCount: number;
  totalPoints: number;
};

type TierFlowGroup = TierFlowStore & {
  tier3Stores: Map<string, TierFlowStore>;
};

function groupClaimsByTierFlow(claims: QrClaimNode[]) {
  const claimsByQr = new Map<string, QrClaimNode[]>();

  for (const claim of claims) {
    const group = claimsByQr.get(claim.qrCode) ?? [];
    group.push(claim);
    claimsByQr.set(claim.qrCode, group);
  }

  const groups = new Map<string, TierFlowGroup>();

  for (const qrClaims of claimsByQr.values()) {
    const tier2Claim = qrClaims.find((claim) => claim.tierLevel === "TIER2") ?? qrClaims[0];
    const tier3Claim = qrClaims.find((claim) => claim.tierLevel === "TIER3");

    if (!tier2Claim) continue;

    const tier2Key = tier2Claim.storeId || tier2Claim.storeName;
    const tier2Group = groups.get(tier2Key) ?? {
      storeKey: tier2Key,
      storeName: tier2Claim.storeName,
      storeTier: tier2Claim.storeTier,
      claimCount: 0,
      totalPoints: 0,
      tier3Stores: new Map<string, TierFlowStore>()
    };

    tier2Group.claimCount += 1;
    tier2Group.totalPoints += tier2Claim.pointValue;

    if (tier3Claim) {
      const tier3Key = tier3Claim.storeId || tier3Claim.storeName;
      const tier3Group = tier2Group.tier3Stores.get(tier3Key) ?? {
        storeKey: tier3Key,
        storeName: tier3Claim.storeName,
        storeTier: tier3Claim.storeTier,
        claimCount: 0,
        totalPoints: 0
      };
      tier3Group.claimCount += 1;
      tier3Group.totalPoints += tier3Claim.pointValue;
      tier2Group.tier3Stores.set(tier3Key, tier3Group);
    }

    groups.set(tier2Key, tier2Group);
  }

  return [...groups.values()].sort((a, b) => b.claimCount - a.claimCount || b.totalPoints - a.totalPoints);
}

function isQrClaimed(qrCode: QrCodeRecord) {
  return qrCode.status === "claimed" || Boolean(qrCode.claimed_by_outlet_id || qrCode.claimed_at);
}

function normalizeScanCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
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

function formatDateTime(value: string | null | undefined) {
  if (!value) return "No date";
  return new Date(value).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
}

function QrSummaryRow({
  title,
  detail,
  issued,
  claimed,
  claimRate
}: {
  title: string;
  detail: string;
  issued: number;
  claimed: number;
  claimRate: number;
}) {
  return (
    <div style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 16, padding: 13, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 950 }}>{title}</p>
          <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>{detail}</p>
        </div>
        <b style={{ color: adminUi.ruby }}>{claimRate}%</b>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#fff1f4", overflow: "hidden", marginTop: 10 }}>
        <div style={{ width: `${clamp(claimRate, 0, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${adminUi.ruby}, #047857)` }} />
      </div>
      <p style={{ margin: "8px 0 0", color: "rgba(21,19,19,.6)", fontSize: 12 }}>
        {claimed.toLocaleString("en-US")} claimed / {issued.toLocaleString("en-US")} issued
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "ruby",
  suffix = ""
}: {
  label: string;
  value: number;
  tone?: "ruby" | "gold" | "green";
  suffix?: string;
}) {
  const color = tone === "green" ? "#047857" : tone === "gold" ? "#b98018" : adminUi.ruby;
  const background = tone === "green" ? "linear-gradient(135deg, rgba(4,120,87,.08), rgba(255,255,255,.96))" : tone === "gold" ? "linear-gradient(135deg, rgba(217,183,111,.18), rgba(255,255,255,.96))" : "rgba(255,255,255,.96)";

  return (
    <div style={{ ...adminUi.panel, padding: 20, background }}>
      <p style={{ margin: 0, color: "rgba(21,19,19,.55)", fontWeight: 800 }}>{label}</p>
      <p style={{ margin: "8px 0 0", color, fontSize: 38, fontWeight: 950 }}>{value.toLocaleString("en-US")}{suffix}</p>
    </div>
  );
}
