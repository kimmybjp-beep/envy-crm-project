import { Gift } from "lucide-react";
import { SalesShell } from "@/components/sales-shell";

export default function RewardsPage() {
  return (
    <SalesShell title="Rewards" subtitle="Redeem campaign rewards with collected points">
      <div className="rounded-[24px] bg-white p-6 shadow-luxury ring-1 ring-ruby-900/10">
        <Gift className="mb-5 rounded-2xl bg-ruby-900 p-3 text-white" size={56} />
        <h2 className="text-2xl font-black text-charcoal">ระบบแลกของรางวัล</h2>
        <p className="mt-2 text-charcoal/65">หน้านี้เตรียมไว้สำหรับ reward catalog, redemption rules, และประวัติการแลกของรางวัล</p>
      </div>
    </SalesShell>
  );
}
