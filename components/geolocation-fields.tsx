"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export function GeolocationFields() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [status, setStatus] = useState("GPS not captured");

  function captureLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not available on this device.");
      return;
    }

    setStatus("Capturing GPS...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setStatus("GPS captured");
      },
      () => setStatus("GPS permission denied or unavailable."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  return (
    <div className="rounded-lg border border-ruby-900/10 bg-ruby-50/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-charcoal">Store GPS coordinates</p>
          <p className="text-sm text-charcoal/65">{status}</p>
        </div>
        <button type="button" onClick={captureLocation} className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-charcoal/90">
          <MapPin size={16} />
          Capture
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-charcoal/75">Latitude</span>
          <input name="latitude" value={latitude} readOnly required className="field-control" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-charcoal/75">Longitude</span>
          <input name="longitude" value={longitude} readOnly required className="field-control" />
        </label>
      </div>
    </div>
  );
}
