"use client";

import { useMemo, useState } from "react";
import { BrowserQRCodeSvgWriter } from "@zxing/browser";
import { EncodeHintType } from "@zxing/library";
import { Download, QrCode, Sparkles } from "lucide-react";
import { adminUi } from "@/components/admin-shell";

type SizeConfig = {
  label: string;
  colorName: string;
  hex: string;
  defaultPoints: number;
  campaignName: string;
};

type QrGeneratorState = {
  ok: boolean;
  message: string;
};

type GeneratedQrCode = {
  code: string;
  humanReadableCode: string;
  qrUrl: string;
};

type GeneratedBatch = {
  id: string;
  batchName: string;
  distributorId: string;
  distributorName: string;
  appleSize: string;
  stickerColor: string;
  stickerColorName: string;
  pointValue: number;
  campaignName: string;
  quantity: number;
  generatedRange: string;
  status: string;
};

type QrGeneratorResponse = {
  ok: boolean;
  message: string;
  batch?: GeneratedBatch;
  codes?: GeneratedQrCode[];
};

const sizeColorMap: Record<string, SizeConfig> = {
  "24": {
    label: "Size 24",
    colorName: "Red",
    hex: "#E53935",
    defaultPoints: 20,
    campaignName: "Jumbo Bonus"
  },
  "30": {
    label: "Size 30",
    colorName: "Green",
    hex: "#43A047",
    defaultPoints: 10,
    campaignName: "Standard Rewards"
  },
  "36": {
    label: "Size 36",
    colorName: "Blue",
    hex: "#1E88E5",
    defaultPoints: 10,
    campaignName: "Standard Rewards"
  },
  other: {
    label: "Other Size",
    colorName: "Gray",
    hex: "#757575",
    defaultPoints: 5,
    campaignName: "General Rewards"
  }
};

const initialState: QrGeneratorState = {
  ok: false,
  message: ""
};

