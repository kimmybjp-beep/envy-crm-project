import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Gift, Megaphone, ScanLine, Star, Store as StoreIcon } from "lucide-react";
import { HeroCard, SalesShell } from "@/components/sales-shell";
import { getSupabaseClient } from "@/lib/supabase";
import type { AdminMessage, Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cookieStore = await cookies();
  const storeId = cookieStore.get("envy_store_id")?.value;

  if (!storeId) redirect("/login");

  const supabase = getSupabaseClient();
  const [{ data: store }, { data: adminMessage }] = await Promise.all([
    supabase.from("stores").select("*").eq("id", storeId).single<Store>(),
    supabase
      .from("admin_messages")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AdminMessage>()
  ]);

  if (!store || store.status !== "APPROVED") redirect("/login?message=not-approved");

  return (
    <SalesShell title="ENVY Reward Home" subtitle="Store reward dashboard for approved Apple ENVY outlets">
      <div className="space-y-5">
        <HeroCard>
          <p className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">Approved Store</p>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/65">ชื่อร้าน</p>
              <h2 className="mt-2 text-4xl font-black">{store.name}</h2>
              <p className="mt-2 text-white/70">{store.tier} - {store.phone}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 text-ruby-900 shadow-lg">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]"><Star size={16} />แต้มสะสม</p>
              <p className="mt-1 text-5xl font-black">{store.points}</p>
            </div>
          </div>
        </HeroCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/scan" className="rounded-[24px] bg-white p-6 shadow-luxury ring-1 ring-ruby-900/10 transition hover:-translate-y-0.5">
            <ScanLine className="mb-5 rounded-2xl bg-ruby-900 p-3 text-white" size={54} />
            <p className="text-2xl font-black text-charcoal">สแกน</p>
            <p className="mt-2 text-sm text-charcoal/60">สแกน QR เพื่อสะสมแต้มและบันทึก reward activity</p>
          </Link>
          <Link href="/rewards" className="rounded-[24px] bg-white p-6 shadow-luxury ring-1 ring-ruby-900/10 transition hover:-translate-y-0.5">
            <Gift className="mb-5 rounded-2xl bg-ruby-900 p-3 text-white" size={54} />
            <p className="text-2xl font-black text-charcoal">แลกของรางวัล</p>
            <p className="mt-2 text-sm text-charcoal/60">ใช้แต้มสะสมแลก reward campaign</p>
          </Link>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-luxury ring-1 ring-ruby-900/10">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-champagne/20 text-ruby-900"><Megaphone /></span>
            <div>
              <p className="font-black text-charcoal">ข้อความจาก Admin</p>
              <p className="mt-1 text-charcoal/65">{adminMessage?.message ?? "ยังไม่มีประกาศใหม่จากทีม ENVY"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-white/70 p-5 ring-1 ring-ruby-900/10">
          <div className="flex items-center gap-3 text-sm font-bold text-ruby-900">
            <StoreIcon size={18} />
            Store ID: {store.id}
          </div>
        </div>
      </div>
    </SalesShell>
  );
}
