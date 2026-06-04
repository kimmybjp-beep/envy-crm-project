"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";

export function StorefrontCaptureFields() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);

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
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ruby-900 text-champagne">
          {hasPhoto ? <CheckCircle2 size={20} /> : <Camera size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-charcoal">รูปหน้าร้าน</p>
          <p className="mt-1 text-sm font-semibold text-ruby-900">*กรุณาถ่ายรูปหน้าร้านที่มีป้ายชื่อร้าน</p>
          <p className="mt-1 text-sm text-charcoal/60">กดปุ่มด้านล่างเพื่อเปิดกล้องมือถือ หรือเลือกรูปจากเครื่อง</p>

          <label className="mt-4 block cursor-pointer rounded-lg border border-ruby-900/20 bg-white px-4 py-4 text-center font-semibold text-ruby-900 shadow-sm transition hover:bg-ruby-50">
            <Camera className="mr-2 inline-block" size={18} />
            ถ่ายรูปหน้าร้าน
            <input
              name="storefrontPhoto"
              type="file"
              accept="image/*"
              capture="environment"
              required
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setHasPhoto(Boolean(file));
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(file ? URL.createObjectURL(file) : "");
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
