import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Gift,
  LineChart,
  LockKeyhole,
  MapPinned,
  QrCode,
  ShieldAlert,
  Sparkles,
  Truck
} from "lucide-react";
import { PitchScrollEffects } from "@/components/pitch-scroll-effects";

const ruby = "#b50022";
const charcoal = "#151313";
const champagne = "#d9b76f";
const envyImage =
  "https://www.supermarketperimeter.com/ext/resources/2023/11/03/Envy-Supermarket-Perimeter-Video-Image-1200x800.001.jpeg?height=418&t=1698993146&width=800";

const slides = [
  { id: "hero", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "flow", label: "Flow" },
  { id: "demo", label: "Demo" },
  { id: "control", label: "Control" },
  { id: "dashboard", label: "Dashboard" },
  { id: "rollout", label: "Rollout" }
];

const flowSteps = [
  {
    icon: <Factory size={24} />,
    title: "T&G Supply",
    text: "ENVY cartons are released with campaign rules, QR batches, and point settings."
  },
  {
    icon: <Boxes size={24} />,
    title: "Distributor QC",
    text: "Distributor checks quality and applies QR stickers by apple size and color."
  },
  {
    icon: <Truck size={24} />,
    title: "Wholesale Handoff",
    text: "Goods move from Distributor to wholesale partners with scan instructions."
  },
  {
    icon: <QrCode size={24} />,
    title: "Store Scan",
    text: "First and second valid scans create the sales tree from Tier 2 to Tier 3."
  },
  {
    icon: <Gift size={24} />,
    title: "Reward CRM",
    text: "Stores collect points, redeem rewards, and Back Office manages fulfillment."
  }
];

const demoSteps = [
  "Register store with phone, province, storefront photo, and location.",
  "Admin reviews the store record and approves the account.",
  "Approved store scans the ENVY QR sticker from the carton.",
  "Points update instantly after a valid scan.",
  "Store redeems rewards and Admin closes fulfillment."
];

const dashboardCards = [
  { label: "Approved Stores", value: "Live", text: "Only reviewed stores can scan and collect rewards." },
  { label: "QR Claims", value: "2-layer", text: "Each code can produce Tier 2 and Tier 3 network signals." },
  { label: "Reward Ops", value: "Pending", text: "Open fulfillment requests are visible to Back Office." },
  { label: "Reports", value: "CSV", text: "Export data for Excel, Google Sheets, and review decks." }
];

const outcomes = [
  "Visibility into where ENVY cartons move beyond the distributor.",
  "Higher store engagement through a reward-driven scan habit.",
  "Same-tier duplicate control with fraud alerts for admin review.",
  "Export-ready data for weekly and monthly business reviews."
];

const rolloutSteps = [
  "Pilot 1-2 distributors in a focused sales area.",
  "Generate QR stickers by apple size and campaign.",
  "Train distributors and Sales Representatives with store registration guides.",
  "Onboard 20-50 stores and launch the first reward campaign.",
  "Review scan rate, claim rate, reward pending list, and fraud alerts weekly."
];

