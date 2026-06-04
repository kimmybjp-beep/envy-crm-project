import Image from "next/image";
import { publishAdminMessageAction } from "@/app/actions/admin";
import { resolveScanAlertAction } from "@/app/actions/scans";
import { resetStorePasswordAction, reviewStoreAction, updateStoreTierAction } from "@/app/actions/stores";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { MessageBanner } from "@/components/message-banner";
import { StatusPill } from "@/components/status-pill";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ScanAlert, Store, StoreTier } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = getSupabaseAdminClient();
  const [{ data: stores }, { data: scanAlerts }] = await Promise.all([
    supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80)
      .returns<Store[]>(),
    supabase
      .from("scan_alerts")
      .select("*")
      .neq("status", "RESOLVED")
      .order("created_at", { ascending: false })
      .limit(12)
      .returns<ScanAlert[]>()
  ]);
  const storeRows = stores ?? [];
  const pendingStores = storeRows.filter((store) => store.status === "PENDING_APPROVAL");
  const alertRows = scanAlerts ?? [];
  const storesById = new Map(storeRows.map((store) => [store.id, store]));

  return (
    <AdminShell title="Store Management" subtitle="Approve outlets, reset passwords, and publish messages to stores">
      <MessageBanner message={message} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(240px,.75fr) minmax(320px,1.25fr)",
        gap: 18,
        marginBottom: 18
      }}>
        <section style={{ ...adminUi.panel, padding: 22 }}>
          <p style={{ margin: 0, color: "rgba(21,19,19,.55)", fontWeight: 800 }}>Pending queue</p>
          <p style={{ margin: "6px 0 0", fontSize: 54, lineHeight: 1, fontWeight: 950, color: adminUi.ruby }}>{pendingStores.length}</p>
          <p style={{ margin: "8px 0 0", color: "rgba(21,19,19,.58)" }}>stores awaiting review</p>
        </section>

        <section style={{ ...adminUi.panel, padding: 22 }}>
          <form action={publishAdminMessageAction} style={{ display: "grid", gap: 12 }}>
            <label>
              <span style={{ display: "block", marginBottom: 7, fontSize: 13, color: "rgba(21,19,19,.68)", fontWeight: 900 }}>
                Store Login Popup Message
              </span>
              <p style={{ margin: "0 0 10px", color: "rgba(21,19,19,.58)", fontSize: 13 }}>
                ข้อความนี้จะเด้งเป็น popup หลังร้านค้า login เข้า Home และยังโชว์ในแถบประกาศด้านล่างด้วย
              </p>
              <textarea
                name="message"
                required
                rows={3}
                maxLength={240}
                placeholder="เช่น โปรโมชั่น ENVY ประจำสัปดาห์..."
                style={{ ...adminUi.input, minHeight: 92, resize: "vertical" }}
              />
            </label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p style={{ margin: 0, color: "rgba(21,19,19,.5)", fontSize: 12, fontWeight: 800 }}>
                จำกัด 240 ตัวอักษร เพื่อให้ popup บนมือถืออ่านง่าย
              </p>
              <button style={adminUi.button}>Publish Popup</button>
            </div>
          </form>
        </section>
      </div>

      <section style={{ ...adminUi.panel, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(101,0,19,.1)" }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Fraud / Suspicious Scan Alerts</h2>
          <p style={{ margin: "5px 0 0", color: "rgba(21,19,19,.58)" }}>
            Alerts are created when a store repeats a Tier 2 QR or hits duplicate tier rules.
          </p>
        </div>
        {alertRows.length ? alertRows.map((alert) => {
          const store = storesById.get(alert.store_id ?? "");
          const existingStore = storesById.get(alert.existing_store_id ?? "");

          return (
            <div key={alert.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr auto", gap: 12, alignItems: "center", padding: "15px 20px", borderBottom: "1px solid rgba(101,0,19,.08)" }}>
              <div>
                <b style={{ color: alert.severity === "CRITICAL" ? adminUi.ruby : adminUi.charcoal }}>{alert.severity} - {alert.alert_type}</b>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{alert.message}</p>
              </div>
              <div>
                <b>{store?.name ?? "Unknown store"}</b>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>{store?.phone ?? ""}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 900 }}>{alert.attempted_tier ?? "AUTO"}</p>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>QR {alert.scanned_code}</p>
                {existingStore ? <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>Existing: {existingStore.name}</p> : null}
              </div>
              <form action={resolveScanAlertAction}>
                <input type="hidden" name="alertId" value={alert.id} />
                <button style={{ ...adminUi.button, padding: "10px 13px", fontSize: 12 }}>Resolve</button>
              </form>
            </div>
          );
        }) : (
          <p style={{ margin: 0, padding: 22, color: "rgba(21,19,19,.58)" }}>No open suspicious scan alerts.</p>
        )}
      </section>

      <section style={{ ...adminUi.panel, overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.1fr .7fr 1fr 2.4fr",
          gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(101,0,19,.1)",
          color: "rgba(21,19,19,.52)",
          fontSize: 12,
          fontWeight: 950,
          letterSpacing: 1.2,
          textTransform: "uppercase"
        }}>
          <span>Store</span>
          <span>Tier</span>
          <span>Points</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {storeRows.length === 0 ? (
          <div style={{ padding: 34, color: "rgba(21,19,19,.62)" }}>No stores right now.</div>
        ) : (
          storeRows.map((store) => (
            <div key={store.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.1fr .7fr 1fr 2.4fr",
              gap: 12,
              alignItems: "start",
              padding: "18px 20px",
              borderBottom: "1px solid rgba(101,0,19,.08)"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "82px minmax(0,1fr)", gap: 14, alignItems: "start" }}>
                {store.image_url ? (
                  <a
                    href={store.image_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      width: 82,
                      height: 82,
                      overflow: "hidden",
                      borderRadius: 18,
                      border: "1px solid rgba(101,0,19,.14)",
                      background: "rgba(101,0,19,.04)",
                      boxShadow: "0 12px 28px rgba(101,0,19,.10)"
                    }}
                    title="Open storefront photo"
                  >
                    <Image
                      src={store.image_url}
                      alt={`Storefront photo for ${store.name}`}
                      width={82}
                      height={82}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </a>
                ) : (
                  <div style={{
                    width: 82,
                    height: 82,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 18,
                    border: "1px dashed rgba(101,0,19,.22)",
                    background: "rgba(101,0,19,.04)",
                    color: "rgba(21,19,19,.45)",
                    fontSize: 11,
                    fontWeight: 900,
                    textAlign: "center"
                  }}>
                    No photo
                  </div>
                )}
                <div>
                  <p style={{ margin: 0, fontWeight: 950, color: adminUi.charcoal }}>{store.name}</p>
                  <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>{store.owner_name} - {store.phone}</p>
                  {store.image_url ? (
                    <a href={store.image_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", marginTop: 8, color: adminUi.ruby, fontSize: 12, fontWeight: 950, textDecoration: "none" }}>
                      View storefront photo
                    </a>
                  ) : null}
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 900 }}>{store.tier}</p>
                <p style={{ margin: "4px 0 0", color: store.tier_locked ? adminUi.ruby : "rgba(21,19,19,.55)", fontSize: 12, fontWeight: 800 }}>
                  {store.tier_locked ? "Locked" : "Auto adjust"}
                </p>
              </div>
              <div style={{ fontWeight: 900, color: adminUi.ruby }}>{store.points}</div>
              <div><StatusPill status={store.status} /></div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <form action={reviewStoreAction}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button style={{ ...adminUi.button, padding: "9px 12px", background: adminUi.charcoal, fontSize: 12 }}>Approve</button>
                  </form>
                  <form action={reviewStoreAction}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <button style={{ ...adminUi.button, padding: "9px 12px", fontSize: 12 }}>Reject</button>
                  </form>
                </div>
                <form action={resetStorePasswordAction} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                  <input type="hidden" name="storeId" value={store.id} />
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="New password"
                    style={{ ...adminUi.input, padding: "9px 10px", fontSize: 13 }}
                  />
                  <button style={{ ...adminUi.button, padding: "9px 12px", background: "#7a0016", fontSize: 12 }}>
                    Reset
                  </button>
                </form>
                <form action={updateStoreTierAction} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center" }}>
                  <input type="hidden" name="storeId" value={store.id} />
                  <select name="tier" defaultValue={store.tier} style={{ ...adminUi.input, padding: "9px 10px", fontSize: 13 }}>
                    {(["UNASSIGNED", "DISTRIBUTOR", "TIER2", "TIER3"] satisfies StoreTier[]).map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: adminUi.charcoal }}>
                    <input type="checkbox" name="tierLocked" defaultChecked={store.tier_locked} />
                    Lock
                  </label>
                  <button style={{ ...adminUi.button, padding: "9px 12px", background: adminUi.deepRuby, fontSize: 12 }}>
                    Save Tier
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>
    </AdminShell>
  );
}
