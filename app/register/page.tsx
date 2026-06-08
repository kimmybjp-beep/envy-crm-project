import { Apple, CheckCircle2, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { createStoreAction } from "@/app/actions/stores";
import { BrandShell } from "@/components/brand-shell";
import { MessageBanner } from "@/components/message-banner";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";
import { RegistrationSuccessPopup } from "@/components/registration-success-popup";
import { StorefrontCaptureFields } from "@/components/storefront-capture-fields";

const thaiProvinces = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
  "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร",
  "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก",
  "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์",
  "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี",
  "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา",
  "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี",
  "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
  "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร",
  "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร",
  "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี",
  "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง",
  "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

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

      <section className="mb-7 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8b0018] via-[#ba001f] to-[#e00832] text-white shadow-luxury ring-1 ring-ruby-900/10">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/15">
              <Sparkles size={15} />
              ENVY Partner Club
            </div>
            <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
              Apple ENVY Store Registration
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/80">
              สมัครร้านค้าเพื่อเข้าร่วม ENVY Reward CRM สแกนสะสมแต้ม แลกรางวัล และรับข่าวสารจาก Back Office
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroPill label="1" text="กรอกข้อมูลร้าน" />
              <HeroPill label="2" text="ถ่ายรูปหน้าร้าน" />
              <HeroPill label="3" text="รออนุมัติ" />
            </div>
          </div>

          <div className="rounded-[28px] bg-[#4a000d]/72 p-6 shadow-2xl ring-1 ring-white/15">
            <div className="flex items-center justify-between gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-ruby-900">
                <Apple size={30} />
              </span>
              <span className="rounded-full bg-champagne px-4 py-2 text-xs font-black uppercase text-ruby-900">
                Premium Outlet
              </span>
            </div>
            <p className="mt-9 font-serif text-7xl font-black leading-none">envy</p>
            <p className="mt-3 text-lg font-bold leading-7 text-white/80">
              Register once, wait for approval, then start earning campaign points.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <PremiumPanel className="rounded-[28px] bg-white/95 p-5 shadow-[0_28px_90px_rgba(61,7,18,.18)] ring-1 ring-ruby-900/10 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 border-b border-ruby-900/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne">Store Request</p>
              <h2 className="mt-2 text-2xl font-semibold text-charcoal">ข้อมูลร้านค้า</h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ruby-50 px-4 py-2 text-sm font-black text-ruby-900 ring-1 ring-ruby-900/10">
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
              <PremiumInput label="จังหวัด">
                <select name="province" required defaultValue="" className="field-control">
                  <option value="" disabled>เลือกจังหวัด</option>
                  {thaiProvinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
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
            <LuxuryButton className="w-full rounded-2xl py-4 text-base font-black shadow-[0_18px_50px_rgba(123,11,34,.22)] sm:w-auto sm:px-8">ส่งสมัครร้าน</LuxuryButton>
          </form>
        </PremiumPanel>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[28px] bg-charcoal text-white shadow-luxury ring-1 ring-ruby-900/10">
            <div className="bg-gradient-to-br from-ruby-900 via-ruby-700 to-[#e00832] px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-champagne">Apple ENVY</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">ENVY Reward CRM</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/75">Premium reward campaign for approved stores.</p>
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

function HeroPill({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <p className="text-sm font-black text-champagne">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{text}</p>
    </div>
  );
}
