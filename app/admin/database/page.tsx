import { BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const tables = ["stores", "scans", "scan_alerts", "qr_batches", "qr_codes", "qr_code_counters", "rewards", "reward_redemptions"];

const businessReports = [
  {
    slug: "report-qr-claims",
    title: "QR Claim Report",
    description: "Distributor, apple size, claiming store, points, and claim date."
  },
  {
    slug: "report-qr-inventory",
    title: "QR Inventory Report",
    description: "Every generated QR, batch, status, campaign, color, and URL."
  },
  {
    slug: "report-reward-fulfillment",
    title: "Reward Fulfillment Report",
    description: "Reward claims, store details, points spent, and shipment/payment status."
  }
];

export default async function AdminDatabasePage() {
  const supabase = getSupabaseAdminClient();
  const tableSummaries = await Promise.all(
    tables.map(async (table) => {
      const [{ count }, { data }] = await Promise.all([
        supabase.from(table).select("*", { count: "exact", head: true }),
        supabase.from(table).select("*").limit(5)
      ]);

      return {
        table,
        count: count ?? 0,
        rows: ((data ?? []) as Record<string, unknown>[]).map(stripSensitiveFields)
      };
    })
  );
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const tableEditorUrl = projectRef ? `https://supabase.com/dashboard/project/${projectRef}/editor` : "https://supabase.com/dashboard";

  return (
    <AdminShell title="Raw Database & Export" subtitle="View database table summary and export Excel-compatible CSV files">
      <section style={{ ...adminUi.panel, padding: 24, marginBottom: 18 }}>
        <p style={{ margin: 0, color: adminUi.ruby, fontWeight: 950, letterSpacing: 1.5, textTransform: "uppercase" }}>Export center</p>
        <p style={{ color: "rgba(21,19,19,.6)" }}>
          Download business-friendly CSV reports for Excel. For full database editing, open{" "}
          <a href={tableEditorUrl} target="_blank" style={{ color: adminUi.ruby, fontWeight: 950 }}>Supabase Table Editor</a>.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginTop: 16 }}>
          {businessReports.map((report) => (
            <div key={report.slug} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 18, padding: 16, background: "linear-gradient(135deg,#fff,#fff7f8)" }}>
              <span style={{ width: 44, height: 44, borderRadius: 16, background: adminUi.ruby, color: "white", display: "grid", placeItems: "center", boxShadow: "0 12px 26px rgba(169,0,31,.18)" }}>
                <FileSpreadsheet size={20} />
              </span>
              <h2 style={{ margin: "14px 0 0", fontSize: 20, fontWeight: 950 }}>{report.title}</h2>
              <p style={{ minHeight: 44, margin: "6px 0 14px", color: "rgba(21,19,19,.58)", lineHeight: 1.45 }}>{report.description}</p>
              <a href={`/api/export/${report.slug}`} style={{ ...adminUi.button, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Download size={16} /> Download Report
              </a>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...adminUi.panel, padding: 24 }}>
        <p style={{ margin: 0, color: adminUi.ruby, fontWeight: 950, letterSpacing: 1.5, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={17} /> Raw table audit
        </p>
        <p style={{ color: "rgba(21,19,19,.6)" }}>
          Recent raw rows are shown below for checking database health. Use these exports only when you need exact table-level audit data.
        </p>
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {tableSummaries.map((item) => (
            <div key={item.table} style={{ border: "1px solid rgba(101,0,19,.1)", borderRadius: 16, padding: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px auto", gap: 12, alignItems: "center" }}>
                <b>{item.table}</b>
                <span>{item.count} rows</span>
                <a href={`/api/export/${item.table}`} style={{ ...adminUi.button, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Download size={16} /> Export CSV
                </a>
              </div>
              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>
                    {item.rows.length ? item.rows.map((row, rowIndex) => (
                      <tr key={`${item.table}-${rowIndex}`} style={{ borderTop: "1px solid rgba(101,0,19,.08)" }}>
                        {Object.entries(row).slice(0, 6).map(([key, value]) => (
                          <td key={key} style={{ padding: "9px 12px 9px 0", verticalAlign: "top", minWidth: 120 }}>
                            <b style={{ display: "block", color: "rgba(21,19,19,.45)", fontSize: 11 }}>{key}</b>
                            <span>{String(value ?? "").slice(0, 80)}</span>
                          </td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                        <td style={{ paddingTop: 12, color: "rgba(21,19,19,.58)" }}>No rows yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

function stripSensitiveFields(row: Record<string, unknown>) {
  const safeRow = { ...row };
  delete safeRow.password_hash;
  delete safeRow.password_salt;
  return safeRow;
}
