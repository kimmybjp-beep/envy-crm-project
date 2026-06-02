import Link from "next/link";
import { Apple, LogIn, Store } from "lucide-react";

export function BrandShell({
  children,
  eyebrow,
  title,
  subtitle
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ruby-900/10 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/register" className="flex items-center gap-3 font-semibold tracking-wide text-ruby-900">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ruby-900 text-champagne shadow-luxury">
              <Apple size={22} />
            </span>
            <span className="leading-tight">
              <span className="block">Apple ENVY</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-charcoal/45">CRM</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full border border-ruby-900/10 bg-white px-1.5 py-1 text-xs font-semibold text-ruby-900 shadow-sm sm:gap-2 sm:text-sm">
            <Link className="inline-flex items-center gap-1.5 rounded-full bg-ruby-900 px-3 py-2 text-white transition hover:bg-ruby-700" href="/login">
              <LogIn size={15} />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-ruby-50" href="/register">
              <Store size={15} />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-10">
        <div className="mb-8">
          {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-champagne">{eyebrow}</p> : null}
          <h1 className="text-3xl font-semibold text-charcoal sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-3 max-w-3xl text-base text-charcoal/70">{subtitle}</p> : null}
        </div>
        {children}
      </section>
    </main>
  );
}
