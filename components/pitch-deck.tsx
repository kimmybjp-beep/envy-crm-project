import type { ReactNode } from "react";
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

type PitchDeckContent = {
  slides: Array<{ id: string; label: string }>;
  languageLink: { href: string; label: string };
  hero: {
    kicker: string;
    title: string;
    text: string;
    startCta: string;
    dashboardCta: string;
    objectiveKicker: string;
    objectiveText: string;
    metrics: Array<{ value: string; label: string }>;
  };
  problem: {
    kicker: string;
    title: string;
    text: string;
    cards: Array<{ title: string; text: string }>;
  };
  flow: {
    kicker: string;
    title: string;
    text: string;
    steps: Array<{ icon: ReactNode; title: string; text: string }>;
  };
  demo: {
    kicker: string;
    title: string;
    text: string;
    steps: string[];
    phoneKicker: string;
    storeName: string;
    pointsLabel: string;
    actions: string[];
  };
  control: {
    kicker: string;
    title: string;
    text: string;
    cards: Array<{ icon: ReactNode; title: string; text: string }>;
  };
  dashboard: {
    kicker: string;
    title: string;
    text: string;
    cards: Array<{ label: string; value: string; text: string }>;
    treeKicker: string;
    treeTitle: string;
    rows: Array<{ source: string; middle: string; target: string; tone?: "gold" | "red" | "blue" }>;
  };
  rollout: {
    kicker: string;
    title: string;
    text: string;
    steps: string[];
    outcomeKicker: string;
    outcomes: string[];
    registerCta: string;
    qrCta: string;
  };
};

const englishSlides = [
  { id: "hero", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "flow", label: "Flow" },
  { id: "demo", label: "Demo" },
  { id: "control", label: "Control" },
  { id: "dashboard", label: "Dashboard" },
  { id: "rollout", label: "Rollout" }
];

const thaiSlides = [
  { id: "hero", label: "ภาพรวม" },
  { id: "problem", label: "ปัญหา" },
  { id: "flow", label: "แนวทาง" },
  { id: "demo", label: "เดโม" },
  { id: "control", label: "ควบคุม" },
  { id: "dashboard", label: "ข้อมูล" },
  { id: "rollout", label: "ทดลองใช้" }
];

