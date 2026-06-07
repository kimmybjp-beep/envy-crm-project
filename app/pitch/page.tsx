import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Factory,
  Gift,
  LineChart,
  LockKeyhole,
  MapPinned,
  QrCode,
  ShieldAlert,
  Sparkles,
  Store,
  Truck
} from "lucide-react";

const ruby = "#b50022";
const deepRuby = "#54000f";
const charcoal = "#151313";
const champagne = "#d9b76f";
const envyImage =
  "https://www.supermarketperimeter.com/ext/resources/2023/11/03/Envy-Supermarket-Perimeter-Video-Image-1200x800.001.jpeg?height=418&t=1698993146&width=800";

const navItems = [
  ["Flow", "#flow"],
  ["Demo", "#demo"],
  ["Control", "#control"],
  ["Dashboard", "#dashboard"],
  ["Rollout", "#rollout"]
];

const flowSteps = [
  {
    icon: <Factory size={24} />,
    title: "T&G Supply",
    text: "สินค้า Apple ENVY ถูกส่งออกเป็นลัง พร้อม campaign และ reward rule จากบริษัท"
  },
  {
    icon: <Boxes size={24} />,
    title: "Distributor Warehouse",
    text: "Distributor รับสินค้า ตรวจ QC และเตรียมติด sticker QR ตาม size / สี / point"
  },
  {
    icon: <QrCode size={24} />,
    title: "QR Sticker QC",
    text: "QR แต่ละใบถูก generate จากระบบ เก็บ batch, distributor, size, campaign และแต้มใน database"
  },
  {
    icon: <Truck size={24} />,
    title: "Wholesale Network",
    text: "สินค้าไหลจาก Distributor ไป Tier 2 และต่อไป Tier 3 โดยระบบอ่านจากลำดับ scan"
  },
  {
    icon: <Gift size={24} />,
    title: "Reward CRM",
    text: "ร้านสะสมคะแนน แลกของรางวัล และ Back Office ติดตามการทำจ่ายได้"
  }
];

const demoSteps = [
  "Register store with phone, province, storefront photo, and location",
  "Back Office reviews storefront and approves account",
  "Approved store logs in and scans QR on ENVY carton",
  "Points update immediately after valid scan",
  "Store redeems rewards and Admin marks fulfillment"
];

const dashboardCards = [
  { label: "Approved Stores", value: "Live", text: "ร้านที่ใช้งานได้จริงหลังผ่านการตรวจ" },
  { label: "QR Claimed", value: "2-tier", text: "เห็น first scan และ second scan ของ QR เดียวกัน" },
  { label: "Reward Pending", value: "Ops", text: "รายการแลกของที่รอ Back Office ทำจ่าย" },
  { label: "Export Reports", value: "CSV", text: "เปิดต่อใน Excel หรือ Google Sheets ได้ทันที" }
];

const outcomes = [
  "Visibility: เห็นว่าสินค้าไปถึงร้านไหน ไม่จบแค่ขายให้ Distributor",
  "Engagement: ร้านมีเหตุผลในการ scan เพราะได้แต้มและ reward",
  "Fraud Control: ระบบ block scan ซ้ำใน tier เดิม พร้อมส่ง alert ให้ Admin",
  "Management Data: dashboard และ export ช่วยทำ weekly/monthly review ได้"
];

