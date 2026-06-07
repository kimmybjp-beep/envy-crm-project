import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Gift,
  LineChart,
  Megaphone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  Truck
} from "lucide-react";
import { PitchScrollEffects } from "@/components/pitch-scroll-effects";

const ruby = "#b50022";
const charcoal = "#151313";
const champagne = "#d9b76f";
const forest = "#153d33";
const purple = "#2b183f";
const envyImage =
  "https://www.supermarketperimeter.com/ext/resources/2023/11/03/Envy-Supermarket-Perimeter-Video-Image-1200x800.001.jpeg?height=418&t=1698993146&width=800";

type IconCard = {
  icon: ReactNode;
  title: string;
  text: string;
};

type PitchDeckContent = {
  slides: Array<{ id: string; label: string }>;
  languageLink: { href: string; label: string };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    text: string;
    startCta: string;
    dashboardCta: string;
    objectiveKicker: string;
    objectiveText: string;
    metrics: Array<{ value: string; label: string }>;
  };
  gap: {
    kicker: string;
    title: string;
    text: string;
    cards: Array<{ title: string; text: string }>;
  };
  flow: {
    kicker: string;
    title: string;
    text: string;
    steps: IconCard[];
  };
  hooks: {
    kicker: string;
    title: string;
    text: string;
    disclaimer: string;
    cards: Array<{
      accent: "gold" | "purple";
      highlight: string;
      title: string;
      subtitle: string;
      text: string;
    }>;
  };
  journey: {
    kicker: string;
    title: string;
    text: string;
    steps: string[];
    phoneKicker: string;
    storeName: string;
    pointsLabel: string;
    actions: string[];
  };
  governance: {
    kicker: string;
    title: string;
    text: string;
    note: string;
    cards: IconCard[];
  };
  dashboard: {
    kicker: string;
    title: string;
    text: string;
    cards: Array<{ label: string; value: string; text: string }>;
    panelKicker: string;
    panelTitle: string;
    rows: Array<{ source: string; middle: string; target: string; tone?: "gold" | "red" | "blue" }>;
  };
  pilot: {
    kicker: string;
    title: string;
    text: string;
    weeks: Array<{ week: string; title: string; bullets: string[] }>;
    outcomeKicker: string;
    outcome: string;
  };
  support: {
    kicker: string;
    title: string;
    text: string;
    items: Array<{ title: string; text: string }>;
    registerCta: string;
    qrCta: string;
  };
};

const englishSlides = [
  { id: "hero", label: "Overview" },
  { id: "gap", label: "Gap" },
  { id: "flow", label: "Flow" },
  { id: "hooks", label: "Hooks" },
  { id: "journey", label: "Journey" },
  { id: "governance", label: "Rules" },
  { id: "dashboard", label: "Dashboard" },
  { id: "pilot", label: "Pilot" },
  { id: "support", label: "Support" }
];

const thaiSlides = [
  { id: "hero", label: "ภาพรวม" },
  { id: "gap", label: "ช่องว่าง" },
  { id: "flow", label: "โฟลว์" },
  { id: "hooks", label: "แคมเปญ" },
  { id: "journey", label: "ร้านค้า" },
  { id: "governance", label: "กติกา" },
  { id: "dashboard", label: "ข้อมูล" },
  { id: "pilot", label: "Pilot" },
  { id: "support", label: "Support" }
];

