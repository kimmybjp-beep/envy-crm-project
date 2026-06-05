import { Database, Download, FileArchive, Palette } from "lucide-react";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { QrGeneratorForm } from "@/components/qr-generator-form";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QrBatch } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function QrGeneratorPage() {
  const supabase = getSupabaseAdminClient();
  const { data: batches } = await supabase
    .from("qr_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8)
    .returns<QrBatch[]>();

  return (
    <AdminShell title="QR Generator" subtitle="Create ENVY Partner Rewards sticker kits by distributor and apple size">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 370px", gap: 18 }}>
        <QrGeneratorForm />
        <aside style={{ display: "grid", gap: 18 }}>
          <section style={{ ...adminUi.panel, padding: 22 }}>
            <p style={{ margin: 0, color: adminUi.ruby, fontSize: 13, fontWeight: 950, letterSpacing: 1.8, textTransform: "uppercase" }}>
              What happens after Generate?
            </p>
            <Info icon={<Database size={18} />} title="Saved to Supabase" text="Batch goes to qr_batches. Every sticker QR goes to qr_codes with size, campaign, points, and claim status." />
            <Info icon={<Palette size={18} />} title="Size color logic" text="Size 24 defaults to Red / Jumbo Bonus / 20 points. Size 30 and 36 default to 10 points." />
            <Info icon={<FileArchive size={18} />} title="ZIP download" text="Browser downloads one ZIP containing printable SVG sticker files plus a CSV summary." />
            <Info icon={<Download size={18} />} title="Distributor sticker kit" text="Print and pack stickers by distributor and apple size. Distributor only applies stickers after QC." />
          </section>

          <section style={{ ...adminUi.panel, padding: 22 }}>
            <p style={{ margin: 0, color: adminUi.ruby, fontSize: 13, fontWeight: 950, letterSpacing: 1.8, textTransform: "uppercase" }}>
              Recent batches
            </p>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {(batches ?? []).length === 0 ? (
                <p style={{ margin: 0, color: "rgba(21,19,19,.58)" }}>No QR batches yet.</p>
              ) : (
                (batches ?? []).map((batch) => (
                  <div key={batch.id} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 16, padding: 14 }}>
                    <p style={{ margin: 0, fontWeight: 950 }}>{batch.batch_name ?? batch.distributor_name}</p>
                    <p style={{ margin: "5px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>
                      {batch.quantity} stickers · Size {batch.apple_size ?? "-"} · {batch.point_value ?? 1} pts
                    </p>
                    <p style={{ margin: "5px 0 0", color: adminUi.ruby, fontSize: 12, fontWeight: 950 }}>
                      {batch.status ?? "generated"} · {batch.campaign_name ?? "ENVY Rewards"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
      <span style={{
        width: 38,
        height: 38,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        background: "rgba(169,0,31,.1)",
        color: adminUi.ruby
      }}>
        {icon}
      </span>
      <div>
        <p style={{ margin: 0, fontWeight: 950 }}>{title}</p>
        <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13, lineHeight: 1.45 }}>{text}</p>
      </div>
    </div>
  );
}
