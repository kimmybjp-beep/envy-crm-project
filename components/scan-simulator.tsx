"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera, ScanLine, Square, X } from "lucide-react";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";
import type { Store } from "@/lib/types";

type ScanResult = {
  code: string;
  ok: boolean;
  message: string;
};

const scannerHints = new Map<DecodeHintType, unknown>([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A
    ]
  ]
]);

export function ScanSimulator({ stores }: { stores: Store[] }) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [codes, setCodes] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("ยังไม่ได้เปิดกล้อง");
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastCameraCodeRef = useRef("");

  useEffect(() => {
    return () => stopCamera(false);
  }, []);

  function getReader() {
    if (!readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader(scannerHints, {
        delayBetweenScanAttempts: 300,
        delayBetweenScanSuccess: 900,
        tryPlayVideoTimeout: 7000
      });
    }

    return readerRef.current;
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setCameraStatus("เครื่องนี้ไม่รองรับการเปิดกล้องผ่าน browser");
      return;
    }

    try {
      stopCamera(false);
      setCameraStatus("กำลังขอสิทธิ์เปิดกล้อง...");

      const controls = await getReader().decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        },
        videoRef.current,
        (result, error) => {
          if (result) {
            const code = normalizeCode(result.getText());

            if (code && code !== lastCameraCodeRef.current) {
              lastCameraCodeRef.current = code;
              addCodes([code]);
              setCameraStatus("อ่าน QR จากกล้องได้แล้ว เพิ่มเข้าคิวเรียบร้อย");
            }

            return;
          }

          if (error && error.name !== "NotFoundException") {
            setCameraStatus("กล้องเปิดแล้ว แต่ยังอ่าน QR ไม่ได้ ลองขยับให้ QR ชัดและมีแสงพอ");
          }
        }
      );

      controlsRef.current = controls;
      setCameraActive(true);
      setCameraStatus("เปิดกล้องแล้ว เล็ง QR ให้อยู่กลางกรอบ");
    } catch (error) {
      setCameraActive(false);
      setCameraStatus(`เปิดกล้องไม่สำเร็จ: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function stopCamera(updateState = true) {
    controlsRef.current?.stop();
    controlsRef.current = null;
    lastCameraCodeRef.current = "";

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (updateState) {
      setCameraActive(false);
      setCameraStatus("ปิดกล้องแล้ว");
    }
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

  function addManualCode() {
    const code = normalizeCode(manualCode);
    if (!code) return;

    addCodes([code]);
    setManualCode("");
    setStatusMessage("เพิ่มรหัส QR สำรองเข้าคิวแล้ว");
  }

  function addCodes(nextCodes: string[]) {
    setCodes((currentCodes) => Array.from(new Set([...currentCodes, ...nextCodes.map(normalizeCode).filter(Boolean)])));
  }

  return (
    <PremiumPanel className="max-w-xl">
      <div className="mb-6 rounded-lg bg-charcoal p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Mobile Scanner</p>
        <h2 className="mt-2 text-2xl font-semibold">Apple ENVY QR / Barcode</h2>
        <p className="mt-2 text-sm text-white/65">
          เปิด Live Camera เพื่อสแกน QR แล้วกดบันทึกแต้มเข้าระบบ
        </p>
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
                {store.name}
              </option>
            ))}
          </select>
        </PremiumInput>

        <div className="rounded-lg border border-ruby-900/15 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-charcoal">
            <Camera size={18} className="text-ruby-900" />
            Live Camera
          </div>
          <div className="overflow-hidden rounded-xl border border-ruby-900/10 bg-charcoal">
            <video ref={videoRef} playsInline muted autoPlay className="h-64 w-full bg-charcoal object-cover" />
          </div>
          <p className="mt-3 rounded-lg bg-ruby-50 px-4 py-3 text-sm font-semibold text-ruby-900">
            {cameraStatus}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void startCamera()}
              disabled={cameraActive}
              className="inline-flex items-center gap-2 rounded-xl bg-ruby-900 px-4 py-3 text-sm font-black text-white disabled:opacity-45"
            >
              <Camera size={18} />
              เปิดกล้อง
            </button>
            <button
              type="button"
              onClick={() => stopCamera()}
              disabled={!cameraActive}
              className="inline-flex items-center gap-2 rounded-xl border border-ruby-900/15 bg-white px-4 py-3 text-sm font-black text-ruby-900 disabled:opacity-45"
            >
              <Square size={16} />
              ปิดกล้อง
            </button>
          </div>
          <p className="mt-3 text-xs text-charcoal/55">
            บน iPhone ให้เปิดผ่าน Safari/Chrome จริง ถ้าเปิดจาก LINE แล้วกล้องไม่ขึ้น ให้กดเปิดใน browser ภายนอก
          </p>
        </div>

        <div className="rounded-lg border border-ruby-900/10 bg-white p-4">
          <p className="mb-3 font-semibold text-charcoal">กรอกรหัสสำรอง ถ้ากล้องอ่านไม่ได้</p>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="กรอกรหัส QR 18 หลัก"
              className="field-control"
            />
            <button type="button" onClick={addManualCode} className="rounded-xl bg-ruby-900 px-4 font-black text-white">
              Add
            </button>
          </div>
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
                  <span>{maskCode(code)}</span>
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
                  <span className="font-mono">{maskCode(result.code)}</span> - {result.message}
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

function maskCode(code: string) {
  if (code.length <= 8) return code;
  return `${code.slice(0, 4)}••••${code.slice(-4)}`;
}