export const englishPitchContent: PitchDeckContent = {
  slides: englishSlides,
  languageLink: { href: "/pitch-th", label: "TH" },
  hero: {
    kicker: "ENVY Reward CRM",
    title: "QR tracking that turns store activity into market data.",
    text: "A field-ready CRM for downstream store mapping, distributor stock visibility, focus product performance, reward campaigns, and executive reporting.",
    startCta: "Start presentation",
    dashboardCta: "Open live dashboard",
    objectiveKicker: "Business Objective",
    objectiveText: "Build downstream market visibility, understand focus product performance, and create a direct communication channel with Tier 2/Tier 3 stores.",
    metrics: [
      { value: "Tier 2/3", label: "Store database" },
      { value: "SKU", label: "Focus tracking" },
      { value: "CSV", label: "Export ready" }
    ]
  },
  problem: {
    kicker: "The Problem",
    title: "T&G does not have enough visibility after distributor handoff.",
    text: "The real business gap is downstream market visibility: who the Tier 2/Tier 3 stores are, where ENVY cartons go, how focus products perform, and how T&G can communicate directly with the trade.",
    cards: [
      {
        title: "No Tier 2 / Tier 3 Store Database",
        text: "T&G does not have a structured database of downstream wholesalers, sub-distributors, and retail stores in the market."
      },
      {
        title: "Unknown Product Movement After Distributor",
        text: "After product is delivered to distributors, T&G cannot clearly see which stores receive cartons or how far the stock spreads."
      },
      {
        title: "No Focus Product Performance Data",
        text: "For growth priorities such as Large Size Apple, T&G cannot identify which stores or areas sell well, sell slowly, or need sales support."
      },
      {
        title: "No Direct Tier 2 Communication Channel",
        text: "T&G has limited direct contact with Tier 2 stores, making campaigns, training, rewards, and market feedback harder to manage."
      }
    ]
  },
  flow: {
    kicker: "Solution Flow",
    title: "Use rewards and QR stickers to turn downstream trade activity into usable data.",
    text: "The QR program is not the original problem; it is the data capture mechanism that motivates stores to register, scan, earn points, and give T&G visibility into the market.",
    steps: [
      {
        icon: <Factory size={24} />,
        title: "T&G Supply",
        text: "ENVY cartons are released with campaign rules, QR batches, apple size, and point settings."
      },
      {
        icon: <Boxes size={24} />,
        title: "Distributor QC",
        text: "Distributor checks quality and applies QR stickers by apple size and campaign."
      },
      {
        icon: <Truck size={24} />,
        title: "Wholesale Handoff",
        text: "Goods move from Distributor to wholesale stores with registration and scan instructions."
      },
      {
        icon: <QrCode size={24} />,
        title: "Store Scan",
        text: "Store scans create proof of location, product focus, campaign activity, and reward points."
      },
      {
        icon: <Gift size={24} />,
        title: "Reward CRM",
        text: "T&G sees store participation, product movement, reward demand, and market development signals."
      }
    ]
  },
  demo: {
    kicker: "Live Demo Journey",
    title: "Register, approve, scan, earn, redeem.",
    text: "This is the story to show in the room: a real store joins the campaign, Admin approves it, and scan activity becomes measurable market and reward data.",
    steps: [
      "Register store with phone, province, storefront photo, and location.",
      "Admin reviews the store record and approves the account.",
      "Approved store scans the ENVY QR sticker from the carton.",
      "Points update instantly after a valid scan.",
      "Store redeems rewards and Admin closes fulfillment."
    ],
    phoneKicker: "Store Home",
    storeName: "Somchai Fruit",
    pointsLabel: "Current points",
    actions: ["Scan QR", "Redeem rewards", "Admin message"]
  },
  control: {
    kicker: "Control Layer",
    title: "Data capture is controlled, approved, and protected.",
    text: "After the QR reward program launches, the system protects data quality through approval controls, password support, duplicate blocking, and fraud alerts.",
    cards: [
      { icon: <ClipboardCheck />, title: "Store Approval", text: "Review storefront photo, province, phone number, and store details." },
      { icon: <LockKeyhole />, title: "Password Reset", text: "Admin verifies store identity before resetting a password." },
      { icon: <ShieldAlert />, title: "Duplicate Block", text: "Same-tier duplicate scans are rejected and logged." },
      { icon: <MapPinned />, title: "Fraud Review", text: "Suspicious scan patterns are surfaced for field follow-up." }
    ]
  },
  dashboard: {
    kicker: "Dashboard & Reporting",
    title: "Management gets live filters, sales tree flow, and exportable reports.",
    text: "Filter by day, week, month, tier, distributor, apple size, and campaign. Export the same data for Excel, Google Sheets, or business review decks.",
    cards: [
      { label: "Store Database", value: "Tier 2/3", text: "Build a structured downstream store database by province and trade layer." },
      { label: "Product Movement", value: "Trace", text: "See where cartons move after distributor handoff through store scan activity." },
      { label: "Focus Product", value: "Large Size", text: "Identify which stores or areas respond well to strategic apple sizes." },
      { label: "Reports", value: "CSV", text: "Export data for Excel, Google Sheets, and review decks." }
    ],
    treeKicker: "Sales Tree Flow",
    treeTitle: "Distributor to Tier 2 to Tier 3",
    rows: [
      { source: "T&G", middle: "Distributor A", target: "Size 24 / Jumbo Bonus" },
      { source: "Distributor A", middle: "Wholesale Store A", target: "Tier 2 first scan", tone: "red" },
      { source: "Wholesale Store A", middle: "Retail Store B", target: "Tier 3 second scan", tone: "blue" }
    ]
  },
  rollout: {
    kicker: "Pilot Rollout",
    title: "Start small, prove adoption, then scale by distributor.",
    text: "A controlled pilot validates distributor process, store onboarding quality, scan behavior, reward cost, and reporting cadence before expanding.",
    steps: [
      "Pilot 1-2 distributors in a focused sales area.",
      "Generate QR stickers by apple size and campaign.",
      "Train distributors and Sales Representatives with store registration guides.",
      "Onboard 20-50 stores and launch the first reward campaign.",
      "Review store database growth, scan rate, focus product movement, reward pending list, and fraud alerts weekly."
    ],
    outcomeKicker: "Expected Outcome",
    outcomes: [
      "A growing Tier 2/Tier 3 store database for market development.",
      "Visibility into where ENVY cartons move beyond the distributor.",
      "Focus product insight for Large Size Apple and campaign SKUs.",
      "Direct communication channel for rewards, training, and trade feedback."
    ],
    registerCta: "Demo Register",
    qrCta: "Demo QR Admin"
  }
};

