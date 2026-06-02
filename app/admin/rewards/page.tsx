import { Gift } from "lucide-react";
import { createRewardAction, updateRewardAction } from "@/app/actions/rewards";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { MessageBanner } from "@/components/message-banner";
import { getSupabaseClient } from "@/lib/supabase";
import type { Reward, RewardRedemption } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = getSupabaseClient();
  const [{ data: rewards }, { data: redemptions }] = await Promise.all([
    supabase.from("rewards").select("*").order("created_at", { ascending: false }).returns<Reward[]>(),
    supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }).limit(20).returns<RewardRedemption[]>()
  ]);

  return (
    <AdminShell title="Reward Management" subtitle="Create reward catalog and review redemption requests">
      <MessageBanner message={message} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: 18 }}>
        <section style={{ ...adminUi.panel, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 16, background: adminUi.ruby, color: "white" }}><Gift /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 950 }}>Create Reward</h2>
              <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)" }}>This is where reward page content is edited.</p>
            </div>
          </div>
          <form action={createRewardAction} style={{ display: "grid", gap: 14 }}>
            <label><b>Reward name</b><input name="name" required style={{ ...adminUi.input, marginTop: 7 }} /></label>
            <label><b>Description</b><textarea name="description" rows={3} style={{ ...adminUi.input, marginTop: 7, resize: "vertical" }} /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label><b>Points required</b><input name="pointsRequired" type="number" min={1} required style={{ ...adminUi.input, marginTop: 7 }} /></label>
              <label><b>Stock</b><input name="stock" type="number" min={0} required defaultValue={10} style={{ ...adminUi.input, marginTop: 7 }} /></label>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
              <input name="isActive" type="checkbox" defaultChecked /> Active reward
            </label>
            <button style={adminUi.button}>Save Reward</button>
          </form>
        </section>

        <section style={{ ...adminUi.panel, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>Recent Redemptions</h2>
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {(redemptions ?? []).length ? redemptions?.map((item) => (
              <div key={item.id} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 14, padding: 12 }}>
                <p style={{ margin: 0, fontWeight: 900 }}>{item.points_spent} points</p>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{item.status} - {new Date(item.created_at).toLocaleString()}</p>
              </div>
            )) : <p style={{ color: "rgba(21,19,19,.58)" }}>No redemptions yet.</p>}
          </div>
        </section>
      </div>

      <section style={{ ...adminUi.panel, marginTop: 18, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid rgba(101,0,19,.1)", fontWeight: 950 }}>Reward Catalog - edit here</div>
        {(rewards ?? []).length ? rewards?.map((reward) => (
          <form key={reward.id} action={updateRewardAction} style={{ display: "grid", gridTemplateColumns: "1.4fr 2fr 120px 100px 100px auto", gap: 10, alignItems: "end", padding: 16, borderBottom: "1px solid rgba(101,0,19,.08)" }}>
            <input type="hidden" name="rewardId" value={reward.id} />
            <label style={{ fontSize: 12, fontWeight: 900, color: "rgba(21,19,19,.58)" }}>
              Name
              <input name="name" defaultValue={reward.name} required style={{ ...adminUi.input, marginTop: 6 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 900, color: "rgba(21,19,19,.58)" }}>
              Description
              <input name="description" defaultValue={reward.description ?? ""} style={{ ...adminUi.input, marginTop: 6 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 900, color: "rgba(21,19,19,.58)" }}>
              Points
              <input name="pointsRequired" type="number" min={1} defaultValue={reward.points_required} required style={{ ...adminUi.input, marginTop: 6 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 900, color: "rgba(21,19,19,.58)" }}>
              Stock
              <input name="stock" type="number" min={0} defaultValue={reward.stock} required style={{ ...adminUi.input, marginTop: 6 }} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 13, fontWeight: 900 }}>
              <input name="isActive" type="checkbox" defaultChecked={reward.is_active} /> Active
            </label>
            <button style={{ ...adminUi.button, padding: "12px 15px" }}>Update</button>
          </form>
        )) : <p style={{ padding: 22, color: "rgba(21,19,19,.58)" }}>No rewards yet.</p>}
      </section>
    </AdminShell>
  );
}