export default function PitchPage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #b50022 0 360px, #fff1f4 360px 100%)", color: charcoal }}>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#8b0018]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-white no-underline">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#8b0018] shadow-lg">
              <Sparkles size={21} />
            </span>
            <span className="leading-tight">
              <b className="block">ENVY Reward CRM</b>
              <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Country Manager Pitch</span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-white/82">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="rounded-full border border-white/12 bg-white/10 px-3 py-2 no-underline transition hover:bg-white/18">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <div
          className="overflow-hidden rounded-[34px] border border-white/18 shadow-[0_32px_90px_rgba(84,0,15,0.28)]"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(84,0,15,.98) 0%, rgba(128,0,24,.88) 44%, rgba(181,0,34,.36) 100%), url("${envyImage}")`,
            backgroundPosition: "center right",
            backgroundSize: "cover"
          }}
        >
          <div className="grid gap-10 px-6 py-9 text-white sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-12">
            <div>
              <span className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#f5d58c] ring-1 ring-white/18">
                Apple ENVY Thailand
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                ENVY Reward CRM & QR Tracking System
              </h1>
              <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/82">
                A field-ready CRM that connects distributor stock movement, store onboarding, QR reward scanning, fraud control, and executive reporting in one premium system.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#demo" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#7a0016] no-underline shadow-xl">
                  View demo flow <ArrowRight size={18} />
                </a>
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/10 px-5 py-3 font-black text-white no-underline">
                  Open live dashboard
                </Link>
              </div>
            </div>

            <div className="grid content-end gap-4">
              <div className="rounded-[28px] border border-white/14 bg-[#151313]/72 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f5d58c]">Business objective</p>
                <p className="mt-3 text-2xl font-black leading-tight">Know where the product goes, reward the stores that participate, and detect abnormal scan behavior.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniMetric value="2x" label="QR scan layers" />
                <MiniMetric value="09:30" label="LINE daily summary" />
                <MiniMetric value="CSV" label="Export ready" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionIntro
          kicker="Supply Chain Flow"
          title="From T&G carton to store reward activity"
          text="The pitch should make the operational journey obvious: goods move physically, QR data moves digitally, and the reward layer motivates stores to participate."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {flowSteps.map((step, index) => (
            <FlowCard key={step.title} index={index + 1} {...step} />
          ))}
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_70px_rgba(101,0,19,.13)] ring-1 ring-[#650013]/10 sm:p-8">
            <SectionIntro
              kicker="Live Demo Journey"
              title="Register, approve, scan, earn, redeem"
              text="This is the simplest narrative for management: a real store joins the program, gets controlled by Back Office, then starts generating measurable scan and reward data."
              compact
            />
            <div className="mt-6 grid gap-3">
              {demoSteps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-[#650013]/10 bg-[#fff8fa] p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b50022] text-sm font-black text-white">{index + 1}</span>
                  <p className="m-0 font-bold text-[#151313]/78">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[28px] bg-[#650013] p-6 text-white shadow-[0_20px_70px_rgba(101,0,19,.2)] sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 text-[#f5d58c]">
                  <ShieldAlert size={25} />
                </span>
                <div>
                  <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-[#f5d58c]">QR Anti-Fraud Logic</p>
                  <h2 className="m-0 mt-1 text-2xl font-black">One QR, two valid network signals</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <LogicCard title="1st Scan" text="Tier 2 first claim earns points and starts the network path." />
                <LogicCard title="2nd Scan" text="Tier 3 second claim is allowed from another approved store." />
                <LogicCard title="Duplicate" text="Same-tier duplicate is blocked and logged as fraud alert." />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_70px_rgba(101,0,19,.13)] ring-1 ring-[#650013]/10 sm:p-8">
              <p className="m-0 text-xs font-black uppercase tracking-[0.18em]" style={{ color: ruby }}>Store screen preview</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <PhoneTile icon={<Store size={24} />} title="Home" text="ชื่อร้านและแต้มสะสม" />
                <PhoneTile icon={<QrCode size={24} />} title="Scan" text="สแกนลัง ENVY เพื่อรับแต้ม" />
                <PhoneTile icon={<Gift size={24} />} title="Rewards" text="แลกของรางวัลจากบริษัท" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="control" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionIntro
          kicker="Admin Control"
          title="Back Office keeps the database clean before stores can scan"
          text="Stores cannot scan immediately after registration. Admin approval, password reset, reward fulfillment, and fraud review stay under T&G control."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ControlCard icon={<ClipboardCheck />} title="Store Approval" text="ตรวจรูปหน้าร้าน จังหวัด เบอร์โทร และอนุมัติร้านที่ถูกต้อง" />
          <ControlCard icon={<LockKeyhole />} title="Password Reset" text="ร้านลืมรหัสผ่านส่งคำขอให้ Back Office reset แบบมีคนตรวจ" />
          <ControlCard icon={<BellRing />} title="LINE Alerts" text="สรุป daily operation และแจ้งรายการที่ควร follow up ทุก 09:30" />
          <ControlCard icon={<MapPinned />} title="Fraud Review" text="scan ซ้ำหรือ pattern ผิดปกติถูก log เพื่อให้ทีมตรวจสอบ" />
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-[32px] bg-white p-5 shadow-[0_24px_80px_rgba(101,0,19,.14)] ring-1 ring-[#650013]/10 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <SectionIntro
                kicker="Dashboard & Export"
                title="Country-level visibility without waiting for manual reports"
                text="Management can filter by day, week, month, tier, distributor, apple size, and campaign. Data can be exported for Excel, Google Sheets, or weekly review decks."
                compact
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {dashboardCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-[#650013]/10 bg-[#fff8fa] p-4">
                    <p className="m-0 text-3xl font-black" style={{ color: ruby }}>{card.value}</p>
                    <p className="m-0 mt-2 font-black">{card.label}</p>
                    <p className="m-0 mt-1 text-sm leading-6 text-[#151313]/60">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[26px] bg-[#171717] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-white/50">Sales Tree Flow</p>
                  <h3 className="m-0 mt-2 text-2xl font-black">Distributor to Tier 2 to Tier 3</h3>
                </div>
                <LineChart color={champagne} size={34} />
              </div>
              <div className="mt-7 grid gap-4">
                <TreeRow source="T&G" middle="Distributor A" target="Size 24 / Jumbo Bonus" />
                <TreeRow source="Distributor A" middle="ร้านค้าส่ง เจริญผล" target="Tier 2 first scan" tone="red" />
                <TreeRow source="ร้านค้าส่ง เจริญผล" middle="ร้านปลีก นำโชค" target="Tier 3 second scan" tone="blue" />
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="m-0 text-sm leading-6 text-white/68">
                  Export-ready reports include stores, scans, QR batches, QR claims, rewards, redemptions, and fraud alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rollout" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
          <div className="rounded-[32px] bg-[#650013] p-6 text-white shadow-[0_24px_80px_rgba(101,0,19,.18)] sm:p-8">
            <SectionIntro
              kicker="Pilot Rollout Plan"
              title="Start small, prove adoption, then expand by distributor"
              text="A controlled pilot lets T&G validate distributor process, store onboarding quality, scan behavior, reward costs, and reporting cadence before scaling."
              compact
              inverted
            />
            <div className="mt-6 grid gap-3">
              {[
                "Select 1-2 distributors and target province or sales area",
                "Generate first QR sticker batch by apple size and campaign",
                "Train Distributor team and Sales Resp with registration guide",
                "Onboard 20-50 stores, approve accounts, then start scan campaign",
                "Review weekly: scan rate, claim rate, reward pending, fraud alerts"
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                  <CheckCircle2 className="shrink-0 text-[#f5d58c]" size={22} />
                  <p className="m-0 font-bold text-white/82">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(101,0,19,.14)] ring-1 ring-[#650013]/10 sm:p-8">
            <p className="m-0 text-xs font-black uppercase tracking-[0.18em]" style={{ color: ruby }}>Expected Outcome</p>
            <h2 className="m-0 mt-3 text-3xl font-black leading-tight">What Country Manager should remember</h2>
            <div className="mt-6 grid gap-3">
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
      </section>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-[#650013]/10 bg-white/78 p-5 text-sm font-bold text-[#151313]/62">
          <span>ENVY Reward CRM - Premium fruit trade visibility platform</span>
          <span className="inline-flex items-center gap-2"><Database size={16} /> Supabase + Next.js + LINE Summary</span>
        </div>
      </footer>
    </main>
  );
}

function SectionIntro({
  kicker,
  title,
  text,
  compact = false,
  inverted = false
}: {
  kicker: string;
  title: string;
  text: string;
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <div>
      <p className="m-0 text-xs font-black uppercase tracking-[0.18em]" style={{ color: inverted ? champagne : ruby }}>
        {kicker}
      </p>
      <h2 className={`m-0 mt-3 font-black leading-tight ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`} style={{ color: inverted ? "white" : charcoal }}>
        {title}
      </h2>
      <p className="m-0 mt-4 max-w-3xl text-base leading-7" style={{ color: inverted ? "rgba(255,255,255,.72)" : "rgba(21,19,19,.66)" }}>
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

function FlowCard({ icon, index, title, text }: { icon: React.ReactNode; index: number; title: string; text: string }) {
  return (
    <div className="relative rounded-[26px] bg-white p-5 shadow-[0_18px_60px_rgba(101,0,19,.12)] ring-1 ring-[#650013]/10">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: index === 1 ? deepRuby : ruby }}>
          {icon}
        </span>
        <span className="font-mono text-sm font-black text-[#151313]/24">0{index}</span>
      </div>
      <h3 className="m-0 mt-6 text-xl font-black">{title}</h3>
      <p className="m-0 mt-3 text-sm leading-6 text-[#151313]/62">{text}</p>
      {index < flowSteps.length ? <ArrowRight className="absolute -right-3 top-1/2 hidden rounded-full bg-[#fff1f4] p-1 text-[#b50022] lg:block" size={28} /> : null}
    </div>
  );
}

function LogicCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
      <p className="m-0 text-lg font-black text-white">{title}</p>
      <p className="m-0 mt-2 text-sm leading-6 text-white/64">{text}</p>
    </div>
  );
}

function PhoneTile({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-[#650013]/10 bg-white p-4 shadow-sm">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#54000f] text-white">{icon}</span>
      <p className="m-0 mt-4 text-xl font-black">{title}</p>
      <p className="m-0 mt-2 text-sm leading-6 text-[#151313]/60">{text}</p>
    </div>
  );
}

function ControlCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_18px_60px_rgba(101,0,19,.12)] ring-1 ring-[#650013]/10">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff1f4] text-[#b50022]">{icon}</span>
      <h3 className="m-0 mt-5 text-xl font-black">{title}</h3>
      <p className="m-0 mt-3 text-sm leading-6 text-[#151313]/62">{text}</p>
    </div>
  );
}

function TreeRow({ source, middle, target, tone = "gold" }: { source: string; middle: string; target: string; tone?: "gold" | "red" | "blue" }) {
  const color = tone === "blue" ? "#60a5fa" : tone === "red" ? "#fb7185" : "#f5d58c";

  return (
    <div className="grid items-center gap-3 text-sm font-black sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <span className="rounded-2xl bg-white/8 px-4 py-3 text-white/82">{source}</span>
      <ArrowRight className="hidden sm:block" color={color} size={20} />
      <span className="rounded-2xl bg-white/8 px-4 py-3 text-white/82">{middle}</span>
      <ArrowRight className="hidden sm:block" color={color} size={20} />
      <span className="rounded-2xl px-4 py-3" style={{ background: `${color}22`, color }}>{target}</span>
    </div>
  );
}
