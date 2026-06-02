import { Database, Download, FileArchive } from "lucide-react";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { QrGeneratorForm } from "@/components/qr-generator-form";
import { getSupabaseClient } from "@/lib/supabase";
import type { QrBatch } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function QrGeneratorPage() {
  const supabase = getSupabaseClient();
  const { data: batches } = await supabase
    .from("qr_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8)
    .returns<QrBatch[]>();

  return (
    <AdminShell title="QR Generator" subtitle="Create distributor QR batches and download printable QR files">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 370px", gap: 18 }}>
        <QrGeneratorForm />
        <aside style={{ display: "grid", gap: 18 }}>
          <section style={{ ...adminUi.panel, padding: 22 }}>
            <p style={{ margin: 0, color: adminUi.ruby, fontSize: 13, fontWeight: 950, letterSpacing: 1.8, textTransform: "uppercase" }}>
              What happens after Generate?
            </p>
            <Info icon={<Database size={18} />} title="Saved to Supabase" text="Batch goes to qr_batches. Every 18-digit code goes to qr_codes." />
            <Info icon={<FileArchive size={18} />} title="ZIP download" text="Browser downloads one ZIP containing SVG QR artwork files." />
            <Info icon={<Download size={18} />} title="Local file only" text="The ZIP is downloaded to this computer. The QR image files are not stored in Supabase Storage yet." />
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
                    <p style={{ margin: 0, fontWeight: 950 }}>{batch.distributor_name}</p>
                    <p style={{ margin: "5px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>{batch.quantity} QR codes</p>
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
