import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Gift, Star } from "lucide-react";
import { redeemRewardAction } from "@/app/actions/rewards";
import { MessageBanner } from "@/components/message-banner";
import { HeroCard, SalesShell } from "@/components/sales-shell";
import { getSupabaseClient } from "@/lib/supabase";
import type { Reward, Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RewardsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const cookieStore = await cookies();
  const storeId = cookieStore.get("envy_store_id")?.value;

  if (!storeId) redirect("/login");

  const supabase = getSupabaseClient();
  const [{ data: store }, { data: rewards }] = await Promise.all([
    supabase.from("stores").select("*").eq("id", storeId).single<Store>(),
    supabase
      .from("rewards")
      .select("*")
      .eq("is_active", true)
      .order("points_required", { ascending: true })
      .returns<Reward[]>()
  ]);

  if (!store || store.status !== "APPROVED") redirect("/login?message=not-approved");

  return (
    <SalesShell title="Rewards" subtitle="ใช้แต้มสะสมแลกของรางวัลจาก Apple ENVY">
      <MessageBanner message={message} />
      <div className="space-y-5">
        <HeroCard>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                Reward Catalog
              </p>
              <h2 className="mt-5 text-3xl font-black">{store.name}</h2>
              <p className="mt-2 text-white/70">เลือกของรางวัล แล้วระบบจะหักแต้มและส่งคำขอให้ Back Office ตรวจสอบ</p>
            </div>
            <div className="rounded-3xl bg-white p-5 text-ruby-900 shadow-lg">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
                <Star size={16} /> Points
              </p>
              <p className="mt-1 text-5xl font-black">{store.points}</p>
            </div>
          </div>
        </HeroCard>

        <section className="grid gap-4 sm:grid-cols-2">
          {(rewards ?? []).length ? rewards?.map((reward) => {
            const canRedeem = store.points >= reward.points_required && reward.stock > 0;

            return (
              <article key={reward.id} className="rounded-[24px] bg-white p-5 shadow-luxury ring-1 ring-ruby-900/10">
                <Gift className="mb-4 rounded-2xl bg-ruby-900 p-3 text-white" size={54} />
                <h3 className="text-2xl font-black text-charcoal">{reward.name}</h3>
                {reward.description ? <p className="mt-2 text-sm text-charcoal/60">{reward.description}</p> : null}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-charcoal/45">Required</p>
                    <p className="text-2xl font-black text-ruby-900">{reward.points_required} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-charcoal/45">Stock</p>
                    <p className="text-lg font-black text-charcoal">{reward.stock}</p>
                  </div>
                </div>
                <form action={redeemRewardAction} className="mt-5">
                  <input type="hidden" name="rewardId" value={reward.id} />
                  <button
                    disabled={!canRedeem}
                    className="w-full rounded-2xl bg-ruby-900 px-5 py-4 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:bg-charcoal/25"
                  >
                    {canRedeem ? "แลกของรางวัล" : reward.stock < 1 ? "ของหมด" : "แต้มยังไม่พอ"}
                  </button>
                </form>
              </article>
            );
          }) : (
            <div className="rounded-[24px] bg-white p-6 shadow-luxury ring-1 ring-ruby-900/10">
              <Gift className="mb-4 rounded-2xl bg-ruby-900 p-3 text-white" size={54} />
              <h2 className="text-2xl font-black text-charcoal">ยังไม่มีของรางวัล</h2>
              <p className="mt-2 text-charcoal/60">รอ Back Office เพิ่มรายการที่หน้า Admin Rewards</p>
            </div>
          )}
        </section>
      </div>
    </SalesShell>
  );
}
