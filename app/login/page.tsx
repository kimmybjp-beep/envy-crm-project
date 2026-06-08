import Link from "next/link";
import { Apple, CheckCircle2, Gift, LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { requestStorePasswordResetAction, storeLoginAction } from "@/app/actions/auth";
import { BrandShell } from "@/components/brand-shell";
import { MessageBanner } from "@/components/message-banner";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <BrandShell
      eyebrow="Store Login"
      title="เข้าสู่ระบบร้านค้า"
      subtitle="ใช้เบอร์โทรร้านที่ได้รับการอนุมัติแล้วเพื่อเข้า Home"
    >
      <section className="mb-7 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8b0018] via-[#ba001f] to-[#e00832] text-white shadow-luxury ring-1 ring-ruby-900/10">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/15">
              <Sparkles size={15} />
              ENVY Reward CRM
            </div>
            <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
              Store Partner Login
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/80">
              เข้าสู่ระบบร้านค้าที่ได้รับอนุมัติ เพื่อสแกน QR สะสมแต้ม ตรวจคะแนน และแลกของรางวัลจากแคมเปญ ENVY
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroPill icon={<ShieldCheck size={18} />} title="Approved only" text="ร้านต้องผ่านอนุมัติก่อน" />
              <HeroPill icon={<LogIn size={18} />} title="Secure login" text="ใช้เบอร์ร้านและรหัสผ่าน" />
              <HeroPill icon={<Gift size={18} />} title="Rewards" text="ดูแต้มและแลกรางวัล" />
            </div>
          </div>

          <div className="rounded-[28px] bg-[#4a000d]/72 p-6 shadow-2xl ring-1 ring-white/15">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ruby-900">
                <Apple size={30} />
              </span>
              <span className="rounded-full bg-champagne px-4 py-2 text-xs font-black uppercase text-ruby-900">
                Partner Access
              </span>
            </div>
            <p className="mt-9 font-serif text-7xl font-black leading-none">envy</p>
            <p className="mt-3 text-lg font-bold leading-7 text-white/80">
              Scan, collect points, and join premium reward campaigns.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
        <PremiumPanel className="rounded-[28px] bg-white/95 p-5 shadow-[0_28px_90px_rgba(61,7,18,.18)] ring-1 ring-ruby-900/10 sm:p-7">
          <div className="mb-6 border-b border-ruby-900/10 pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Store Access</p>
            <h2 className="mt-2 text-2xl font-black text-charcoal">เข้าสู่ระบบร้านค้า</h2>
            <p className="mt-2 text-sm leading-6 text-charcoal/60">ใช้เบอร์โทรร้านและรหัสผ่านที่ตั้งไว้ตอนสมัคร</p>
          </div>
          <MessageBanner message={message} />
          <form action={storeLoginAction} className="space-y-5">
            <PremiumInput label="Phone number">
              <input name="phone" required placeholder="08x-xxx-xxxx" className="field-control" />
            </PremiumInput>
            <PremiumInput label="Password">
              <input name="password" type="password" required minLength={8} placeholder="Store password" className="field-control" />
            </PremiumInput>
            <LuxuryButton className="w-full rounded-2xl py-4 text-base font-black shadow-[0_18px_50px_rgba(123,11,34,.22)]">Login</LuxuryButton>
          </form>
          <div className="mt-6 rounded-3xl border border-ruby-900/10 bg-gradient-to-br from-ruby-50 to-white p-5 shadow-sm">
            <p className="text-lg font-black text-ruby-950">ลืมรหัสผ่าน?</p>
            <p className="mt-1 text-sm leading-6 text-charcoal/60">
              กรอกเบอร์ร้านแล้วส่งคำขอให้ Back Office รีเซ็ตรหัสผ่านให้ ระบบจะไม่เปลี่ยนรหัสทันทีเพื่อความปลอดภัย
            </p>
            <form action={requestStorePasswordResetAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input name="phone" required placeholder="เบอร์โทรร้าน" className="field-control" />
              <button className="rounded-2xl bg-charcoal px-5 py-3 text-sm font-black text-white shadow-lg shadow-ruby-900/10">
                ส่งคำขอ
              </button>
            </form>
          </div>
          <p className="mt-5 text-center text-sm text-charcoal/60">
            ยังไม่มีร้าน? <Link href="/register" className="font-bold text-ruby-900">สมัครร้านใหม่</Link>
          </p>
        </PremiumPanel>

        <aside className="hidden overflow-hidden rounded-[28px] bg-charcoal text-white shadow-luxury ring-1 ring-ruby-900/10 lg:block">
          <div className="bg-gradient-to-br from-ruby-900 via-ruby-700 to-[#e00832] px-7 py-7">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Apple ENVY</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">Premium Reward Access</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">Back Office approves stores before reward activity can begin.</p>
          </div>
          <div className="grid gap-4 p-7">
            <Feature icon={<CheckCircle2 size={18} />} title="Approved store" text="ร้านที่ผ่านการอนุมัติแล้วจะเข้า Home เพื่อสแกนได้" />
            <Feature icon={<Gift size={18} />} title="Reward campaign" text="แต้มจากการสแกนใช้ติดตามแคมเปญและแลกของรางวัล" />
            <Feature icon={<ShieldCheck size={18} />} title="Password reset" text="คำขอรีเซ็ตจะถูกส่งให้ Back Office ตรวจสอบก่อน" />
          </div>
        </aside>
      </div>
    </BrandShell>
  );
}

function HeroPill({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-ruby-900">{icon}</span>
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-white/70">{text}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-champagne ring-1 ring-white/10">{icon}</span>
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/60">{text}</p>
      </div>
    </div>
  );
}
