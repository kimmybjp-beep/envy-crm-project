const checklistSections = [
  {
    title: "Database & Supabase",
    code: "DB",
    level: "Critical",
    items: [
      "ตารางหลักพร้อมใช้งาน: stores, scans, qr_batches, qr_codes, rewards, redemptions, fraud_alerts",
      "Unique constraint กันสแกนซ้ำใน tier เดิมทำงานจริง",
      "Storage bucket รูปหน้าร้าน upload/read ได้"
    ]
  },
  {
    title: "Store Registration",
    code: "01",
    level: "Critical",
    items: [
      "สมัครร้านใหม่ได้ โดยไม่มีช่อง Tier ให้ร้านเห็น",
      "ถ่ายรูปหน้าร้านจากมือถือได้ และมีข้อความกำกับให้ถ่ายเห็นป้ายชื่อร้าน",
      "หลังสมัครขึ้น popup: ลงทะเบียนร้านเรียบร้อย โปรดรอ อนุมัติ"
    ]
  },
  {
    title: "Admin Approval",
    code: "02",
    level: "Critical",
    items: [
      "Admin เห็นข้อมูลร้าน เบอร์ สถานะ รูปหน้าร้าน preview และ action ชัดเจน",
      "Approve / Reject ใช้งานได้ และร้านที่ยังไม่อนุมัติ Login/Scan ไม่ได้",
      "Back Office reset password ให้ร้านได้"
    ]
  },
  {
    title: "Store Login & Home",
    code: "03",
    level: "User Flow",
    items: [
      "ร้าน Login ด้วยเบอร์ + password ได้ เฉพาะร้าน approved",
      "Home แสดงชื่อร้าน แต้มสะสม ปุ่ม Scan ปุ่ม Rewards และข้อความจาก Admin",
      "ไม่มีข้อความ Tier ใน UI ร้านค้า"
    ]
  },
  {
    title: "QR Generator",
    code: "QR",
    level: "Critical",
    items: [
      "กรอก Distributor + จำนวน แล้วสร้าง QR unique 18 หลักได้",
      "ข้อมูล batch และ code ถูกบันทึกใน Supabase",
      "ดาวน์โหลด ZIP รูป QR ได้ และ QR อ่านด้วยมือถือจริงได้"
    ]
  },
  {
    title: "Live Camera Scan",
    code: "04",
    level: "Critical",
    items: [
      "Live camera scan ใช้งานบนมือถือจริง: Android Chrome และ iPhone Safari/Chrome",
      "สแกน QR ใหม่แล้วแต้มเพิ่ม และบันทึก scan สำเร็จ",
      "สแกนซ้ำในร้าน/tier เดิมแล้วระบบไม่ให้ผ่าน พร้อม log fraud alert ให้ Admin"
    ]
  },
  {
    title: "Rewards & Fulfillment",
    code: "05",
    level: "Critical",
    items: [
      "Admin เพิ่ม/แก้ reward ได้ และร้านเห็นรายการรางวัล",
      "ร้านแลกรางวัลได้เมื่อแต้มพอ และแต้มถูกหักถูกต้อง",
      "Admin เห็นรายการค้างจ่าย และกดทำจ่าย/จัดส่งแล้วได้"
    ]
  },
  {
    title: "Dashboard & Sales Tree",
    code: "06",
    level: "Ops",
    items: [
      "Dashboard filter by day/week/month/tier ได้",
      "เห็น Total Rewards Claimed, Pending Fulfillment, Successful Fulfills",
      "Sales Tree แสดง flow Distributor ไป Tier 2 ไป Tier 3 จากข้อมูล scan จริง"
    ]
  },
  {
    title: "LINE Bot & Summary",
    code: "LN",
    level: "Ops",
    items: [
      "คำสั่ง LINE ใช้งานได้: สรุป, summary, groupid, ขอรหัสกลุ่มหน่อย",
      "Bot ไม่ spam group เมื่อคนคุยเรื่องอื่น",
      "ลิงก์จาก LINE เปิด external browser ด้วย openExternalBrowser=1"
    ]
  },
  {
    title: "Export & Raw Data",
    code: "CSV",
    level: "Report",
    items: [
      "Admin Database page เห็น raw data ที่จำเป็น",
      "Export CSV เปิดใน Excel/Google Sheets แล้วหัวตารางไม่เพี้ยน",
      "ข้อมูล scan/reward/store ตรงกับ Supabase"
    ]
  },
  {
    title: "Mobile QA",
    code: "UI",
    level: "Critical",
    items: [
      "ทดสอบจอ iPhone/Android จริง: Register, Login, Scan, Rewards",
      "ไม่มีข้อความทับกัน ปุ่มไม่ตกขอบ bottom nav ไม่บังปุ่มหลัก",
      "เปิดจาก LINE แล้วไม่ติด Google OAuth blocked / disallowed useragent"
    ]
  },
  {
    title: "Production Env",
    code: "ENV",
    level: "Critical",
    items: [
      "Vercel env ครบ: Supabase URL/Anon/Service Role, LINE token/secret/group id, Gemini key",
      "Build ล่าสุดบน Vercel เป็น READY และ URL production ถูกต้อง",
      "ทดสอบด้วยข้อมูลจริง 1 ชุดก่อนประกาศใช้งาน"
    ]
  }
];

