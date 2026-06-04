"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImageUp, ScanLine, Square, X } from "lucide-react";
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

type FileReadStats = {
  selected: number;
  detected: number;
  failed: number;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

const detectorFormats = ["qr_code", "ean_13", "code_128", "code_39", "upc_a"];

export function ScanSimulator({ stores }: { stores: Store[] }) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [codes, setCodes] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [fileStats, setFileStats] = useState<FileReadStats>({ selected: 0, detected: 0, failed: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("ยังไม่ได้เปิดกล้อง");
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerTimerRef = useRef<number | null>(null);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === storeId),
    [storeId, stores]
  );
  const canAutoDetect = typeof window !== "undefined" && Boolean(window.BarcodeDetector);

  useEffect(() => {
    return () => stopCamera(false);
  }, []);

  async function decodeSavedImages(files: FileList | null) {
    if (!files?.length) return;

    const fileArray = Array.from(files);
    setFileStats({ selected: fileArray.length, detected: 0, failed: 0 });
    setStatusMessage(`เลือกแล้ว ${fileArray.length} ไฟล์ กำลังอ่าน QR...`);

    if (!window.BarcodeDetector) {
      setFileStats({ selected: fileArray.length, detected: 0, failed: fileArray.length });
      setStatusMessage(
        `เลือกแล้ว ${fileArray.length} ไฟล์ แต่ browser นี้ยังอ่าน QR จากรูปอัตโนมัติไม่ได้ กรุณาเปิดด้วย Chrome/Android หรือใช้ Live Camera/กรอกรหัสสำรอง`
      );
      return;
    }

    const detector = new window.BarcodeDetector({ formats: detectorFormats });
    const detectedCodes: string[] = [];
    let failedCount = 0;

    for (const file of fileArray) {
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
    setFileStats({ selected: fileArray.length, detected: detectedCodes.length, failed: failedCount });
    setStatusMessage(
      `เลือกแล้ว ${fileArray.length} ไฟล์ อ่านได้ ${detectedCodes.length} ไฟล์${failedCount ? ` อ่านไม่ได้ ${failedCount} ไฟล์` : ""}`
    );
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("เครื่องนี้ไม่รองรับการเปิดกล้องผ่าน browser");
      return;
    }

    if (!window.BarcodeDetector) {
      setCameraStatus("Browser นี้ยังไม่รองรับ Live QR scan กรุณาใช้ Chrome บน Android หรือเลือกรูป/กรอกรหัสสำรอง");
      return;
    }

    try {
      setCameraStatus("กำลังขอสิทธิ์เปิดกล้อง...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCameraStatus("เปิดกล้องแล้ว เล็ง QR ให้อยู่กลางกรอบ");
      startCameraScannerLoop();
    } catch (error) {
      setCameraActive(false);
      setCameraStatus(`เปิดกล้องไม่สำเร็จ: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function startCameraScannerLoop() {
    if (!window.BarcodeDetector) return;

    const detector = new window.BarcodeDetector({ formats: detectorFormats });
    if (scannerTimerRef.current) window.clearInterval(scannerTimerRef.current);

    scannerTimerRef.current = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      try {
        const detected = await detector.detect(video);
        const code = normalizeCode(detected[0]?.rawValue ?? "");

        if (code) {
          addCodes([code]);
          setCameraStatus("อ่าน QR จากกล้องได้แล้ว เพิ่มเข้า queue เรียบร้อย");
        }
      } catch {
        // Keep scanning quietly; noisy camera errors make the UX worse.
      }
    }, 800);
  }

  function stopCamera(updateState = true) {
    if (scannerTimerRef.current) {
      window.clearInterval(scannerTimerRef.current);
      scannerTimerRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

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
    setStatusMessage("เพิ่มรหัส QR สำรองเข้า queue แล้ว");
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
          เลือกรูป QR จากมือถือหรือเปิด Live Camera ระบบจะอ่าน QR แล้วเพิ่มเข้าคิวก่อนกดบันทึก
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
                {store.name} - {store.tier}
              </option>
            ))}
          </select>
        </PremiumInput>

        {selectedStore ? (
          <p className="rounded-lg bg-champagne/15 px-4 py-3 text-sm font-semibold text-ruby-900">
            {selectedStore.tier_locked
              ? `Locked tier: ${selectedStore.tier}`
              : `Auto tier mode: current ${selectedStore.tier}`}
          </p>
        ) : null}

        <div className="rounded-lg border border-ruby-900/15 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-charcoal">
            <Camera size={18} className="text-ruby-900" />
            Live Camera
          </div>
          <div className="overflow-hidden rounded-xl border border-ruby-900/10 bg-charcoal">
            <video ref={videoRef} playsInline muted className="h-64 w-full bg-charcoal object-cover" />
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
        </div>

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
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black">
            <div className="rounded-lg bg-white px-2 py-3 text-charcoal ring-1 ring-ruby-900/10">
              <p className="text-lg text-ruby-900">{fileStats.selected}</p>
              <p>ไฟล์ที่เลือก</p>
            </div>
            <div className="rounded-lg bg-white px-2 py-3 text-charcoal ring-1 ring-ruby-900/10">
              <p className="text-lg text-emerald-700">{fileStats.detected}</p>
              <p>อ่านได้</p>
            </div>
            <div className="rounded-lg bg-white px-2 py-3 text-charcoal ring-1 ring-ruby-900/10">
              <p className="text-lg text-ruby-900">{fileStats.failed}</p>
              <p>อ่านไม่ได้</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-charcoal/60">
            เลือกได้หลายรูปพร้อมกัน ถ้า browser ไม่รองรับ QR auto-read ระบบจะแจ้งทันที
          </p>
        </div>

        <div className="rounded-lg border border-ruby-900/10 bg-white p-4">
          <p className="mb-3 font-semibold text-charcoal">กรอกรหัสสำรอง ถ้ากล้อง/รูปอ่านไม่ได้</p>
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

        {!canAutoDetect ? (
          <p className="rounded-lg bg-champagne/20 px-4 py-3 text-sm font-semibold text-ruby-900">
            หมายเหตุ: Browser นี้ไม่รองรับ QR auto-read ผ่าน BarcodeDetector แนะนำใช้ Chrome บน Android หรือกรอกรหัสสำรอง
          </p>
        ) : null}

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
