"use client";

import { useActionState, useMemo, useState } from "react";
import { ImageUp, ScanLine } from "lucide-react";
import { registerScanAction } from "@/app/actions/scans";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";
import type { Store } from "@/lib/types";

type DetectedBarcode = {
  rawValue: string;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

const initialState = {
  ok: false,
  message: ""
};

export function ScanSimulator({ stores }: { stores: Store[] }) {
  const [state, formAction, isPending] = useActionState(registerScanAction, initialState);
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [scannedCode, setScannedCode] = useState("");
  const [imageScanMessage, setImageScanMessage] = useState("");
  const selectedStore = useMemo(
    () => stores.find((store) => store.id === storeId),
    [storeId, stores]
  );

  function fillSimulatedCode() {
    const code = `ENVY-${Math.floor(100000 + Math.random() * 900000)}`;
    setScannedCode(code);
    setImageScanMessage("Simulator code generated.");
  }

  async function decodeSavedImage(file: File) {
    setImageScanMessage("Reading QR/barcode from selected image...");

    if (!window.BarcodeDetector) {
      setImageScanMessage("This browser cannot read QR images automatically. Please type the code from the saved image.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({
        formats: ["qr_code", "ean_13", "code_128", "code_39", "upc_a"]
      });
      const results = await detector.detect(bitmap);
      bitmap.close();

      const detectedCode = results[0]?.rawValue;

      if (!detectedCode) {
        setImageScanMessage("No QR/barcode found in this image. Try a clearer photo or type the code manually.");
        return;
      }

      setScannedCode(detectedCode.trim().toUpperCase());
      setImageScanMessage("Code loaded from saved image.");
    } catch {
      setImageScanMessage("Could not read this image. Try another photo or enter the code manually.");
    }
  }

  return (
    <PremiumPanel className="max-w-xl">
      <div className="mb-6 rounded-lg bg-charcoal p-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Mobile Scanner</p>
        <h2 className="mt-2 text-2xl font-semibold">Apple ENVY QR / Barcode</h2>
        <p className="mt-2 text-sm text-white/65">Upload a saved QR image from the phone gallery, or enter the code manually.</p>
      </div>

      {state.message ? (
        <div className={`mb-5 rounded-lg border px-4 py-3 text-sm font-semibold ${
          state.ok
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-ruby-900/15 bg-ruby-50 text-ruby-900"
        }`}>
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-4">
        <PremiumInput label="Approved Store">
          <select
            name="storeId"
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
            Saved QR image
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void decodeSavedImage(file);
            }}
            className="w-full rounded-lg border border-ruby-900/15 bg-white px-4 py-3 text-sm"
          />
          <p className="mt-2 text-xs text-charcoal/60">
            Choose an image already saved on the phone. Live camera is not required.
          </p>
          {imageScanMessage ? <p className="mt-2 text-sm font-medium text-ruby-900">{imageScanMessage}</p> : null}
        </div>
        <PremiumInput label="Scanned Code">
          <input
            name="scannedCode"
            required
            value={scannedCode}
            onChange={(event) => setScannedCode(event.target.value)}
            placeholder="ENVY-123456"
            className="field-control font-mono text-lg uppercase tracking-wide"
          />
        </PremiumInput>
        <LuxuryButton
          type="button"
          onClick={fillSimulatedCode}
          className="w-full"
          variant="outline"
        >
          Generate Simulator Code
        </LuxuryButton>
        <LuxuryButton
          disabled={isPending || stores.length === 0}
          className="flex w-full items-center justify-center gap-3 px-6 py-5 text-lg"
        >
          <ScanLine size={26} />
          {isPending ? "Saving..." : "SCAN"}
        </LuxuryButton>
      </form>
    </PremiumPanel>
  );
}
