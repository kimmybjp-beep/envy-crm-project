import { adminLoginAction } from "@/app/actions/auth";
import { MessageBanner } from "@/components/message-banner";
import { LuxuryButton, PremiumInput, PremiumPanel } from "@/components/premium-panel";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-charcoal px-5">
      <PremiumPanel className="w-full max-w-md">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-champagne">ENVY Back Office</p>
        <h1 className="mt-2 text-3xl font-black text-charcoal">Admin Login</h1>
        <p className="mt-2 text-sm text-charcoal/60">Admin area is separated from store users.</p>
        <div className="mt-6">
          <MessageBanner message={message} />
          <form action={adminLoginAction} className="space-y-5">
            <PremiumInput label="Admin password">
              <input name="password" type="password" required className="field-control" />
            </PremiumInput>
            <LuxuryButton className="w-full">Enter Back Office</LuxuryButton>
          </form>
        </div>
      </PremiumPanel>
    </main>
  );
}
