import Link from "next/link";
import { storeLoginAction } from "@/app/actions/auth";
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
          <LuxuryButton className="w-full py-4">Login</LuxuryButton>
        </form>
        <p className="mt-5 text-center text-sm text-charcoal/60">
          ยังไม่มีร้าน? <Link href="/register" className="font-bold text-ruby-900">สมัครร้านใหม่</Link>
        </p>
      </PremiumPanel>
    </BrandShell>
  );
}