export const englishPitchContent: PitchDeckContent = {
  slides: englishSlides,
  languageLink: { href: "/pitch-th", label: "TH" },
  hero: {
    kicker: "GT Commercial Campaign Proposal",
    title: "ENVY Partner Club",
    subtitle: "A GT reward campaign to activate Tier 2 and Tier 3 outlets.",
    text: "Build downstream visibility, reward participating stores, and create demand signals while sales remain through distributors.",
    startCta: "View Campaign Flow",
    dashboardCta: "Open Live Dashboard",
    objectiveKicker: "Core Positioning",
    objectiveText: "We keep sales through distributors, but use rewards to make the downstream market visible and active.",
    metrics: [
      { value: "GT", label: "Market activation" },
      { value: "Tier 2/3", label: "Outlet visibility" },
      { value: "Size 24", label: "Growth trigger" }
    ]
  },
  gap: {
    kicker: "The Commercial Gap",
    title: "After distributor handoff, T&G has limited visibility into the real GT market.",
    text: "The current distributor-led model moves product into the market, but T&G has limited visibility into which Tier 2 and Tier 3 outlets receive ENVY, which outlet type can move each size, and where activation should be focused.",
    cards: [
      {
        title: "Limited downstream visibility",
        text: "We do not clearly know which outlets receive ENVY after distributor handoff."
      },
      {
        title: "Size 24 movement risk",
        text: "Larger sizes need stronger market triggers to reduce aging risk."
      },
      {
        title: "Weak Tier 2 / Tier 3 activation",
        text: "GT outlets are not yet systematically mapped, segmented, or activated."
      },
      {
        title: "Manual market learning",
        text: "Field visits collect information, but the data needs to become actionable market intelligence."
      }
    ]
  },
  flow: {
    kicker: "Business Flow",
    title: "Business flow stays the same. Rewards add visibility.",
    text: "T&G does not change the distributor model. Distributors continue selling and fulfilling orders, while ENVY Partner Club gives outlets a reason to identify themselves through scan-and-reward participation.",
    steps: [
      {
        icon: <Factory size={24} />,
        title: "T&G creates campaign",
        text: "Define campaign objective, eligible sizes, reward mechanics, and target outlet behavior."
      },
      {
        icon: <Boxes size={24} />,
        title: "Distributor applies QR after QC",
        text: "Distributors keep normal fulfillment while applying campaign QR stickers after quality check."
      },
      {
        icon: <QrCode size={24} />,
        title: "Tier 2 / Tier 3 joins rewards",
        text: "Outlets scan to participate, earn points, and join campaign reward opportunities."
      },
      {
        icon: <BarChart3 size={24} />,
        title: "T&G sees active outlets",
        text: "Participation reveals outlet type, location, size movement, and campaign response."
      },
      {
        icon: <Truck size={24} />,
        title: "Reorder stays through distributor",
        text: "Sales reps activate high-potential outlets while commercial flow remains distributor-led."
      }
    ]
  },
  hooks: {
    kicker: "Campaign Hooks",
    title: "Campaign hooks that make outlets want to join.",
    text: "Do not sell the system. Sell the benefit: a simple Partner Club campaign that gives GT outlets a reason to participate every time they receive ENVY.",
    disclaimer: "Campaign mechanics and rewards are subject to management approval.",
    cards: [
      {
        accent: "gold",
        highlight: "Gold Reward Campaign",
        title: "ขาย Envy ลุ้นทองคำ",
        subtitle: "For Tier 2 / Wholesale Partners",
        text: "Every participating carton scan earns points and lucky draw chances. Size 24 can receive bonus points to help accelerate movement."
      },
      {
        accent: "purple",
        highlight: "Premium Outlet Campaign",
        title: "สแกน Envy ลุ้น iPhone",
        subtitle: "For Tier 3 / Retail Outlets",
        text: "Retail outlets scan carton QR codes, collect points, and earn lucky draw chances for premium rewards."
      }
    ]
  },
  journey: {
    kicker: "Store Participation",
    title: "How stores join and participate.",
    text: "The store journey must stay simple: register once, scan every time they receive ENVY, and see points update immediately.",
    steps: [
      "Register store",
      "Back Office approves",
      "Scan QR on carton",
      "Earn points / lucky draw chances",
      "Redeem rewards or join prize draw"
    ],
    phoneKicker: "Partner Club Home",
    storeName: "Somchai Fruit",
    pointsLabel: "Current points",
    actions: ["Scan carton", "View rewards", "Admin message"]
  },
  governance: {
    kicker: "Campaign Governance",
    title: "Simple governance & scan rules.",
    text: "Control exists to protect campaign cost and reward fairness. The rules should be simple enough for stores and strong enough for Back Office.",
    note: "Governance protects reward cost, claim fairness, and management confidence.",
    cards: [
      { icon: <ClipboardCheck />, title: "Approved stores only", text: "Stores must be approved before points become active." },
      { icon: <ShieldCheck />, title: "One QR claim rule", text: "Each QR can be claimed only once per eligible campaign rule." },
      { icon: <Megaphone />, title: "Suspicious scan alert", text: "Unusual scan patterns are flagged for Back Office review." }
    ]
  },
  dashboard: {
    kicker: "Commercial Dashboard",
    title: "Management can see where ENVY is moving and which outlets should be activated next.",
    text: "The dashboard helps T&G decide where to focus sales reps, which outlets to activate, which sizes need support, and which distributors are generating participation.",
    cards: [
      { label: "Active outlets", value: "By distributor", text: "See which distributors generate downstream participation." },
      { label: "Scan rate", value: "By size", text: "Understand which apple sizes are moving and where support is needed." },
      { label: "GT layer", value: "Tier 2 vs Tier 3", text: "Separate wholesaler and retail outlet participation." },
      { label: "Size 24 signal", value: "Movement", text: "Identify if the large-size campaign is creating market pull." },
      { label: "Sales follow-up", value: "Top outlets", text: "Prioritize stores that show participation and growth potential." },
      { label: "Campaign liability", value: "Reward cost", text: "Track cost exposure from points and reward claims." }
    ],
    panelKicker: "Commercial Signal Flow",
    panelTitle: "Campaign data becomes sales action",
    rows: [
      { source: "Distributor A", middle: "Active Tier 2", target: "Size 24 scan signal" },
      { source: "Sales Team", middle: "Top outlet list", target: "Activation visit", tone: "red" },
      { source: "Trade Marketing", middle: "Reward budget", target: "Campaign decision", tone: "blue" }
    ]
  },
  pilot: {
    kicker: "30-Day Pilot Plan",
    title: "Start with a focused pilot before scaling.",
    text: "A 30-day pilot lets T&G validate campaign mechanics, distributor process, outlet response, Size 24 movement, and reward cost before a wider rollout.",
    weeks: [
      {
        week: "Week 1",
        title: "Setup",
        bullets: ["Finalize campaign rules", "Generate size-based QR stickers", "Prepare distributor instruction sheet"]
      },
      {
        week: "Week 2",
        title: "Launch",
        bullets: ["Train 1-2 cooperative distributors", "Start with Size 24 plus one fast-moving size"]
      },
      {
        week: "Week 3",
        title: "Activate",
        bullets: ["Sales reps onboard target Tier 2 and Tier 3 outlets", "Explain scan-to-earn mechanics"]
      },
      {
        week: "Week 4",
        title: "Review",
        bullets: ["Review scan rate, approved outlets, repeat scans, Size 24 movement, reward cost, and outlet feedback"]
      }
    ],
    outcomeKicker: "Expected Outcome",
    outcome: "T&G gains GT visibility, outlet participation data, and activation priorities without changing the distributor-only sales direction."
  },
  support: {
    kicker: "Support Needed",
    title: "What we need to launch the pilot.",
    text: "To make ENVY Partner Club operational, the commercial team only needs two launch supports before distributor rollout.",
    items: [
      {
        title: "Prepare QR codes by our site",
        text: "Use the ENVY CRM site to generate size-based campaign QR stickers and distributor batch records."
      },
      {
        title: "CRM Reward Budget",
        text: "Work with Trade Marketing to define reward budget, lucky draw mechanics, point cost, and approval rules."
      }
    ],
    registerCta: "Demo Store Register",
    qrCta: "Generate QR Batch"
  }
};

