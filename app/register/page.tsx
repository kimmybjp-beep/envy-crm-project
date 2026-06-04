import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { createStoreAction } from "@/app/actions/stores";
import { BrandShell } from "@/components/brand-shell";
import { MessageBanner } from "@/components/message-banner";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";
import { RegistrationSuccessPopup } from "@/components/registration-success-popup";
import { StorefrontCaptureFields } from "@/components/storefront-capture-fields";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <BrandShell
      eyebrow="New Outlet Opening"
      title="สมัครร้าน Apple ENVY"
      subtitle="กรอกข้อมูลร้านเพื่อส่งให้ Back Office ตรวจสอบและอนุมัติ"
    >
      {message === "store-submitted" ? <RegistrationSuccessPopup /> : null}
      {message === "store-already-submitted" ? <RegistrationSuccessPopup variant="duplicate" /> : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <PremiumPanel>
          <div className="mb-6 flex flex-col gap-4 border-b border-ruby-900/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Store Request</p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal">ข้อมูลร้านค้า</h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-champagne/18 px-4 py-2 text-sm font-semibold text-ruby-900">
              <Clock3 size={16} />
              Pending approval
            </span>
          </div>
          <MessageBanner message={message} />
          <form action={createStoreAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <PremiumInput label="ชื่อร้าน">
                <input name="name" required placeholder="ENVY Siam Premium Fruit" className="field-control" />
              </PremiumInput>
              <PremiumInput label="ชื่อเจ้าของร้าน">
                <input name="ownerName" required placeholder="ชื่อ-นามสกุล" className="field-control" />
              </PremiumInput>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PremiumInput label="เบอร์โทร">
                <input name="phone" required placeholder="08x-xxx-xxxx" className="field-control" />
              </PremiumInput>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PremiumInput label="Password">
                <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" className="field-control" />
              </PremiumInput>
              <PremiumInput label="Confirm Password">
                <input name="confirmPassword" type="password" required minLength={8} placeholder="Type password again" className="field-control" />
              </PremiumInput>
            </div>
            <StorefrontCaptureFields />
            <LuxuryButton className="w-full py-4 text-base sm:w-auto sm:px-8">ส่งสมัครร้าน</LuxuryButton>
          </form>
        </PremiumPanel>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-charcoal text-white shadow-luxury">
            <div className="bg-ruby-900 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Apple ENVY</p>
              <h2 className="mt-2 text-2xl font-semibold">ENVY Reward CRM</h2>
            </div>
            <div className="space-y-4 p-6">
              <Feature icon={<ShieldCheck size={18} />} title="Admin approval" text="ร้านใหม่ต้องรออนุมัติก่อนใช้งาน" />
              <Feature icon={<CheckCircle2 size={18} />} title="Point collection" text="สแกนสำเร็จแล้วแต้มร้านเพิ่มอัตโนมัติ" />
            </div>
          </div>
        </aside>
      </div>
    </BrandShell>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-champagne ring-1 ring-white/10">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-white/62">{text}</p>
      </div>
    </div>
  );
}
