import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

const allowedTables = new Set([
  "stores",
  "scans",
  "qr_batches",
  "qr_codes",
  "rewards",
  "reward_redemptions"
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;

  if (!allowedTables.has(table)) {
    return NextResponse.json({ error: "Table is not exportable" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv((data ?? []).map(stripSensitiveFields));

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${table}-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "\ufeff";

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
  ];

  return `\ufeff${lines.join("\n")}`;
}

function stripSensitiveFields(row: Record<string, unknown>) {
  const safeRow = { ...row };
  delete safeRow.password_hash;
  delete safeRow.password_salt;
  return safeRow;
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
