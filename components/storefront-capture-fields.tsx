"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";

export function StorefrontCaptureFields() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  const photoDataRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (latitudeRef.current) latitudeRef.current.value = String(position.coords.latitude);
        if (longitudeRef.current) longitudeRef.current.value = String(position.coords.longitude);
      },
      () => {
        // Registration still works if the browser denies location permission.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 12000
      }
    );
  }, []);

  return (
    <div className="rounded-lg border border-dashed border-ruby-900/25 bg-ruby-50/40 p-5">
      <input ref={latitudeRef} type="hidden" name="latitude" />
      <input ref={longitudeRef} type="hidden" name="longitude" />
      <input ref={photoDataRef} type="hidden" name="storefrontPhotoDataUrl" />
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ruby-900 text-champagne">
          {hasPhoto ? <CheckCircle2 size={20} /> : <Camera size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-charcoal">รูปหน้าร้าน</p>
          <p className="mt-1 text-sm font-semibold text-ruby-900">*กรุณาถ่ายรูปหน้าร้านที่มีป้ายชื่อร้าน</p>
          <p className="mt-1 text-sm text-charcoal/60">กดปุ่มด้านล่างเพื่อเปิดกล้องมือถือ หรือเลือกรูปจากเครื่อง</p>
          {error ? <p className="mt-2 rounded-lg bg-ruby-50 px-3 py-2 text-sm font-semibold text-ruby-900">{error}</p> : null}

          <label className="mt-4 block cursor-pointer rounded-lg border border-ruby-900/20 bg-white px-4 py-4 text-center font-semibold text-ruby-900 shadow-sm transition hover:bg-ruby-50">
            <Camera className="mr-2 inline-block" size={18} />
            {isProcessing ? "กำลังเตรียมรูป..." : hasPhoto ? "เปลี่ยนรูปหน้าร้าน" : "ถ่ายรูปหน้าร้าน"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              required
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                setError("");
                setHasPhoto(false);
                if (photoDataRef.current) photoDataRef.current.value = "";
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl("");

                if (!file) return;

                try {
                  setIsProcessing(true);
                  const compressed = await compressImage(file);
                  if (photoDataRef.current) photoDataRef.current.value = compressed;
                  setPreviewUrl(compressed);
                  setHasPhoto(true);
                } catch {
                  setError("เตรียมรูปไม่สำเร็จ กรุณาถ่ายหรือเลือกรูปใหม่อีกครั้ง");
                  event.currentTarget.value = "";
                } finally {
                  setIsProcessing(false);
                }
              }}
            />
          </label>

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Storefront preview"
              className="mt-4 max-h-72 w-full rounded-lg object-cover ring-1 ring-ruby-900/15"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      image.onerror = () => reject(new Error("Could not load image"));
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not prepare image"));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