export const thaiPitchContent: PitchDeckContent = {
  slides: thaiSlides,
  languageLink: { href: "/pitch", label: "EN" },
  hero: {
    kicker: "GT Commercial Campaign Proposal",
    title: "ENVY Partner Club",
    subtitle: "แคมเปญสะสมแต้มสำหรับกระตุ้นร้าน Tier 2 และ Tier 3",
    text: "สร้าง visibility ในตลาดปลายทาง ให้รางวัลร้านที่เข้าร่วม และสร้าง demand signal โดยที่ยอดขายและ reorder ยังเดินผ่าน Distributor เหมือนเดิม",
    startCta: "ดู Campaign Flow",
    dashboardCta: "เปิด Live Dashboard",
    objectiveKicker: "Core Positioning",
    objectiveText: "เรายังคงขายผ่าน Distributor แต่ใช้ Reward Campaign ทำให้ตลาดปลายทางมองเห็นได้และ active มากขึ้น",
    metrics: [
      { value: "GT", label: "Market activation" },
      { value: "Tier 2/3", label: "Outlet visibility" },
      { value: "Size 24", label: "Growth trigger" }
    ]
  },
  gap: {
    kicker: "The Commercial Gap",
    title: "หลังส่งสินค้าให้ Distributor แล้ว T&G ยังมอง GT market ปลายทางได้ไม่ชัด",
    text: "โมเดลปัจจุบันช่วยส่งสินค้าเข้าสู่ตลาดได้ แต่ T&G ยังมองไม่ชัดว่าร้าน Tier 2 และ Tier 3 ใดได้รับ ENVY, ร้านแบบไหนขยับแต่ละ size ได้ดี และควรโฟกัส activation ที่จุดไหน",
    cards: [
      {
        title: "Limited downstream visibility",
        text: "ยังไม่รู้ชัดว่าหลัง Distributor ส่งต่อแล้ว ENVY ไปถึง outlet ใดบ้าง"
      },
      {
        title: "Size 24 movement risk",
        text: "แอปเปิ้ล size ใหญ่ต้องมี market trigger ที่แรงพอ เพื่อลดความเสี่ยงสินค้า aging"
      },
      {
        title: "Weak Tier 2 / Tier 3 activation",
        text: "ร้าน GT ยังไม่ได้ถูก map, segment และ activate อย่างเป็นระบบ"
      },
      {
        title: "Manual market learning",
        text: "ทีมขายเก็บข้อมูลจาก field visit อยู่แล้ว แต่ข้อมูลต้องถูกเปลี่ยนเป็น market intelligence ที่ใช้งานต่อได้"
      }
    ]
  },
  flow: {
    kicker: "Business Flow",
    title: "Business flow เหมือนเดิม แต่ Reward ช่วยเพิ่ม visibility",
    text: "T&G ไม่ต้องเปลี่ยน distributor model. Distributor ยังขายและ fulfill order เหมือนเดิม แต่ ENVY Partner Club ทำให้ร้านปลายทางมีเหตุผลที่จะระบุตัวตนผ่านการ scan-and-reward participation",
    steps: [
      {
        icon: <Factory size={24} />,
        title: "T&G creates campaign",
        text: "กำหนด objective ของแคมเปญ size ที่เข้าร่วม กลไกรางวัล และพฤติกรรมร้านค้าที่ต้องการ"
      },
      {
        icon: <Boxes size={24} />,
        title: "Distributor applies QR after QC",
        text: "Distributor ยัง fulfill ตามปกติ และติด QR sticker หลัง QC ตาม campaign ที่กำหนด"
      },
      {
        icon: <QrCode size={24} />,
        title: "Tier 2 / Tier 3 joins rewards",
        text: "ร้านค้า scan เพื่อเข้าร่วม รับแต้ม และมีสิทธิ์ลุ้นรางวัลจากแคมเปญ"
      },
      {
        icon: <BarChart3 size={24} />,
        title: "T&G sees active outlets",
        text: "ข้อมูล participation ทำให้เห็นประเภท outlet พื้นที่ size movement และ campaign response"
      },
      {
        icon: <Truck size={24} />,
        title: "Reorder stays through distributor",
        text: "Sales activate ร้านที่มีศักยภาพ โดย commercial flow ยังคงผ่าน Distributor"
      }
    ]
  },
  hooks: {
    kicker: "Campaign Hooks",
    title: "Campaign hook ที่ทำให้ร้านอยากเข้าร่วม",
    text: "เราไม่ได้ขายระบบให้ร้านค้า แต่ขายประโยชน์ของ Partner Club: ร้าน scan แล้วได้แต้ม มีสิทธิ์ลุ้นรางวัล และอยากร่วมทุกครั้งที่รับ ENVY",
    disclaimer: "รายละเอียดกลไกแคมเปญและของรางวัลขึ้นอยู่กับการอนุมัติของ Management",
    cards: [
      {
        accent: "gold",
        highlight: "Gold Reward Campaign",
        title: "ขาย Envy ลุ้นทองคำ",
        subtitle: "สำหรับ Tier 2 / Wholesale Partners",
        text: "ทุก carton scan ที่เข้าร่วมจะสะสมแต้มและสิทธิ์ลุ้นรางวัล โดย Size 24 สามารถให้ bonus points เพื่อช่วยเร่งการระบายสินค้า"
      },
      {
        accent: "purple",
        highlight: "Premium Outlet Campaign",
        title: "สแกน Envy ลุ้น iPhone",
        subtitle: "สำหรับ Tier 3 / Retail Outlets",
        text: "ร้านค้าปลีก scan QR บนลัง ENVY เพื่อสะสมแต้ม และได้รับสิทธิ์ลุ้นรางวัล premium campaign"
      }
    ]
  },
  journey: {
    kicker: "Store Participation",
    title: "ร้านค้าเข้าร่วมอย่างไร",
    text: "Journey ต้องง่ายที่สุด: สมัครครั้งเดียว, scan ทุกครั้งที่ได้รับ ENVY, แล้วเห็นแต้ม update ทันที",
    steps: [
      "Register store",
      "Back Office approves",
      "Scan QR on carton",
      "Earn points / lucky draw chances",
      "Redeem rewards or join prize draw"
    ],
    phoneKicker: "Partner Club Home",
    storeName: "ร้านสมชายผลไม้",
    pointsLabel: "แต้มสะสม",
    actions: ["Scan carton", "View rewards", "Admin message"]
  },
  governance: {
    kicker: "Campaign Governance",
    title: "กติกา scan ต้องง่าย และปกป้องต้นทุนแคมเปญ",
    text: "Control มีไว้เพื่อปกป้อง campaign cost และความยุติธรรมของ reward โดยร้านค้าเข้าใจง่าย และ Back Office ตรวจสอบได้",
    note: "Governance ช่วยคุม reward cost, claim fairness และความมั่นใจของผู้บริหาร",
    cards: [
      { icon: <ClipboardCheck />, title: "Approved stores only", text: "ร้านค้าต้องได้รับอนุมัติก่อน แต้มจึงจะ active" },
      { icon: <ShieldCheck />, title: "One QR claim rule", text: "QR แต่ละใบ claim ได้ตามกติกา campaign ที่กำหนดเท่านั้น" },
      { icon: <Megaphone />, title: "Suspicious scan alert", text: "รูปแบบ scan ที่ผิดปกติจะถูกแจ้งให้ Back Office review" }
    ]
  },
  dashboard: {
    kicker: "Commercial Dashboard",
    title: "Management เห็นว่า ENVY ไปอยู่ที่ไหน และ outlet ใดควร activate ต่อ",
    text: "Dashboard ช่วยให้ T&G ตัดสินใจว่าจะให้ sales reps โฟกัสที่ไหน, outlet ใดควร activate, size ใดต้อง support และ distributor ใดสร้าง participation ได้ดี",
    cards: [
      { label: "Active outlets", value: "By distributor", text: "เห็นว่า Distributor ใดสร้าง downstream participation ได้" },
      { label: "Scan rate", value: "By size", text: "เข้าใจว่า apple size ใดขยับดี และจุดไหนต้อง support" },
      { label: "GT layer", value: "Tier 2 vs Tier 3", text: "แยก participation ของร้านค้าส่งและร้านค้าปลีก" },
      { label: "Size 24 signal", value: "Movement", text: "ดูว่า campaign size ใหญ่เริ่มสร้าง market pull ได้หรือไม่" },
      { label: "Sales follow-up", value: "Top outlets", text: "จัดลำดับร้านค้าที่ควรให้ทีมขายเข้าไป activate ต่อ" },
      { label: "Campaign liability", value: "Reward cost", text: "ติดตามต้นทุนจากแต้มและการ claim ของรางวัล" }
    ],
    panelKicker: "Commercial Signal Flow",
    panelTitle: "Campaign data becomes sales action",
    rows: [
      { source: "Distributor A", middle: "Active Tier 2", target: "Size 24 scan signal" },
      { source: "Sales Team", middle: "Top outlet list", target: "Activation visit", tone: "red" },
      { source: "Trade Marketing", middle: "Reward budget", target: "Campaign decision", tone: "blue" }
    ]
  },
  pilot: {
    kicker: "30-Day Pilot Plan",
    title: "เริ่ม pilot 30 วัน ก่อนขยายจริง",
    text: "Pilot 30 วันช่วย validate campaign mechanics, distributor process, outlet response, Size 24 movement และ reward cost ก่อน rollout ใหญ่",
    weeks: [
      {
        week: "Week 1",
        title: "Setup",
        bullets: ["Finalize campaign rules", "Generate size-based QR stickers", "Prepare distributor instruction sheet"]
      },
      {
        week: "Week 2",
        title: "Launch",
        bullets: ["Train 1-2 cooperative distributors", "Start with Size 24 plus one fast-moving size"]
      },
      {
        week: "Week 3",
        title: "Activate",
        bullets: ["Sales reps onboard target Tier 2 and Tier 3 outlets", "Explain scan-to-earn mechanics"]
      },
      {
        week: "Week 4",
        title: "Review",
        bullets: ["Review scan rate, approved outlets, repeat scans, Size 24 movement, reward cost, and outlet feedback"]
      }
    ],
    outcomeKicker: "Expected Outcome",
    outcome: "T&G ได้ GT visibility, outlet participation data และ activation priorities โดยไม่เปลี่ยนทิศทาง distributor-only sales"
  },
  support: {
    kicker: "Support Needed",
    title: "สิ่งที่ต้องเตรียมเพื่อเริ่ม pilot",
    text: "เพื่อให้ ENVY Partner Club launch ได้จริง ทีม commercial ต้องเตรียม support สำคัญ 2 ส่วนก่อนเริ่มกับ Distributor",
    items: [
      {
        title: "Prepare QR codes by our site",
        text: "ใช้ ENVY CRM site สร้าง QR sticker ตาม apple size, campaign และ distributor batch"
      },
      {
        title: "CRM Reward Budget",
        text: "ทำงานร่วมกับ Trade Marketing เพื่อกำหนดงบของรางวัล, lucky draw mechanics, point cost และ approval rules"
      }
    ],
    registerCta: "Demo สมัครร้าน",
    qrCta: "สร้าง QR Batch"
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
              <p className="mt-5 max-w-3xl text-2xl font-black leading-tight text-white sm:text-4xl">
                {content.hero.subtitle}
              </p>
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

      <section id="gap" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <SlideHeading tone="ruby" kicker={content.gap.kicker} title={content.gap.title} text={content.gap.text} />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-2">
            {content.gap.cards.map((card) => (
              <ProblemCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section id="flow" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading tone="light" kicker={content.flow.kicker} title={content.flow.title} text={content.flow.text} />
          <div className="pitch-stagger mt-8 grid gap-4 lg:grid-cols-5">
            {content.flow.steps.map((step, index) => (
              <FlowCard key={step.title} total={content.flow.steps.length} index={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section id="hooks" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <SlideHeading tone="ruby" kicker={content.hooks.kicker} title={content.hooks.title} text={content.hooks.text} />
          <div className="pitch-stagger mt-8 grid gap-5 lg:grid-cols-2">
            {content.hooks.cards.map((card) => (
              <CampaignHookCard key={card.title} {...card} />
            ))}
          </div>
          <p className="m-0 mt-5 rounded-2xl border border-[#650013]/10 bg-[#fff8fa] p-4 text-sm font-bold text-[#151313]/62">
            {content.hooks.disclaimer}
          </p>
        </div>
      </section>

      <section id="journey" data-pitch-section className="pitch-slide pitch-slide-light pitch-reveal">
        <div className="pitch-slide-card bg-white">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <SlideHeading tone="ruby" kicker={content.journey.kicker} title={content.journey.title} text={content.journey.text} />
              <div className="pitch-stagger mt-7 grid gap-3">
                {content.journey.steps.map((step, index) => (
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
                <p className="mt-6 text-xs font-black uppercase text-[#f5d58c]">{content.journey.phoneKicker}</p>
                <h3 className="mt-2 text-3xl font-black">{content.journey.storeName}</h3>
                <p className="mt-1 text-white/70">{content.journey.pointsLabel}</p>
                <p className="mt-2 text-6xl font-black">240</p>
              </div>
              <div className="pitch-stagger mt-4 grid gap-3">
                <PhoneAction icon={<QrCode size={22} />} title={content.journey.actions[0]} />
                <PhoneAction icon={<Gift size={22} />} title={content.journey.actions[1]} />
                <PhoneAction icon={<Megaphone size={22} />} title={content.journey.actions[2]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="governance" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading tone="light" kicker={content.governance.kicker} title={content.governance.title} text={content.governance.text} />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-3">
            {content.governance.cards.map((card) => (
              <ControlCard key={card.title} {...card} dark />
            ))}
          </div>
          <p className="m-0 mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 font-bold text-white">
            {content.governance.note}
          </p>
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
                    <p className="m-0 text-2xl font-black" style={{ color: ruby }}>{card.value}</p>
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
                  <p className="m-0 mt-5 text-xs font-black uppercase text-white/50">{content.dashboard.panelKicker}</p>
                  <h3 className="m-0 mt-2 text-2xl font-black">{content.dashboard.panelTitle}</h3>
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

      <section id="pilot" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <SlideHeading tone="light" kicker={content.pilot.kicker} title={content.pilot.title} text={content.pilot.text} />
          <div className="pitch-stagger mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {content.pilot.weeks.map((week) => (
              <div key={week.week} className="rounded-[26px] border border-white/15 bg-white/10 p-5 text-white">
                <p className="m-0 text-sm font-black uppercase text-[#f5d58c]">{week.week}</p>
                <h3 className="m-0 mt-2 text-2xl font-black">{week.title}</h3>
                <ul className="m-0 mt-4 grid gap-3 p-0">
                  {week.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm font-bold leading-6 text-white">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#f5d58c]" size={17} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[26px] bg-white p-5 text-[#151313]">
            <p className="m-0 text-xs font-black uppercase" style={{ color: ruby }}>{content.pilot.outcomeKicker}</p>
            <p className="m-0 mt-2 text-lg font-black leading-7">{content.pilot.outcome}</p>
          </div>
        </div>
      </section>

      <section id="support" data-pitch-section className="pitch-slide pitch-slide-red pitch-reveal">
        <div className="pitch-slide-card pitch-slide-card-red">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <SlideHeading tone="light" kicker={content.support.kicker} title={content.support.title} text={content.support.text} />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-[#7a0016] no-underline">
                  {content.support.registerCta}
                </Link>
                <Link href="/admin/qr-generator" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#151313] px-5 py-4 font-black text-white no-underline">
                  {content.support.qrCta}
                </Link>
              </div>
            </div>
            <div className="pitch-stagger grid gap-4">
              {content.support.items.map((item, index) => (
                <div key={item.title} className="rounded-[28px] border border-white/15 bg-white p-6 text-[#151313] shadow-[0_24px_70px_rgba(21,19,19,.18)]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ background: index === 0 ? forest : ruby }}>
                      {index === 0 ? <QrCode size={23} /> : <Gift size={23} />}
                    </span>
                    <div>
                      <p className="m-0 text-xl font-black">{item.title}</p>
                      <p className="m-0 mt-2 text-sm font-semibold leading-6 text-[#151313]/65">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
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
      <span className="pitch-envy-product">Partner Club</span>
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

function CampaignHookCard({
  accent,
  highlight,
  title,
  subtitle,
  text
}: {
  accent: "gold" | "purple";
  highlight: string;
  title: string;
  subtitle: string;
  text: string;
}) {
  const isGold = accent === "gold";
  const accentColor = isGold ? "#d9b76f" : "#9f7aea";
  const background = isGold
    ? "linear-gradient(135deg, #fff8e4, #ffffff 45%, #fff1f4)"
    : "linear-gradient(135deg, #f6efff, #ffffff 45%, #fff1f4)";

  return (
    <div className="pitch-flow-card rounded-[30px] border border-[#650013]/10 p-6 shadow-[0_20px_70px_rgba(101,0,19,.12)]" style={{ background }}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: isGold ? champagne : purple }}>
          {isGold ? <Award size={25} /> : <Ticket size={25} />}
        </span>
        <span className="rounded-full px-3 py-2 text-xs font-black uppercase text-white" style={{ background: isGold ? champagne : purple }}>
          {highlight}
        </span>
      </div>
      <h3 className="m-0 mt-7 text-4xl font-black leading-tight" style={{ color: isGold ? "#8a5a00" : purple }}>
        {title}
      </h3>
      <p className="m-0 mt-3 text-sm font-black uppercase" style={{ color: accentColor }}>{subtitle}</p>
      <p className="m-0 mt-4 text-base font-semibold leading-7 text-[#151313]/70">{text}</p>
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