export const thaiPitchContent: PitchDeckContent = {
  slides: thaiSlides,
  languageLink: { href: "/pitch", label: "EN" },
  hero: {
    kicker: "ENVY Reward CRM",
    title: "ระบบ QR Tracking ที่เปลี่ยนกิจกรรมหน้าร้านให้เป็นข้อมูลตลาดจริง",
    text: "CRM สำหรับเก็บข้อมูลร้านค้าในตลาดปลายทาง ติดตามการกระจายสินค้าหลัง Distributor วิเคราะห์สินค้า Focus ทำแคมเปญสะสมแต้ม และสรุปรายงานให้ผู้บริหาร",
    startCta: "เริ่มดู Presentation",
    dashboardCta: "เปิด Dashboard จริง",
    objectiveKicker: "Business Objective",
    objectiveText: "สร้างฐานข้อมูลร้านค้า Tier 2/Tier 3 เห็นการกระจายสินค้าหลัง Distributor เข้าใจสินค้า Focus และมีช่องทางสื่อสารกลับไปยังร้านค้าในตลาด",
    metrics: [
      { value: "Tier 2/3", label: "ฐานข้อมูลร้านค้า" },
      { value: "SKU", label: "ติดตามสินค้า Focus" },
      { value: "CSV", label: "Export รายงาน" }
    ]
  },
  problem: {
    kicker: "ปัญหาหลัก",
    title: "หลังส่งสินค้าให้ Distributor แล้ว T&G ยังมองตลาดปลายทางไม่ชัด",
    text: "Pain point จริงคือข้อมูลตลาดปลายทางยังไม่ครบ: เราไม่รู้ว่าร้าน Tier 2/Tier 3 คือใครบ้าง สินค้า ENVY ไปอยู่ที่ไหน สินค้า Focus ทำผลงานดีหรือไม่ดีในร้านใด และยังไม่มีช่องทางสื่อสารตรงกับ Tier 2",
    cards: [
      {
        title: "ไม่มีฐานข้อมูลร้านค้า Tier 2 / Tier 3",
        text: "ยังไม่มีฐานข้อมูลที่เป็นระบบของร้านค้าส่ง ร้านค้าช่วงต่อ และร้านค้าปลีกในตลาดจริง"
      },
      {
        title: "ไม่รู้ว่าสินค้าหลัง Distributor ไปอยู่ที่ไหน",
        text: "เมื่อส่งสินค้าให้ Distributor แล้ว T&G ยังไม่เห็นชัดว่าสินค้าถูกกระจายไปถึงร้านใด พื้นที่ใด และลึกแค่ไหน"
      },
      {
        title: "ไม่มีข้อมูลสินค้า Focus เช่น Large Size Apple",
        text: "ยังไม่รู้ว่าร้านไหนหรือพื้นที่ไหนขาย Large Size ได้ดี ขายช้า หรือควรได้รับการสนับสนุนจากทีมขาย"
      },
      {
        title: "ยังไม่มีช่องทางสื่อสารตรงถึง Tier 2",
        text: "การสื่อสารแคมเปญ โปรโมชั่น คู่มือสินค้า หรือ feedback จากตลาด ยังต้องพึ่งช่องทางอ้อมเป็นหลัก"
      }
    ]
  },
  flow: {
    kicker: "Solution Flow",
    title: "ใช้ Reward และ QR Sticker เป็นเครื่องมือเก็บข้อมูลตลาดปลายทาง",
    text: "QR ไม่ใช่ปัญหาเดิม แต่เป็นกลไกที่ทำให้ร้านค้ายอมลงทะเบียน สแกน สะสมแต้ม และทำให้ T&G ได้ข้อมูลร้านค้า สินค้า และพื้นที่ขายกลับมา",
    steps: [
      {
        icon: <Factory size={24} />,
        title: "T&G Supply",
        text: "ปล่อยสินค้า ENVY พร้อมเงื่อนไขแคมเปญ QR batch ขนาดแอปเปิ้ล และแต้มสะสม"
      },
      {
        icon: <Boxes size={24} />,
        title: "Distributor QC",
        text: "Distributor ตรวจสอบคุณภาพ และติด QR sticker ตาม size และ campaign ที่กำหนด"
      },
      {
        icon: <Truck size={24} />,
        title: "ส่งต่อสู่ร้านค้า",
        text: "สินค้าเดินทางจาก Distributor ไปยังร้านค้าส่ง พร้อมคู่มือลงทะเบียนและการสแกน"
      },
      {
        icon: <QrCode size={24} />,
        title: "ร้านค้าสแกน QR",
        text: "การสแกนสร้างข้อมูลตำแหน่งร้านค้า สินค้า Focus แคมเปญ และแต้มสะสม"
      },
      {
        icon: <Gift size={24} />,
        title: "Reward CRM",
        text: "T&G เห็นร้านที่เข้าร่วม การกระจายสินค้า ความต้องการของรางวัล และสัญญาณพัฒนาตลาด"
      }
    ]
  },
  demo: {
    kicker: "Demo Journey",
    title: "สมัครร้าน อนุมัติ สแกน ได้แต้ม แลกของรางวัล",
    text: "นี่คือ flow ที่ใช้เล่าให้เห็นภาพ: ร้านค้าลงทะเบียน Admin อนุมัติ จากนั้นทุก scan จะกลายเป็นทั้งแต้มสะสมและข้อมูลตลาดให้ T&G",
    steps: [
      "ร้านค้าลงทะเบียนด้วยเบอร์โทร จังหวัด รูปหน้าร้าน และพิกัด",
      "Admin ตรวจสอบข้อมูลร้านและกดอนุมัติบัญชี",
      "ร้านที่อนุมัติแล้วสแกน QR sticker บนลัง ENVY",
      "ระบบอัปเดตแต้มทันทีเมื่อ scan ถูกต้อง",
      "ร้านค้าแลกของรางวัล และ Admin จัดการ fulfillment"
    ],
    phoneKicker: "หน้าร้านค้า",
    storeName: "ร้านสมชายผลไม้",
    pointsLabel: "แต้มสะสม",
    actions: ["สแกน QR", "แลกของรางวัล", "ข้อความจาก Admin"]
  },
  control: {
    kicker: "Control Layer",
    title: "ข้อมูลที่เก็บได้ต้องถูกอนุมัติ ตรวจสอบ และป้องกันการซ้ำ",
    text: "เมื่อเริ่มใช้ QR Reward ระบบจะช่วยคุมคุณภาพข้อมูลผ่านการอนุมัติร้านค้า การช่วย reset password การกัน scan ซ้ำ และ alert ให้ Admin ตรวจสอบพฤติกรรมผิดปกติ",
    cards: [
      { icon: <ClipboardCheck />, title: "อนุมัติร้านค้า", text: "ตรวจรูปหน้าร้าน จังหวัด เบอร์โทร และรายละเอียดร้านก่อนให้ใช้งาน" },
      { icon: <LockKeyhole />, title: "Reset Password", text: "Admin ตรวจสอบตัวตนร้านค้าก่อนตั้งรหัสผ่านใหม่" },
      { icon: <ShieldAlert />, title: "กัน Scan ซ้ำ", text: "ถ้า scan ซ้ำใน tier เดียวกัน ระบบจะไม่ให้บันทึกซ้ำ" },
      { icon: <MapPinned />, title: "Fraud Review", text: "พฤติกรรม scan ที่ผิดปกติจะถูกส่งให้ทีมงานตรวจสอบต่อ" }
    ]
  },
  dashboard: {
    kicker: "Dashboard & Reporting",
    title: "ผู้บริหารเห็นข้อมูลร้านค้า สินค้า Focus และ Sales Tree แบบ Export ได้",
    text: "กรองข้อมูลได้ตามวัน สัปดาห์ เดือน tier distributor apple size และ campaign แล้ว export ไปใช้ต่อใน Excel, Google Sheets หรือ business review ได้",
    cards: [
      { label: "ฐานข้อมูลร้านค้า", value: "Tier 2/3", text: "สร้างฐานข้อมูลร้านค้าปลายทางตามจังหวัดและระดับของร้านค้า" },
      { label: "การกระจายสินค้า", value: "Trace", text: "เห็นว่าสินค้าไปต่อที่ร้านใดหลังออกจาก Distributor" },
      { label: "สินค้า Focus", value: "Large Size", text: "รู้ว่าร้านหรือพื้นที่ใดตอบสนองกับ size/campaign ที่ต้องการเติบโต" },
      { label: "รายงาน", value: "CSV", text: "Export เพื่อเปิดใน Excel, Google Sheets และทำรายงานผู้บริหาร" }
    ],
    treeKicker: "Sales Tree Flow",
    treeTitle: "Distributor ไป Tier 2 ไป Tier 3",
    rows: [
      { source: "T&G", middle: "Distributor A", target: "Size 24 / Jumbo Bonus" },
      { source: "Distributor A", middle: "ร้านค้าส่ง A", target: "Tier 2 first scan", tone: "red" },
      { source: "ร้านค้าส่ง A", middle: "ร้านค้าปลีก B", target: "Tier 3 second scan", tone: "blue" }
    ]
  },
  rollout: {
    kicker: "Pilot Rollout",
    title: "เริ่มจากพื้นที่เล็ก พิสูจน์การใช้งาน แล้วค่อยขยายตาม Distributor",
    text: "Pilot แบบควบคุมจะช่วยตรวจสอบ process ของ Distributor คุณภาพการสมัครร้าน พฤติกรรมการ scan ต้นทุน reward และรูปแบบรายงานก่อนขยายจริง",
    steps: [
      "เลือก Distributor 1-2 รายในพื้นที่ขายที่ต้องการทดลอง",
      "สร้าง QR sticker ตาม apple size และ campaign",
      "สอน Distributor และ Sales Representative ด้วยคู่มือลงทะเบียนร้านค้า",
      "Onboard ร้านค้า 20-50 ร้าน และเริ่ม reward campaign แรก",
      "รีวิวรายสัปดาห์: จำนวนร้านใหม่ scan rate สินค้า Focus รายการแลกรางวัล และ fraud alert"
    ],
    outcomeKicker: "Expected Outcome",
    outcomes: [
      "ได้ฐานข้อมูลร้าน Tier 2/Tier 3 เพื่อใช้พัฒนาตลาด",
      "เห็นว่าสินค้า ENVY หลัง Distributor ถูกกระจายไปที่ใด",
      "มี insight ของสินค้า Focus เช่น Large Size Apple และ campaign SKU",
      "มีช่องทางสื่อสารกับร้านค้าเพื่อ reward training และ feedback จากตลาด"
    ],
    registerCta: "Demo สมัครร้าน",
    qrCta: "Demo QR Admin"
  }
};

