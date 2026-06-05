import Link from "next/link";
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
      <PremiumPanel className="max-w-md">
        <MessageBanner message={message} />
        <form action={storeLoginAction} className="space-y-5">
          <PremiumInput label="Phone number">
            <input name="phone" required placeholder="08x-xxx-xxxx" className="field-control" />
          </PremiumInput>
          <PremiumInput label="Password">
            <input name="password" type="password" required minLength={8} placeholder="Store password" className="field-control" />
          </PremiumInput>
          <LuxuryButton className="w-full py-4">Login</LuxuryButton>
        </form>
        <div className="mt-6 rounded-3xl border border-ruby-900/10 bg-ruby-50/70 p-5">
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
    </BrandShell>
  );
}
