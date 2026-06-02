import Link from "next/link";
import { Apple, ArrowRight, Store } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fff1f4]">
      <section className="mx-auto grid min-h-screen max-w-5xl content-center px-5 py-10">
        <div className="rounded-[32px] bg-gradient-to-br from-[#8b0018] via-[#ba001f] to-[#e00832] p-6 text-white shadow-luxury sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/75">ENVY Field Sales</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">Sales Visit System</h1>
          <div className="mt-8 overflow-hidden rounded-[28px] bg-[#4a000d]/75 p-7 ring-1 ring-white/15">
            <span className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">Field Sales</span>
            <div className="mt-8 flex items-end justify-between gap-6">
              <div>
                <p className="font-serif text-7xl font-black leading-none">envy</p>
                <p className="mt-3 max-w-xs text-lg font-semibold text-white/88">store visit, tracking, rewards, and new outlet opening</p>
              </div>
              <Apple className="hidden text-white/20 sm:block" size={140} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/login" className="rounded-[24px] bg-white p-6 text-charcoal shadow-lg transition hover:-translate-y-0.5">
              <ArrowRight className="mb-5 rounded-2xl bg-ruby-900 p-3 text-white" size={52} />
              <p className="text-xl font-black">เข้าสู่ระบบร้านค้า</p>
              <p className="mt-2 text-sm text-charcoal/60">ร้านที่อนุมัติแล้วเข้า home เพื่อสแกนและดูแต้ม</p>
            </Link>
            <Link href="/register" className="rounded-[24px] bg-white p-6 text-charcoal shadow-lg transition hover:-translate-y-0.5">
              <Store className="mb-5 rounded-2xl bg-ruby-900 p-3 text-white" size={52} />
              <p className="text-xl font-black">สมัครร้านใหม่</p>
              <p className="mt-2 text-sm text-charcoal/60">ส่งข้อมูลร้านเพื่อรอ Back Office อนุมัติ</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