export function PitchDeck({ content }: { content: PitchDeckContent }) {
  return (
    <main className="pitch-page" style={{ color: charcoal }}>
      <PitchScrollEffects />
      <PitchDots slides={content.slides} />

      <header className="pitch-header sticky top-0 z-30 border-b border-white/10 bg-[#8b0018]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-white no-underline">
            <EnvyLogo tone="light" />
          </Link>
          <nav className="hidden flex-wrap items-center gap-2 text-xs font-black uppercase text-white/80 md:flex">
            {content.slides.slice(1).map((slide) => (
              <a key={slide.id} href={`#${slide.id}`} className="rounded-full border border-white/12 bg-white/10 px-3 py-2 no-underline transition hover:bg-white/18">
                {slide.label}
              </a>
            ))}
            <Link href={content.languageLink.href} className="rounded-full bg-white px-3 py-2 text-[#8b0018] no-underline">
              {content.languageLink.label}
            </Link>
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
              <p className="mt-8 text-xs font-black uppercase text-[#f5d58c]">{content.hero.kicker}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.92] sm:text-6xl lg:text-7xl">
                {content.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/80">
                {content.hero.text}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#flow" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#7a0016] no-underline shadow-xl">
                  {content.hero.startCta} <ArrowRight size={18} />
                </a>
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-black text-white no-underline">
                  {content.hero.dashboardCta}
                </Link>
              </div>
            </div>

            <div className="grid content-end gap-4">
              <div className="pitch-glass-card rounded-[30px] border border-white/15 bg-[#151313]/75 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase text-[#f5d58c]">{content.hero.objectiveKicker}</p>
                <p className="mt-3 text-2xl font-black leading-tight">{content.hero.objectiveText}</p>
              </div>
              <div className="pitch-stagger grid gap-3 sm:grid-cols-3">
                {content.hero.metrics.map((metric) => (
                  <MiniMetric key={metric.label} {...metric} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <SlideHeading tone="ruby" {...content.problem} />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-2">
            {content.problem.cards.map((card) => (
              <ProblemCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section id="flow" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading tone="light" {...content.flow} />
          <div className="pitch-stagger mt-8 grid gap-4 lg:grid-cols-5">
            {content.flow.steps.map((step, index) => (
              <FlowCard key={step.title} total={content.flow.steps.length} index={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section id="demo" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <SlideHeading tone="ruby" kicker={content.demo.kicker} title={content.demo.title} text={content.demo.text} />
              <div className="pitch-stagger mt-7 grid gap-3">
                {content.demo.steps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-[#650013]/10 bg-[#fff8fa] p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b50022] text-sm font-black text-white">{index + 1}</span>
                    <p className="m-0 font-bold text-[#151313]/80">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pitch-phone-demo mx-auto w-full max-w-sm rounded-[34px] border-[10px] border-[#151313] bg-[#fff1f4] p-5 shadow-[0_35px_90px_rgba(84,0,15,.22)]">
              <div className="rounded-[24px] bg-[#b50022] p-5 text-white">
                <EnvyLogo tone="light" />
                <p className="mt-6 text-xs font-black uppercase text-[#f5d58c]">{content.demo.phoneKicker}</p>
                <h3 className="mt-2 text-3xl font-black">{content.demo.storeName}</h3>
                <p className="mt-1 text-white/70">{content.demo.pointsLabel}</p>
                <p className="mt-2 text-6xl font-black">240</p>
              </div>
              <div className="pitch-stagger mt-4 grid gap-3">
                <PhoneAction icon={<QrCode size={22} />} title={content.demo.actions[0]} />
                <PhoneAction icon={<Gift size={22} />} title={content.demo.actions[1]} />
                <PhoneAction icon={<BellRing size={22} />} title={content.demo.actions[2]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="control" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading tone="light" {...content.control} />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {content.control.cards.map((card) => (
              <ControlCard key={card.title} {...card} dark />
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <SlideHeading tone="ruby" kicker={content.dashboard.kicker} title={content.dashboard.title} text={content.dashboard.text} />
              <div className="pitch-stagger mt-7 grid gap-3 sm:grid-cols-2">
                {content.dashboard.cards.map((card) => (
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
                  <p className="m-0 mt-5 text-xs font-black uppercase text-white/50">{content.dashboard.treeKicker}</p>
                  <h3 className="m-0 mt-2 text-2xl font-black">{content.dashboard.treeTitle}</h3>
                </div>
                <LineChart color={champagne} size={34} />
              </div>
              <div className="pitch-stagger mt-7 grid gap-4">
                {content.dashboard.rows.map((row) => (
                  <TreeRow key={`${row.source}-${row.middle}-${row.target}`} {...row} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rollout" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <div className="grid gap-8 lg:grid-cols-[1fr_.88fr]">
            <div>
              <SlideHeading tone="light" kicker={content.rollout.kicker} title={content.rollout.title} text={content.rollout.text} />
              <div className="pitch-stagger mt-7 grid gap-3">
                {content.rollout.steps.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
                    <CheckCircle2 className="shrink-0 text-[#f5d58c]" size={22} />
                    <p className="m-0 font-bold text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-6 text-[#151313] shadow-[0_28px_90px_rgba(21,19,19,.24)]">
              <EnvyLogo tone="ruby" />
              <p className="m-0 mt-8 text-xs font-black uppercase" style={{ color: ruby }}>{content.rollout.outcomeKicker}</p>
              <div className="pitch-stagger mt-6 grid gap-3">
                {content.rollout.outcomes.map((item) => (
                  <div key={item} className="rounded-2xl bg-[#fff1f4] p-4 font-bold leading-7 text-[#151313]/80">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#b50022] px-5 py-4 font-black text-white no-underline">
                  {content.rollout.registerCta}
                </Link>
                <Link href="/admin/qr-generator" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#151313] px-5 py-4 font-black text-white no-underline">
                  {content.rollout.qrCta}
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
      <p className="m-0 mt-8 text-xs font-black uppercase" style={{ color: isLight ? champagne : ruby }}>
        {kicker}
      </p>
      <h2 className="m-0 mt-3 text-4xl font-black leading-[0.98] sm:text-5xl lg:text-6xl" style={{ color: isLight ? "white" : charcoal }}>
        {title}
      </h2>
      <p className="m-0 mt-5 max-w-3xl text-base font-semibold leading-8 sm:text-lg" style={{ color: isLight ? "rgba(255,255,255,.78)" : "rgba(21,19,19,.66)" }}>
        {text}
      </p>
    </div>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <p className="m-0 text-2xl font-black text-white">{value}</p>
      <p className="m-0 mt-1 text-xs font-bold uppercase text-white/60">{label}</p>
    </div>
  );
}

function ProblemCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="pitch-flow-card rounded-[26px] border border-[#650013]/10 bg-[#fff8fa] p-5">
      <p className="m-0 text-xl font-black text-[#b50022]">{title}</p>
      <p className="m-0 mt-3 text-sm font-semibold leading-6 text-[#151313]/65">{text}</p>
    </div>
  );
}

function FlowCard({ icon, index, total, title, text }: { icon: ReactNode; index: number; total: number; title: string; text: string }) {
  return (
    <div className="pitch-flow-card relative rounded-[26px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#b50022]">
          {icon}
        </span>
        <span className="font-mono text-sm font-black text-white/40">0{index}</span>
      </div>
      <h3 className="m-0 mt-6 text-xl font-black">{title}</h3>
      <p className="m-0 mt-3 text-sm leading-6 text-white/70">{text}</p>
      {index < total ? <ArrowRight className="absolute -right-3 top-1/2 hidden rounded-full bg-[#f5d58c] p-1 text-[#650013] lg:block" size={28} /> : null}
    </div>
  );
}

function PhoneAction({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 font-black text-[#54000f] shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#54000f] text-white">{icon}</span>
      {title}
    </div>
  );
}

function ControlCard({ icon, title, text, dark = false }: { icon: ReactNode; title: string; text: string; dark?: boolean }) {
  return (
    <div className={`pitch-control-card rounded-[26px] p-5 ${dark ? "border border-white/10 bg-white/10 text-white" : "bg-white text-[#151313] ring-1 ring-[#650013]/10"}`}>
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${dark ? "bg-white text-[#b50022]" : "bg-[#fff1f4] text-[#b50022]"}`}>{icon}</span>
      <h3 className="m-0 mt-5 text-xl font-black">{title}</h3>
      <p className={`m-0 mt-3 text-sm leading-6 ${dark ? "text-white/70" : "text-[#151313]/65"}`}>{text}</p>
    </div>
  );
}

function TreeRow({ source, middle, target, tone = "gold" }: { source: string; middle: string; target: string; tone?: "gold" | "red" | "blue" }) {
  const color = tone === "blue" ? "#60a5fa" : tone === "red" ? "#fb7185" : "#f5d58c";

  return (
    <div className="pitch-tree-row grid items-center gap-3 text-sm font-black sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <span className="rounded-2xl bg-white/10 px-4 py-3 text-white/80">{source}</span>
      <ArrowRight className="hidden sm:block" color={color} size={20} />
      <span className="rounded-2xl bg-white/10 px-4 py-3 text-white/80">{middle}</span>
      <ArrowRight className="hidden sm:block" color={color} size={20} />
      <span className="rounded-2xl px-4 py-3" style={{ background: `${color}22`, color }}>{target}</span>
    </div>
  );
}
