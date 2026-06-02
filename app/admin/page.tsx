import { publishAdminMessageAction } from "@/app/actions/admin";
import { reviewStoreAction } from "@/app/actions/stores";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { MessageBanner } from "@/components/message-banner";
import { StatusPill } from "@/components/status-pill";
import { getSupabaseClient } from "@/lib/supabase";
import type { Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = getSupabaseClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("status", "PENDING_APPROVAL")
    .order("created_at", { ascending: false })
    .returns<Store[]>();

  return (
    <AdminShell title="Store Approval" subtitle="Approve outlets and publish messages to stores">
      <MessageBanner message={message} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(240px,.75fr) minmax(320px,1.25fr)",
        gap: 18,
        marginBottom: 18
      }}>
        <section style={{ ...adminUi.panel, padding: 22 }}>
          <p style={{ margin: 0, color: "rgba(21,19,19,.55)", fontWeight: 800 }}>Pending queue</p>
          <p style={{ margin: "6px 0 0", fontSize: 54, lineHeight: 1, fontWeight: 950, color: adminUi.ruby }}>{(stores ?? []).length}</p>
          <p style={{ margin: "8px 0 0", color: "rgba(21,19,19,.58)" }}>stores awaiting review</p>
        </section>

        <section style={{ ...adminUi.panel, padding: 22 }}>
          <form action={publishAdminMessageAction} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
            <label>
              <span style={{ display: "block", marginBottom: 7, fontSize: 13, color: "rgba(21,19,19,.68)", fontWeight: 900 }}>
                Admin broadcast message
              </span>
              <input
                name="message"
                required
                placeholder="เช่น โปรโมชั่น ENVY ประจำสัปดาห์..."
                style={adminUi.input}
              />
            </label>
            <button style={adminUi.button}>Publish</button>
          </form>
        </section>
      </div>

      <section style={{ ...adminUi.panel, overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1.1fr",
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
        {(stores ?? []).length === 0 ? (
          <div style={{ padding: 34, color: "rgba(21,19,19,.62)" }}>No pending stores right now.</div>
        ) : (
          (stores ?? []).map((store) => (
            <div key={store.id} style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1.1fr",
              gap: 12,
              alignItems: "center",
              padding: "18px 20px",
              borderBottom: "1px solid rgba(101,0,19,.08)"
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 950, color: adminUi.charcoal }}>{store.name}</p>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.55)", fontSize: 13 }}>{store.owner_name} - {store.phone}</p>
              </div>
              <div style={{ fontWeight: 800 }}>{store.tier}</div>
              <div style={{ fontWeight: 900, color: adminUi.ruby }}>{store.points}</div>
              <div><StatusPill status={store.status} /></div>
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
            </div>
          ))
        )}
      </section>
    </AdminShell>
  );
}