const rehearsalSteps = [
  "Register ร้านใหม่ + ถ่ายรูปหน้าร้าน",
  "Admin ตรวจรูป และ Approve",
  "ร้าน Login เข้า Home",
  "Admin Generate QR batch",
  "ร้านสแกน QR ด้วย Live Camera",
  "ตรวจแต้ม + กัน QR ซ้ำ",
  "ร้านแลกรางวัล / Admin ทำจ่าย",
  "Dashboard + LINE + Export ถูกต้อง"
];

export default function GoLiveChecklistPage() {
  return (
    <main className="min-h-screen bg-[#fff1f4] text-[#171012]">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_84%_30%,rgba(255,255,255,.42),transparent_7%),radial-gradient(circle_at_88%_40%,#f31d45,#99001f_45%,#4b000f_72%),linear-gradient(135deg,#5a0012,#c2002f)] px-6 py-8 text-white shadow-2xl shadow-[#730016]/20 sm:px-10 sm:py-12">
          <div className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#d8b56d]">
            ENVY Reward CRM · Go Live Control
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl">
            Checklist ก่อน Go Live
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-white/85 sm:text-lg">
            ใช้หน้านี้ให้ทีมงานติ๊กตรวจระบบก่อนเปิดใช้งานจริง ครบทั้งฐานข้อมูล, สมัครร้าน, สแกน QR, แลกรางวัล, Dashboard, LINE Bot และ Export รายงาน
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["12", "หมวดที่ต้องตรวจ"],
            ["1", "รอบซ้อมใหญ่เต็มระบบ"],
            ["0", "QR ซ้ำใน Tier เดิม"],
            ["100%", "มือถือทีมงานต้องลองจริง"]
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-[#efd0d7] bg-white/90 p-5 shadow-xl shadow-[#730016]/10">
              <div className="text-4xl font-black leading-none text-[#c2002f]">{value}</div>
              <div className="mt-2 text-sm font-extrabold text-[#6f6265]">{label}</div>
            </div>
          ))}
        </div>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {checklistSections.map((section) => (
            <article key={section.title} className="overflow-hidden rounded-3xl border border-[#efd0d7] bg-white/90 shadow-xl shadow-[#730016]/10">
              <div className="flex items-center justify-between gap-4 border-b border-[#efd0d7] bg-gradient-to-b from-white to-[#fff7f9] p-5">
                <h2 className="flex items-center gap-3 text-xl font-black text-[#8f001f]">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c2002f] text-sm text-white">
                    {section.code}
                  </span>
                  {section.title}
                </h2>
                <span className={`rounded-full px-3 py-2 text-[11px] font-black uppercase ${section.level === "Critical" ? "bg-[#ffe3e8] text-[#c2002f]" : "bg-[#fff0c7] text-[#7b4d00]"}`}>
                  {section.level}
                </span>
              </div>
              <div className="space-y-3 p-5">
                {section.items.map((item) => (
                  <label key={item} className="grid grid-cols-[24px_1fr] gap-3 text-sm font-bold leading-6 text-[#2a2022]">
                    <input className="mt-1 h-5 w-5 accent-[#c2002f]" type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
                <div className="grid gap-2 border-t border-dashed border-[#efd0d7] pt-3 sm:grid-cols-[1fr_1fr_1.5fr]">
                  {["Owner", "Result", "Notes"].map((field) => (
                    <div key={field} className="min-h-11 rounded-xl border border-dashed border-[#d9a7b2] px-3 py-2 text-xs font-extrabold text-[#6f6265]">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-3xl border border-[#efd0d7] bg-white/90 p-5 shadow-xl shadow-[#730016]/10">
          <h2 className="text-2xl font-black text-[#8f001f]">Full Rehearsal Flow: ซ้อมใหญ่ 1 รอบก่อนเปิดจริง</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rehearsalSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-[#efd0d7] bg-gradient-to-b from-white to-[#fff7f9] p-4 text-sm font-black leading-5">
                <span className="mb-3 grid h-8 w-8 place-items-center rounded-xl bg-[#c2002f] text-white">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[#efd0d7] bg-white/90 p-5 shadow-xl shadow-[#730016]/10">
          <h2 className="text-2xl font-black text-[#8f001f]">Go / No-Go Sign Off</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["Back Office Lead", "Field Sales Lead", "System Owner"].map((role) => (
              <div key={role} className="min-h-28 rounded-2xl border border-dashed border-[#d9a7b2] p-4 text-sm font-extrabold text-[#6f6265]">
                {role}
                <br />
                <br />
                ชื่อ / วันที่:
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold text-[#6f6265]">
            สำหรับพิมพ์เป็น PDF: กด Ctrl+P หรือใช้เมนู Print ของ browser แล้วเลือก Save as PDF
          </p>
        </section>
      </section>
    </main>
  );
}
