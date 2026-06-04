"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, X } from "lucide-react";
import type { AdminMessage } from "@/lib/types";

export function AdminMessagePopup({ message }: { message: AdminMessage | null }) {
  const storageKey = useMemo(
    () => message ? `envy-admin-message-seen-${message.id}` : "",
    [message]
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!message || !storageKey) return;

    const hasSeenMessage = window.sessionStorage.getItem(storageKey) === "1";
    setIsOpen(!hasSeenMessage);
  }, [message, storageKey]);

  if (!message || !isOpen) return null;

  function closePopup() {
    if (storageKey) window.sessionStorage.setItem(storageKey, "1");
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(101,0,19,.28)] ring-1 ring-ruby-900/10">
        <div className="relative bg-gradient-to-br from-ruby-950 via-ruby-900 to-ruby-700 px-6 py-6 text-white">
          <button
            type="button"
            onClick={closePopup}
            aria-label="Close admin message"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/20"
          >
            <X size={20} />
          </button>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ruby-900 shadow-lg">
            <Megaphone size={24} />
          </span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-champagne">
            ENVY Reward Notice
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight">ข้อความจาก Admin</h2>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="whitespace-pre-wrap text-lg font-bold leading-relaxed text-charcoal">
            {message.message}
          </p>
          <button
            type="button"
            onClick={closePopup}
            className="w-full rounded-2xl bg-ruby-900 px-5 py-4 text-base font-black text-white shadow-[0_16px_36px_rgba(169,0,31,.24)]"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}
