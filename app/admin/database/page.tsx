import { Download } from "lucide-react";
import { AdminShell, adminUi } from "@/components/admin-shell";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const tables = ["stores", "scans", "qr_batches", "qr_codes", "rewards", "reward_redemptions"];

export default async function AdminDatabasePage() {
  const supabase = getSupabaseClient();
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
      <section style={{ ...adminUi.panel, padding: 24 }}>
        <p style={{ margin: 0, color: adminUi.ruby, fontWeight: 950, letterSpacing: 1.5, textTransform: "uppercase" }}>Export center</p>
        <p style={{ color: "rgba(21,19,19,.6)" }}>
          This page shows recent raw rows and downloads each table as CSV, which opens in Excel. For full editing, open{" "}
          <a href={tableEditorUrl} target="_blank" style={{ color: adminUi.ruby, fontWeight: 950 }}>Supabase Table Editor</a>.
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
