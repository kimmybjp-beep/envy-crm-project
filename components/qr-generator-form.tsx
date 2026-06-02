"use client";

import { useState } from "react";
import { Download, QrCode, Sparkles } from "lucide-react";
import { adminUi } from "@/components/admin-shell";
import { getSupabaseClient } from "@/lib/supabase";

type QrGeneratorState = {
  ok: boolean;
  message: string;
};

const initialState: QrGeneratorState = {
  ok: false,
  message: ""
};

export function QrGeneratorForm() {
  const [state, setState] = useState<QrGeneratorState>(initialState);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState({ ok: false, message: "" });

    const formData = new FormData(event.currentTarget);
    const distributorName = String(formData.get("distributorName") ?? "").trim();
    const quantity = Number(formData.get("quantity") ?? 0);

    if (!distributorName || !Number.isInteger(quantity) || quantity < 1 || quantity > 5000) {
      setState({ ok: false, message: "กรอกชื่อ distributor และจำนวน QR ให้ถูกต้อง" });
      setIsPending(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: batch, error: batchError } = await supabase
        .from("qr_batches")
        .insert({
          distributor_name: distributorName,
          quantity
        })
        .select("id")
        .single();

      if (batchError || !batch) {
        setState({
          ok: false,
          message: `สร้าง batch ไม่สำเร็จ: ${batchError?.code ?? "NO_CODE"} ${batchError?.message ?? "No batch returned"}`
        });
        setIsPending(false);
        return;
      }

      const codes = buildUniqueCodes(quantity);
      const { error: codeError } = await supabase.from("qr_codes").insert(
        codes.map((code) => ({
          batch_id: batch.id,
          distributor_name: distributorName,
          code
        }))
      );

      if (codeError) {
        setState({
          ok: false,
          message: `บันทึก QR ลง database ไม่สำเร็จ: ${codeError.code ?? "NO_CODE"} ${codeError.message}`
        });
        setIsPending(false);
        return;
      }

      setState({ ok: true, message: `สร้าง QR สำเร็จ ${codes.length} รายการ กำลังดาวน์โหลด ZIP` });
      await downloadQrZip(distributorName, codes);
    } catch (error) {
      setState({
        ok: false,
        message: `เกิด error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section style={{ ...adminUi.panel, overflow: "hidden" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 190px",
        gap: 18,
        alignItems: "center",
        padding: 24,
        background: `linear-gradient(135deg, ${adminUi.deepRuby}, ${adminUi.ruby})`,
        color: "white"
      }}>
        <div>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            padding: "8px 12px",
            background: "rgba(255,255,255,.14)",
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: 1.4,
            textTransform: "uppercase"
          }}>
            <Sparkles size={15} /> Unique 18-digit IDs
          </span>
          <h2 style={{ margin: "18px 0 0", fontSize: 36, lineHeight: 1, fontWeight: 950 }}>Generate QR Batch</h2>
          <p style={{ margin: "10px 0 0", maxWidth: 520, color: "rgba(255,255,255,.72)", lineHeight: 1.5 }}>
            Create tracking codes, write every code into Supabase, then download all printable QR artwork as a ZIP file.
          </p>
        </div>
        <div style={{
          height: 150,
          borderRadius: 26,
          background: "white",
          display: "grid",
          placeItems: "center",
          color: adminUi.ruby,
          boxShadow: "0 18px 50px rgba(0,0,0,.2)"
        }}>
          <QrCode size={92} />
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {state.message ? (
          <div style={{
            marginBottom: 18,
            borderRadius: 16,
            padding: "13px 15px",
            background: state.ok ? "#ecfdf3" : "#fff1f4",
            color: state.ok ? "#027a48" : adminUi.ruby,
            border: `1px solid ${state.ok ? "#abefc6" : "rgba(169,0,31,.18)"}`,
            fontWeight: 850
          }}>
            {state.message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px,1fr) 170px auto",
          gap: 14,
          alignItems: "end"
        }}>
          <label>
            <span style={{ display: "block", marginBottom: 7, fontSize: 13, color: "rgba(21,19,19,.68)", fontWeight: 900 }}>
              Distributor name
            </span>
            <input name="distributorName" required placeholder="Distributor A" style={adminUi.input} />
          </label>
          <label>
            <span style={{ display: "block", marginBottom: 7, fontSize: 13, color: "rgba(21,19,19,.68)", fontWeight: 900 }}>
              QR quantity
            </span>
            <input name="quantity" type="number" min={1} max={5000} required defaultValue={10} style={adminUi.input} />
          </label>
          <button disabled={isPending} style={{
            ...adminUi.button,
            minHeight: 48,
            opacity: isPending ? 0.65 : 1
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Download size={18} />
              {isPending ? "Generating..." : "Generate ZIP"}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}

async function downloadQrZip(distributorName: string, codes: string[]) {
  const files = await Promise.all(codes.map(async (code) => ({
    name: `${safeFileName(distributorName)}-${code}.svg`,
    content: await createQrSvg(code, distributorName)
  })));
  const zipBlob = createStoredZip(files);
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(distributorName)}-qr-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildUniqueCodes(quantity: number) {
  const codes = new Set<string>();
  const values = new Uint8Array(18);

  while (codes.size < quantity) {
    crypto.getRandomValues(values);
    codes.add(Array.from(values, (value) => (value % 10).toString()).join(""));
  }

  return Array.from(codes);
}

async function createQrSvg(code: string, distributorName: string) {
  const qrDataUrl = await fetchQrDataUrl(code);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="650" viewBox="0 0 520 650">
  <rect width="520" height="650" rx="30" fill="#fff1f4"/>
  <rect x="26" y="26" width="468" height="598" rx="26" fill="#ffffff" stroke="#d9b76f" stroke-width="2"/>
  <rect x="48" y="48" width="424" height="84" rx="22" fill="#a9001f"/>
  <text x="260" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#ffffff">APPLE ENVY QR</text>
  <text x="260" y="108" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#f8d98a">${escapeXml(distributorName)}</text>
  <rect x="70" y="140" width="368" height="368" rx="18" fill="#ffffff" stroke="#a9001f" stroke-width="3"/>
  <image href="${qrDataUrl}" x="86" y="156" width="336" height="336"/>
  <text x="260" y="558" text-anchor="middle" font-family="Consolas, monospace" font-size="25" font-weight="900" fill="#151313">${code}</text>
  <text x="260" y="588" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#777">18-digit unique tracking ID</text>
</svg>`;
}

async function fetchQrDataUrl(code: string) {
  const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=336x336&data=${encodeURIComponent(code)}`);
  const blob = await response.blob();

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9ก-๙_-]+/gi, "-").replace(/^-+|-+$/g, "") || "distributor";
}

function createStoredZip(files: { name: string; content: string }[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const crc = crc32(contentBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(8, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, contentBytes.length, true);
    localView.setUint32(22, contentBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, contentBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, contentBytes.length, true);
    centralView.setUint32(24, contentBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...localParts, ...centralParts, end] as BlobPart[], { type: "application/zip" });
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