export function QrGeneratorForm() {
  const [state, setState] = useState<QrGeneratorState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [appleSize, setAppleSize] = useState("24");
  const [pointValue, setPointValue] = useState(sizeColorMap["24"].defaultPoints);
  const [campaignName, setCampaignName] = useState(sizeColorMap["24"].campaignName);
  const [stickerColor, setStickerColor] = useState(sizeColorMap["24"].hex);
  const [stickerColorName, setStickerColorName] = useState(sizeColorMap["24"].colorName);
  const [lastBatch, setLastBatch] = useState<GeneratedBatch | null>(null);
  const [lastCodes, setLastCodes] = useState<GeneratedQrCode[]>([]);

  const selectedSize = useMemo(() => sizeColorMap[appleSize] ?? sizeColorMap.other, [appleSize]);

  function applySizeDefaults(nextSize: string) {
    const config = sizeColorMap[nextSize] ?? sizeColorMap.other;
    setAppleSize(nextSize);
    setPointValue(config.defaultPoints);
    setCampaignName(config.campaignName);
    setStickerColor(config.hex);
    setStickerColorName(config.colorName);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState({ ok: false, message: "" });
    setLastBatch(null);
    setLastCodes([]);

    const formData = new FormData(event.currentTarget);
    const distributorName = String(formData.get("distributorName") ?? "").trim();
    const distributorCode = String(formData.get("distributorCode") ?? "").trim();
    const quantity = Number(formData.get("quantity") ?? 0);

    if (!distributorName || !Number.isInteger(quantity) || quantity < 1 || quantity > 5000) {
      setState({ ok: false, message: "กรอกชื่อ distributor และจำนวน QR ให้ถูกต้อง" });
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch("/api/qr-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distributorName,
          distributorCode,
          appleSize,
          quantity,
          pointValue,
          campaignName,
          stickerColor,
          stickerColorName
        })
      });
      const result = (await response.json()) as QrGeneratorResponse;

      if (!result.ok || !result.codes?.length || !result.batch) {
        setState({ ok: false, message: result.message || "สร้าง QR ไม่สำเร็จ" });
        return;
      }

      setState({ ok: true, message: result.message });
      setLastBatch(result.batch);
      setLastCodes(result.codes);
      await downloadQrZip(result.batch, result.codes);
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
            <Sparkles size={15} /> Size-based sticker IDs
          </span>
          <h2 style={{ margin: "18px 0 0", fontSize: 36, lineHeight: 1, fontWeight: 950 }}>Generate QR Sticker Batch</h2>
          <p style={{ margin: "10px 0 0", maxWidth: 560, color: "rgba(255,255,255,.72)", lineHeight: 1.5 }}>
            Create ENVY Partner Rewards stickers by distributor, apple size, campaign, and point value.
          </p>
        </div>
        <div style={{
          height: 150,
          borderRadius: 26,
          background: "white",
          display: "grid",
          placeItems: "center",
          color: stickerColor,
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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px,1fr) 150px 150px",
            gap: 14,
            alignItems: "end"
          }}>
            <Field label="Distributor name">
              <input name="distributorName" required placeholder="Distributor A" style={adminUi.input} />
            </Field>
            <Field label="Distributor code">
              <input name="distributorCode" placeholder="A" maxLength={12} style={adminUi.input} />
            </Field>
            <Field label="QR quantity">
              <input name="quantity" type="number" min={1} max={5000} required defaultValue={10} style={adminUi.input} />
            </Field>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "160px 160px minmax(220px,1fr) 150px",
            gap: 14,
            alignItems: "end"
          }}>
            <Field label="Apple size">
              <select value={appleSize} onChange={(event) => applySizeDefaults(event.target.value)} style={adminUi.input}>
                <option value="24">Size 24</option>
                <option value="30">Size 30</option>
                <option value="36">Size 36</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Point value">
              <input
                type="number"
                min={1}
                max={1000}
                value={pointValue}
                onChange={(event) => setPointValue(Number(event.target.value))}
                style={adminUi.input}
              />
            </Field>
            <Field label="Campaign name">
              <input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} style={adminUi.input} />
            </Field>
            <Field label="Sticker color">
              <input value={stickerColor} onChange={(event) => setStickerColor(event.target.value)} style={{ ...adminUi.input, padding: 6 }} type="color" />
            </Field>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 14,
            alignItems: "end"
          }}>
            <div style={{
              borderRadius: 18,
              border: "1px solid rgba(101,0,19,.1)",
              background: "#fff8fa",
              padding: 14,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 12,
              alignItems: "center"
            }}>
              <span style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                background: stickerColor,
                boxShadow: "0 10px 25px rgba(101,0,19,.18)"
              }} />
              <div>
                <p style={{ margin: 0, fontWeight: 950 }}>{selectedSize.label} | {campaignName}</p>
                <p style={{ margin: "4px 0 0", color: "rgba(21,19,19,.58)", fontSize: 13 }}>
                  {pointValue} points per carton · {stickerColorName}
                </p>
              </div>
            </div>
            <button disabled={isPending} style={{
              ...adminUi.button,
              minHeight: 58,
              opacity: isPending ? 0.65 : 1
            }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Download size={18} />
                {isPending ? "Generating..." : "Generate ZIP"}
              </span>
            </button>
          </div>
        </form>

        {lastBatch ? (
          <div style={{
            marginTop: 20,
            borderRadius: 18,
            border: "1px solid rgba(2,122,72,.22)",
            background: "#f0fdf4",
            padding: 16
          }}>
            <p style={{ margin: 0, fontWeight: 950, color: "#027a48" }}>Batch summary</p>
            <div style={{ marginTop: 10, display: "grid", gap: 6, color: "rgba(21,19,19,.72)", fontSize: 13, lineHeight: 1.45 }}>
              <span>Batch: {lastBatch.batchName}</span>
              <span>Distributor: {lastBatch.distributorName} ({lastBatch.distributorId})</span>
              <span>Size: {lastBatch.appleSize} · Points: {lastBatch.pointValue} · Campaign: {lastBatch.campaignName}</span>
              <span>Generated QR range: {lastBatch.generatedRange}</span>
              <span>Status: {lastBatch.status} · ZIP files: {lastCodes.length}</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span style={{ display: "block", marginBottom: 7, fontSize: 13, color: "rgba(21,19,19,.68)", fontWeight: 900 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

async function downloadQrZip(batch: GeneratedBatch, codes: GeneratedQrCode[]) {
  const files = await Promise.all(codes.map(async (code) => ({
    name: `${safeFileName(batch.distributorName)}-${code.humanReadableCode}.svg`,
    content: await createStickerSvg(batch, code)
  })));

  files.push({
    name: `${safeFileName(batch.distributorName)}-${safeFileName(batch.appleSize)}-summary.csv`,
    content: createCsv(batch, codes)
  });

  const zipBlob = createStoredZip(files);
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(batch.distributorName)}-size-${safeFileName(batch.appleSize)}-qr-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function createStickerSvg(batch: GeneratedBatch, code: GeneratedQrCode) {
  const qrDataUrl = await fetchQrDataUrl(code.qrUrl);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="650" viewBox="0 0 520 650">
  <rect width="520" height="650" rx="30" fill="#fff1f4"/>
  <rect x="26" y="26" width="468" height="598" rx="26" fill="#ffffff" stroke="${escapeXml(batch.stickerColor)}" stroke-width="4"/>
  <rect x="48" y="48" width="424" height="96" rx="22" fill="#5a0012"/>
  <text x="260" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#ffffff">ENVY PARTNER REWARDS</text>
  <text x="260" y="113" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#d8b56d">${escapeXml(batch.distributorName)}</text>
  <rect x="60" y="162" width="400" height="324" rx="18" fill="#ffffff" stroke="${escapeXml(batch.stickerColor)}" stroke-width="3"/>
  <image href="${qrDataUrl}" x="110" y="188" width="300" height="300"/>
  <text x="260" y="526" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="900" fill="${escapeXml(batch.stickerColor)}">SCAN TO EARN ${batch.pointValue} POINTS</text>
  <text x="260" y="558" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#151313">Size ${escapeXml(batch.appleSize)} | ${escapeXml(batch.campaignName)}</text>
  <text x="260" y="588" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#777777">For approved trade partners</text>
  <text x="260" y="614" text-anchor="middle" font-family="Consolas, monospace" font-size="16" font-weight="900" fill="#151313">QR ID: ${escapeXml(code.humanReadableCode)}</text>
</svg>`;
}

async function fetchQrDataUrl(value: string) {
  const writer = new BrowserQRCodeSvgWriter();
  const hints = new Map<EncodeHintType, unknown>([
    [EncodeHintType.MARGIN, 3],
    [EncodeHintType.CHARACTER_SET, "UTF-8"]
  ]);
  const qrSvg = writer.write(value, 300, 300, hints);
  const serialized = new XMLSerializer().serializeToString(qrSvg);
  const encoded = btoa(unescape(encodeURIComponent(serialized)));

  return `data:image/svg+xml;base64,${encoded}`;
}

function createCsv(batch: GeneratedBatch, codes: GeneratedQrCode[]) {
  const header = [
    "batch_id",
    "batch_name",
    "distributor_id",
    "distributor_name",
    "apple_size",
    "campaign_name",
    "point_value",
    "sticker_color",
    "human_readable_code",
    "qr_url"
  ];
  const rows = codes.map((code) => [
    batch.id,
    batch.batchName,
    batch.distributorId,
    batch.distributorName,
    batch.appleSize,
    batch.campaignName,
    String(batch.pointValue),
    batch.stickerColor,
    code.humanReadableCode,
    code.qrUrl
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
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
  return value.replace(/[^a-z0-9ก-๙_-]+/gi, "-").replace(/^-+|-+$/g, "") || "envy";
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
