"use client";

import { useMemo, useState } from "react";
import { ImageUp, ScanLine, X } from "lucide-react";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";
import type { Store } from "@/lib/types";

type DetectedBarcode = {
  rawValue: string;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
};

type ScanResult = {
  code: string;
  ok: boolean;
  message: string;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function ScanSimulator({ stores }: { stores: Store[] }) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [codes, setCodes] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isPending, setIsPending] = useState(false);
  const selectedStore = useMemo(
    () => stores.find((store) => store.id === storeId),
    [storeId, stores]
  );

  async function decodeSavedImages(files: FileList | null) {
    if (!files?.length) return;

    if (!window.BarcodeDetector) {
      setStatusMessage("Browser นี้อ่าน QR จากรูปอัตโนมัติไม่ได้ กรุณาใช้ Chrome/Android หรือส่งรูปที่ชัดขึ้น");
      return;
    }

    setStatusMessage(`กำลังอ่าน QR จากรูป ${files.length} ไฟล์...`);

    const detector = new window.BarcodeDetector({
      formats: ["qr_code", "ean_13", "code_128", "code_39", "upc_a"]
    });
    const detectedCodes: string[] = [];
    let failedCount = 0;

    for (const file of Array.from(files)) {
      try {
        const bitmap = await createImageBitmap(file);
        const detected = await detector.detect(bitmap);
        bitmap.close();
        const code = normalizeCode(detected[0]?.rawValue ?? "");

        if (code) {
          detectedCodes.push(code);
        } else {
          failedCount += 1;
        }
      } catch {
        failedCount += 1;
      }
    }

    addCodes(detectedCodes);
    setStatusMessage(`อ่านได้ ${detectedCodes.length} รูป${failedCount ? `, อ่านไม่ได้ ${failedCount} รูป` : ""}`);
  }

  async function saveAllScans() {
    if (!storeId || codes.length === 0) return;

    setIsPending(true);
    setStatusMessage("กำลังบันทึก QR ทั้งหมด...");
    setResults([]);

    try {
      const response = await fetch("/api/scans/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, codes })
      });
      const payload = await response.json() as {
        ok: boolean;
        saved?: number;
        failed?: number;
        message?: string;
        results?: ScanResult[];
      };

      if (!payload.ok) {
        setStatusMessage(payload.message ?? "บันทึกไม่สำเร็จ");
        return;
      }

      setResults(payload.results ?? []);
      setStatusMessage(`บันทึกสำเร็จ ${payload.saved ?? 0} รายการ, ไม่สำเร็จ ${payload.failed ?? 0} รายการ`);
      setCodes((payload.results ?? []).filter((result) => !result.ok).map((result) => result.code));
    } catch (error) {
      setStatusMessage(`เกิด error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsPending(false);
    }
  }

  function addCodes(nextCodes: string[]) {
    setCodes((currentCodes) => Array.from(new Set([...currentCodes, ...nextCodes.map(normalizeCode).filter(Boolean)])));
  }

  return (
    <PremiumPanel className="max-w-xl">
      <div className="mb-6 rounded-lg bg-charcoal p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Mobile Scanner</p>
        <h2 className="mt-2 text-2xl font-semibold">Apple ENVY QR / Barcode</h2>
        <p className="mt-2 text-sm text-white/65">เลือกรูป QR ได้หลายรูปจากเครื่อง หรือกรอก code เองถ้ารูปอ่านไม่ได้</p>
      </div>

      <div className="space-y-4">
        <PremiumInput label="Approved Store">
          <select
            required
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
            className="field-control"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.tier}
              </option>
            ))}
          </select>
        </PremiumInput>
        {selectedStore ? (
          <p className="rounded-lg bg-champagne/15 px-4 py-3 text-sm font-semibold text-ruby-900">
            Active tier: {selectedStore.tier}
          </p>
        ) : null}
        <div className="rounded-lg border border-dashed border-ruby-900/25 bg-ruby-50/40 p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-charcoal">
            <ImageUp size={18} className="text-ruby-900" />
            เลือกรูป QR จากเครื่อง
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              void decodeSavedImages(event.target.files);
              event.currentTarget.value = "";
            }}
            className="w-full rounded-lg border border-ruby-900/15 bg-white px-4 py-3 text-sm"
          />
          <p className="mt-2 text-xs text-charcoal/60">
            เลือกได้หลายรูปพร้อมกัน ไม่ต้องใช้ live camera
          </p>
        </div>

        {statusMessage ? <p className="rounded-lg bg-ruby-50 px-4 py-3 text-sm font-semibold text-ruby-900">{statusMessage}</p> : null}

        <div className="rounded-lg border border-ruby-900/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-semibold text-charcoal">QR ที่รอบันทึก ({codes.length})</p>
            {codes.length ? (
              <button type="button" onClick={() => setCodes([])} className="text-sm font-semibold text-ruby-900">ล้างทั้งหมด</button>
            ) : null}
          </div>
          {codes.length ? (
            <div className="grid gap-2">
              {codes.map((code) => (
                <div key={code} className="flex items-center justify-between gap-3 rounded-lg bg-ruby-50 px-3 py-2 font-mono text-sm text-charcoal">
                  <span>{code}</span>
                  <button type="button" onClick={() => setCodes((currentCodes) => currentCodes.filter((item) => item !== code))} className="text-ruby-900">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal/60">ยังไม่มี QR code ในรายการ</p>
          )}
        </div>

        <LuxuryButton
          type="button"
          onClick={() => void saveAllScans()}
          disabled={isPending || stores.length === 0 || codes.length === 0}
          className="flex w-full items-center justify-center gap-3 px-6 py-5 text-lg"
        >
          <ScanLine size={26} />
          {isPending ? "Saving..." : `บันทึก QR ทั้งหมด (${codes.length})`}
        </LuxuryButton>

        {results.length ? (
          <div className="rounded-lg border border-ruby-900/10 bg-white p-4">
            <p className="mb-3 font-semibold text-charcoal">ผลการบันทึก</p>
            <div className="grid gap-2">
              {results.map((result) => (
                <div key={result.code} className={`rounded-lg px-3 py-2 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-ruby-50 text-ruby-900"}`}>
                  <span className="font-mono">{result.code}</span> - {result.message}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PremiumPanel>
  );
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}
