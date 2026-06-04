"use client";

import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";

export function RegistrationSuccessPopup({
  variant = "submitted"
}: {
  variant?: "submitted" | "duplicate";
}) {
  const isDuplicate = variant === "duplicate";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(101,0,19,.28)] ring-1 ring-ruby-900/10">
        <div className="bg-gradient-to-br from-ruby-950 via-ruby-900 to-ruby-700 px-6 py-7 text-white">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ruby-900 shadow-lg">
            {isDuplicate ? <Clock3 size={28} /> : <CheckCircle2 size={30} />}
          </span>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-champagne">
            ENVY Reward CRM
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight">
            {isDuplicate ? "ร้านนี้ลงทะเบียนไว้แล้ว" : "ลงทะเบียนร้านเรียบร้อย"}
          </h2>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-lg font-bold leading-relaxed text-charcoal">
            {isDuplicate
              ? "ระบบพบเบอร์โทรนี้ในรายการสมัครแล้ว โปรดรอ Back Office ตรวจสอบและอนุมัติ"
              : "โปรดรออนุมัติจาก Back Office ก่อนเริ่มใช้งานและสแกนสะสมแต้ม"}
          </p>
          <div className="rounded-2xl bg-ruby-50 px-4 py-3 text-sm font-semibold text-ruby-900">
            หลังอนุมัติแล้ว ร้านค้าจะใช้เบอร์โทรและรหัสผ่านที่ตั้งไว้เพื่อ Login เข้าระบบ
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="rounded-2xl border border-ruby-900/15 px-5 py-4 text-center font-black text-ruby-900"
            >
              กลับหน้าแรก
            </Link>
            <Link
              href="/login"
              className="rounded-2xl bg-ruby-900 px-5 py-4 text-center font-black text-white shadow-[0_16px_36px_rgba(169,0,31,.24)]"
            >
              ไปหน้า Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
