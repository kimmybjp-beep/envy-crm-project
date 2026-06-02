import Link from "next/link";
import { Apple, Gift, Home, ScanLine } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

export function SalesShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen bg-[#fff1f4]">
      <header className="bg-gradient-to-br from-[#8b0018] via-[#b30020] to-[#d20b2f] text-white">
        <div className="mx-auto max-w-5xl px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">ENVY Reward CRM</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-sm text-white/75">{subtitle}</p> : null}
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/14 ring-1 ring-white/25">
              <Apple />
            </span>
          </div>
        </div>
      </header>
      <section className="mx-auto -mt-3 max-w-5xl px-5 pb-24">
        {children}
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ruby-900/10 bg-white/92 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-4 text-xs font-bold text-ruby-900">
          <Link className="flex flex-col items-center gap-1 py-3" href="/home"><Home size={19} />Home</Link>
          <Link className="flex flex-col items-center gap-1 py-3" href="/scan"><ScanLine size={19} />Scan</Link>
          <Link className="flex flex-col items-center gap-1 py-3" href="/rewards"><Gift size={19} />Rewards</Link>
          <form action={signOutAction} className="contents">
            <button className="flex flex-col items-center gap-1 py-3 text-ruby-900"><Apple size={19} />Logout</button>
          </form>
        </div>
      </nav>
    </main>
  );
}

export function HeroCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#54000f] via-[#930018] to-[#d20525] p-6 text-white shadow-luxury ring-1 ring-white/30">
      {children}
    </div>
  );
}