export default function PitchPage() {
  return (
    <main className="pitch-page" style={{ color: charcoal }}>
      <PitchScrollEffects />
      <PitchDots slides={slides} />

      <header className="pitch-header sticky top-0 z-30 border-b border-white/10 bg-[#8b0018]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-white no-underline">
            <EnvyLogo tone="light" />
          </Link>
          <nav className="hidden flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-white/82 md:flex">
            {slides.slice(1).map((slide) => (
              <a key={slide.id} href={`#${slide.id}`} className="rounded-full border border-white/12 bg-white/10 px-3 py-2 no-underline transition hover:bg-white/18">
                {slide.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="hero" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal pitch-reveal-zoom">
        <div
          className="pitch-hero pitch-slide-card pitch-slide-card-red overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(84,0,15,.98) 0%, rgba(128,0,24,.9) 46%, rgba(181,0,34,.34) 100%), url("${envyImage}")`,
            backgroundPosition: "center right",
            backgroundSize: "cover"
          }}
        >
          <div className="grid min-h-[72vh] gap-10 px-6 py-9 text-white sm:px-10 sm:py-12 lg:grid-cols-[1.03fr_.97fr] lg:px-12">
            <div className="flex flex-col justify-center">
              <EnvyLogo tone="light" large />
              <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-[#f5d58c]">ENVY Reward CRM</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                QR tracking that turns store activity into reward data.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/82">
                A field-ready CRM for distributor stock movement, store onboarding, scan rewards, fraud control, and executive reporting.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#flow" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#7a0016] no-underline shadow-xl">
                  Start presentation <ArrowRight size={18} />
                </a>
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/10 px-5 py-3 font-black text-white no-underline">
                  Open live dashboard
                </Link>
              </div>
            </div>

            <div className="grid content-end gap-4">
              <div className="pitch-glass-card rounded-[30px] border border-white/14 bg-[#151313]/72 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f5d58c]">Business Objective</p>
                <p className="mt-3 text-2xl font-black leading-tight">See product movement, reward participating stores, and detect abnormal scan behavior.</p>
              </div>
              <div className="pitch-stagger grid gap-3 sm:grid-cols-3">
                <MiniMetric value="2x" label="QR scan layers" />
                <MiniMetric value="09:30" label="LINE daily summary" />
                <MiniMetric value="CSV" label="Export ready" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <SlideHeading
            tone="ruby"
            kicker="The Problem"
            title="After distributor handoff, visibility becomes fragmented."
            text="The current process can move product into the market, but it is hard to see which stores actually receive cartons, which stores participate, and whether duplicate scans are happening."
          />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-2">
            <ProblemCard title="No store-level visibility" text="Movement past distributor level is difficult to confirm without manual follow-up." />
            <ProblemCard title="Low scan motivation" text="Stores need a clear reward reason to participate every time they receive product." />
            <ProblemCard title="Duplicate scan risk" text="The same QR code can create misleading numbers if same-tier duplicates are not blocked." />
            <ProblemCard title="Slow reporting" text="Management needs dashboard and export data without waiting for manual consolidation." />
          </div>
        </div>
      </section>

      <section id="flow" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading
            tone="light"
            kicker="Solution Flow"
            title="T&G to Distributor to Tier 2 to Tier 3, captured through QR activity."
            text="The system follows the real business workflow while keeping the store experience simple: register, get approved, scan, earn, redeem."
          />
          <div className="pitch-stagger mt-8 grid gap-4 lg:grid-cols-5">
            {flowSteps.map((step, index) => (
              <FlowCard key={step.title} index={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section id="demo" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <SlideHeading
                tone="ruby"
                kicker="Live Demo Journey"
                title="Register, approve, scan, earn, redeem."
                text="This is the story to show in the room: a real store joins the campaign, Admin approves it, and scan activity becomes measurable reward data."
              />
              <div className="pitch-stagger mt-7 grid gap-3">
                {demoSteps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-[#650013]/10 bg-[#fff8fa] p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b50022] text-sm font-black text-white">{index + 1}</span>
                    <p className="m-0 font-bold text-[#151313]/78">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pitch-phone-demo mx-auto w-full max-w-sm rounded-[34px] border-[10px] border-[#151313] bg-[#fff1f4] p-5 shadow-[0_35px_90px_rgba(84,0,15,.22)]">
              <div className="rounded-[24px] bg-[#b50022] p-5 text-white">
                <EnvyLogo tone="light" />
                <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#f5d58c]">Store Home</p>
                <h3 className="mt-2 text-3xl font-black">Somchai Fruit</h3>
                <p className="mt-1 text-white/72">Current points</p>
                <p className="mt-2 text-6xl font-black">240</p>
              </div>
              <div className="pitch-stagger mt-4 grid gap-3">
                <PhoneAction icon={<QrCode size={22} />} title="Scan QR" />
                <PhoneAction icon={<Gift size={22} />} title="Redeem rewards" />
                <PhoneAction icon={<BellRing size={22} />} title="Admin message" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="control" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading
            tone="light"
            kicker="Control Layer"
            title="Fraud protection and Back Office approval stay human-controlled."
            text="The system automates checks and alerts, but Admin still owns approval, password resets, reward fulfillment, and suspicious activity review."
          />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ControlCard icon={<ClipboardCheck />} title="Store Approval" text="Review storefront photo, province, phone number, and store details." dark />
            <ControlCard icon={<LockKeyhole />} title="Password Reset" text="Admin verifies store identity before resetting a password." dark />
            <ControlCard icon={<ShieldAlert />} title="Duplicate Block" text="Same-tier duplicate scans are rejected and logged." dark />
            <ControlCard icon={<MapPinned />} title="Fraud Review" text="Suspicious scan patterns are surfaced for field follow-up." dark />
          </div>
        </div>
      </section>

      <section id="dashboard" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <SlideHeading
                tone="ruby"
                kicker="Dashboard & Reporting"
                title="Management gets live filters, sales tree flow, and exportable reports."
                text="Filter by day, week, month, tier, distributor, apple size, and campaign. Export the same data for Excel, Google Sheets, or business review decks."
              />
              <div className="pitch-stagger mt-7 grid gap-3 sm:grid-cols-2">
                {dashboardCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-[#650013]/10 bg-[#fff8fa] p-4">
                    <p className="m-0 text-3xl font-black" style={{ color: ruby }}>{card.value}</p>
                    <p className="m-0 mt-2 font-black">{card.label}</p>
                    <p className="m-0 mt-1 text-sm leading-6 text-[#151313]/60">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pitch-network-panel rounded-[30px] bg-[#171717] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <EnvyLogo tone="light" />
                  <p className="m-0 mt-5 text-xs font-black uppercase tracking-[0.18em] text-white/50">Sales Tree Flow</p>
                  <h3 className="m-0 mt-2 text-2xl font-black">Distributor to Tier 2 to Tier 3</h3>
                </div>
                <LineChart color={champagne} size={34} />
              </div>
              <div className="pitch-stagger mt-7 grid gap-4">
                <TreeRow source="T&G" middle="Distributor A" target="Size 24 / Jumbo Bonus" />
                <TreeRow source="Distributor A" middle="Wholesale Store A" target="Tier 2 first scan" tone="red" />
                <TreeRow source="Wholesale Store A" middle="Retail Store B" target="Tier 3 second scan" tone="blue" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rollout" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <div className="grid gap-8 lg:grid-cols-[1fr_.88fr]">
            <div>
              <SlideHeading
                tone="light"
                kicker="Pilot Rollout"
                title="Start small, prove adoption, then scale by distributor."
                text="A controlled pilot validates distributor process, store onboarding quality, scan behavior, reward cost, and reporting cadence before expanding."
              />
              <div className="pitch-stagger mt-7 grid gap-3">
                {rolloutSteps.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                    <CheckCircle2 className="shrink-0 text-[#f5d58c]" size={22} />
                    <p className="m-0 font-bold text-white/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 text-[#151313] shadow-[0_28px_90px_rgba(21,19,19,.24)]">
              <EnvyLogo tone="ruby" />
              <p className="m-0 mt-8 text-xs font-black uppercase tracking-[0.18em]" style={{ color: ruby }}>Expected Outcome</p>
              <div className="pitch-stagger mt-6 grid gap-3">
                {outcomes.map((item) => (
                  <div key={item} className="rounded-2xl bg-[#fff1f4] p-4 font-bold leading-7 text-[#151313]/76">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#b50022] px-5 py-4 font-black text-white no-underline">
                  Demo Register
                </Link>
                <Link href="/admin/qr-generator" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#151313] px-5 py-4 font-black text-white no-underline">
                  Demo QR Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PitchDots({ slides }: { slides: Array<{ id: string; label: string }> }) {
  return (
    <nav className="pitch-dots" aria-label="Pitch slide navigation">
      {slides.map((slide, index) => (
        <a
          key={slide.id}
          href={`#${slide.id}`}
          className="pitch-dot"
          data-slide-id={slide.id}
          data-label={slide.label}
          aria-label={`Go to ${slide.label}`}
        >
          <span>{index + 1}</span>
        </a>
      ))}
    </nav>
  );
}

function EnvyLogo({ tone, large = false }: { tone: "light" | "ruby"; large?: boolean }) {
  const isLight = tone === "light";

  return (
    <span className={`pitch-envy-logo ${large ? "pitch-envy-logo-large" : ""}`} style={{ color: isLight ? "white" : ruby }}>
      <span
        className="pitch-envy-icon"
        style={{
          background: isLight ? "white" : ruby,
          color: isLight ? ruby : "white"
        }}
      >
        <Sparkles size={large ? 23 : 18} />
      </span>
      <span className="pitch-envy-wordmark">envy</span>
      <span className="pitch-envy-product">Reward CRM</span>
    </span>
  );
}

function SlideHeading({
  tone,
  kicker,
  title,
  text
}: {
  tone: "light" | "ruby";
  kicker: string;
  title: string;
  text: string;
}) {
  const isLight = tone === "light";

  return (
    <div className="max-w-4xl">
      <EnvyLogo tone={tone} />
      <p className="m-0 mt-8 text-xs font-black uppercase tracking-[0.2em]" style={{ color: isLight ? champagne : ruby }}>
        {kicker}
      </p>
      <h2 className="m-0 mt-3 text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl" style={{ color: isLight ? "white" : charcoal }}>
        {title}
      </h2>
      <p className="m-0 mt-5 max-w-3xl text-base font-semibold leading-8 sm:text-lg" style={{ color: isLight ? "rgba(255,255,255,.75)" : "rgba(21,19,19,.66)" }}>
        {text}
      </p>
    </div>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
      <p className="m-0 text-2xl font-black text-white">{value}</p>
      <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/58">{label}</p>
    </div>
  );
}

function ProblemCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="pitch-flow-card rounded-[26px] border border-[#650013]/10 bg-[#fff8fa] p-5">
      <p className="m-0 text-xl font-black text-[#b50022]">{title}</p>
      <p className="m-0 mt-3 text-sm font-semibold leading-6 text-[#151313]/62">{text}</p>
    </div>
  );
}

function FlowCard({ icon, index, title, text }: { icon: React.ReactNode; index: number; title: string; text: string }) {
  return (
    <div className="pitch-flow-card relative rounded-[26px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#b50022]">
          {icon}
        </span>
        <span className="font-mono text-sm font-black text-white/35">0{index}</span>
      </div>
      <h3 className="m-0 mt-6 text-xl font-black">{title}</h3>
      <p className="m-0 mt-3 text-sm leading-6 text-white/66">{text}</p>
      {index < flowSteps.length ? <ArrowRight className="absolute -right-3 top-1/2 hidden rounded-full bg-[#f5d58c] p-1 text-[#650013] lg:block" size={28} /> : null}
    </div>
  );
}

function PhoneAction({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 font-black text-[#54000f] shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#54000f] text-white">{icon}</span>
      {title}
    </div>
  );
}

function ControlCard({ icon, title, text, dark = false }: { icon: React.ReactNode; title: string; text: string; dark?: boolean }) {
  return (
    <div className={`pitch-control-card rounded-[26px] p-5 ${dark ? "border border-white/10 bg-white/10 text-white" : "bg-white text-[#151313] ring-1 ring-[#650013]/10"}`}>
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${dark ? "bg-white text-[#b50022]" : "bg-[#fff1f4] text-[#b50022]"}`}>{icon}</span>
      <h3 className="m-0 mt-5 text-xl font-black">{title}</h3>
      <p className={`m-0 mt-3 text-sm leading-6 ${dark ? "text-white/66" : "text-[#151313]/62"}`}>{text}</p>
    </div>
  );
}

function TreeRow({ source, middle, target, tone = "gold" }: { source: string; middle: string; target: string; tone?: "gold" | "red" | "blue" }) {
  const color = tone === "blue" ? "#60a5fa" : tone === "red" ? "#fb7185" : "#f5d58c";

  return (
    <div className="pitch-tree-row grid items-center gap-3 text-sm font-black sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <span className="rounded-2xl bg-white/8 px-4 py-3 text-white/82">{source}</span>
      <ArrowRight className="hidden sm:block" color={color} size={20} />
      <span className="rounded-2xl bg-white/8 px-4 py-3 text-white/82">{middle}</span>
      <ArrowRight className="hidden sm:block" color={color} size={20} />
      <span className="rounded-2xl px-4 py-3" style={{ background: `${color}22`, color }}>{target}</span>
    </div>
  );
}
